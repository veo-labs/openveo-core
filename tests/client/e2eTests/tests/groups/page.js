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
    assert.isFulfilled(page.getLine(name));
    assert.eventually.isDefined(page.getLineFieldText(name, 'description'));
    assert.eventually.equal(page.getLineFieldText(name, 'description'), description);
    page.removeLine(name);
  });

  it('should not be able to add a group with no name', function() {
    page.openAddForm();
    assert.eventually.notOk(page.addButtonElement.isEnabled());
    page.closeAddForm();
  });

  it('should not be able to add a group with no description', function() {
    assert.isRejected(page.addLine('Name'));
  });

  it('should not display buttons to change the number of items per page if groups lower than 6', function() {
    page.getTotalLines().then(function(totalLines) {
      if (totalLines < 6)
        assert.eventually.equal(page.itemsPerPageLinkElements.count(), 0);
    });
  });

  it('should be able to edit a group', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var description = 'test edition description';
    var newDescription = 'test edition description renamed';

    // Create line
    page.addLine(name, description);

    // Edit group with a new name
    page.editGroup(name, {name: newName, description: newDescription});
    assert.isFulfilled(page.getLine(newName));
    assert.eventually.equal(page.getLineFieldText(newName, 'description'), newDescription);

    page.removeLine(newName);
  });

  it('should be able to cancel when removing a group', function() {
    return tableAssert.checkCancelRemove();
  });

  it('should be able to sort by name', function() {
    return tableAssert.checkSort(page.translations.CORE.GROUPS.NAME_COLUMN);
  });

  it('should have buttons to change the number of items per page', function() {
    return tableAssert.checkItemsPerPage();
  });

  it('should be able to remove several lines simultaneously', function() {
    return tableAssert.checkMassiveRemove();
  });

  it('should be paginated', function() {
    return tableAssert.checkPagination();
  });

  it('should be able to select lines', function() {
    return tableAssert.checkLinesSelection(page.translations.CORE.GROUPS.NAME_COLUMN);
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
