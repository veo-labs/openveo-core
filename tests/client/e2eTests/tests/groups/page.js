'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var GroupPage = process.require('tests/client/e2eTests/pages/GroupPage.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var storage = process.require('app/server/storage.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');
var TableAssert = e2e.asserts.TableAssert;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Group page', function() {
  var page, tableAssert, groupHelper, defaultGroups;

  // Prepare page
  before(function() {
    var groupModel = new GroupModel(new GroupProvider(storage.getDatabase()));
    groupHelper = new GroupHelper(groupModel);
    page = new GroupPage(groupModel);
    tableAssert = new TableAssert(page, groupHelper);
    page.logAsAdmin();
    groupHelper.getEntities().then(function(groups) {
      defaultGroups = groups;
    });
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Remove all groups after each test then reload the page
  afterEach(function() {
    groupHelper.removeAllEntities(defaultGroups);

    // After removing a group OpenVeo sub process has to be restarted to rebuild its in memory permissions
    process.protractorConf.restartOpenVeo();

    page.refresh();
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleElement.isPresent());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionElement.isPresent());
  });

  it('should be able to add / remove a group', function() {
    var name = 'test add / remove group';
    var description = 'test add / remove group description';

    page.addLine(name, description);
    assert.eventually.notOk(page.isOpenedLine());
    assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
    assert.eventually.equal(page.getLineFieldText(name, 'description'), description);
    page.removeLine(name);
    assert.isRejected(page.getLine(name));
  });

  it('should not be able to add a group without a name', function() {
    page.openAddForm();
    assert.eventually.notOk(page.addButtonElement.isEnabled());
    page.closeAddForm();
  });

  it('should not be able to add a group without a description', function() {
    assert.isRejected(page.addLine('Name'));
  });

  it('should display an error if adding a group failed on server side', function() {
    var name = 'test add error';
    var description = 'test add error';

    process.protractorConf.stopOpenVeo();
    page.addLine(name, description);

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    process.protractorConf.startOpenVeo();
    assert.isRejected(page.getLine(name));
  });

  it('should display an error if removing a group failed on server side', function() {
    var name = 'test remove error';
    var description = 'test remove error';

    page.addLine(name, description);

    // Search for the line before stopping the server
    page.search({query: name});

    process.protractorConf.stopOpenVeo();
    page.removeLine(name);

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    assert.isFulfilled(page.getLine(name));
  });

  it('should be able to edit a group', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var description = 'test edition description';
    var newDescription = 'test edition description renamed';

    page.addLine(name, description);
    page.editGroup(name, {name: newName, description: newDescription});

    assert.eventually.equal(page.getLineFieldText(newName, 'name'), newName);
    assert.eventually.equal(page.getLineFieldText(newName, 'description'), newDescription);

    page.removeLine(newName);
  });

  it('should be able to cancel when editing a group', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var description = 'test edition description';
    var newDescription = 'test edition description renamed';

    // Create line
    page.addLine(name, description);

    // Edit group with a new name and cancel
    page.editGroup(name, {name: newName, description: newDescription}, true);
    assert.eventually.ok(page.isOpenedLine(name));

    assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
    assert.eventually.equal(page.getLineFieldText(name, 'description'), description);
  });

  it('should not be able to update a group without a name', function() {
    var name = 'test edition without a name';
    var description = 'test edition without a name';

    // Create line
    page.addLine(name, description);
    assert.isRejected(page.editGroup(name, {name: ''}));
  });

  it('should not be able to update a group without a description', function() {
    var name = 'test edition without a description';
    var description = 'test edition without a description';

    // Create line
    page.addLine(name, description);
    assert.isRejected(page.editGroup(name, {description: ''}));
  });

  it('should be able to cancel when removing a group', function() {
    tableAssert.checkCancelRemove();
  });

  it('should be able to sort by name', function() {
    tableAssert.checkSort(page.translations.CORE.GROUPS.NAME_COLUMN);
  });

  it('should have buttons to change the number of items per page', function() {
    tableAssert.checkItemsPerPage();
  });

  it('should be able to remove several lines simultaneously', function() {
    tableAssert.checkMassiveRemove();
  });

  it('should be paginated', function() {
    tableAssert.checkPagination();
  });

  it('should be able to select lines', function() {
    tableAssert.checkLinesSelection();
  });

  it('should have actions to remove groups', function() {
    tableAssert.checkActions([
      page.translations.CORE.UI.REMOVE
    ]);
  });

  describe('search', function() {
    var lines;

    // Add lines
    beforeEach(function() {
      return groupHelper.addEntitiesAuto('test search', 2).then(function(addedLines) {
        lines = addedLines;
        return page.refresh();
      });
    });

    it('should be able to search by full name', function() {
      var expectedValues;
      var search = {query: lines[0].name};

      // Get all line values before search
      return page.getLineValues(page.translations.CORE.GROUPS.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return element === search.query;
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.CORE.GROUPS.NAME_COLUMN);
      });
    });

    it('should not be able to search by partial name', function() {
      var search = {query: lines[1].name.slice(0, 2)};

      page.search(search);
      assert.isRejected(page.getLineValues(page.translations.CORE.GROUPS.NAME_COLUMN));
    });

    it('should be able to search by full description', function() {
      var expectedValues = [];
      var search = {query: lines[0].description};

      // Get all line values before search
      return page.getAllLineDetails().then(function(datas) {

        // Predict values
        var filteredDatas = datas.filter(function(data) {
          return data.fields.description === search.query;
        });

        for (var i = 0; i < filteredDatas.length; i++)
          expectedValues.push(filteredDatas[i].cells[1]);

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.CORE.GROUPS.NAME_COLUMN);
      });
    });

    it('should be able to search in name and description', function() {
      var expectedValues = [];
      var linesToAdd = [
        {
          name: 'first name',
          description: 'first name description'
        },
        {
          name: 'second name',
          description: 'second description after first'
        }
      ];

      // Add lines
      groupHelper.addEntities(linesToAdd);
      page.refresh();

      var search = {query: 'first'};

      // Get all line values before search
      return page.getAllLineDetails().then(function(datas) {
        var regexp = new RegExp('\\b' + search.query + '\\b');

        // Predict values
        var filteredDatas = datas.filter(function(data) {
          return regexp.test(data.fields.description) || regexp.test(data.fields.name);
        });

        for (var i = 0; i < filteredDatas.length; i++)
          expectedValues.push(filteredDatas[i].cells[1]);

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.CORE.GROUPS.NAME_COLUMN);
      });
    });

    it('should be case insensitive', function() {
      var expectedValues;
      var search = {query: lines[1].name.toUpperCase()};

      // Get all line values before search
      return page.getLineValues(page.translations.CORE.GROUPS.NAME_COLUMN).then(function(values) {
        var regexp = new RegExp(search.query, 'i');

        // Predict values
        expectedValues = values.filter(function(element) {
          return regexp.test(element);
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.CORE.GROUPS.NAME_COLUMN);
      });
    });

    it('should be able to clear search', function() {
      var search = {query: lines[0].name};
      page.search(search);
      page.clearSearch();
      assert.isFulfilled(page.getLineValues(page.translations.CORE.GROUPS.NAME_COLUMN));
    });

  });

});
