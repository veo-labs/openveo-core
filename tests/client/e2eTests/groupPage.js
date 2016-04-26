'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var GroupPage = process.require('tests/client/e2eTests/pages/GroupPage.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');
var TableAssert = e2e.asserts.TableAssert;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Group page', function() {
  var page, tableAssert, groupHelper, defaultGroups;

  // Prepare page
  before(function() {
    var groupModel = new GroupModel();
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
  });

  it('should be able to cancel when removing a group', function() {
    return tableAssert.checkCancelRemove();
  });

  it('should be able to sort by name', function() {
    return tableAssert.checkSort(page.translations.GROUPS.NAME_COLUMN);
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
    return tableAssert.checkLinesSelection(page.translations.GROUPS.NAME_COLUMN);
  });

  describe('Search', function() {
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
      var search = {name: lines[0].name};

      // Get all line values before search
      return page.getLineValues(page.translations.GROUPS.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return element === search.name;
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.GROUPS.NAME_COLUMN);
      });
    });

    it('should be able to search by partial name', function() {
      var expectedValues;
      var search = {name: lines[1].name.slice(0, 2)};

      // Get all line values before search
      return page.getLineValues(page.translations.GROUPS.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return new RegExp(search.name).test(element);
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.GROUPS.NAME_COLUMN);
      });
    });

    it('should be able to search by full description', function() {
      var expectedValues = [];
      var search = {description: lines[0].description};

      // Get all line values before search
      return page.getAllLineDetails().then(function(datas) {

        // Predict values
        var filteredDatas = datas.filter(function(data) {
          return data.fields.description === search.description;
        });

        for (var i = 0; i < filteredDatas.length; i++)
          expectedValues.push(filteredDatas[i].cells[1]);

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.GROUPS.NAME_COLUMN);
      });
    });

    it('should be able to search by both description and name', function() {
      var expectedValues = [];
      var search = {name: lines[0].name, description: lines[0].description};

      // Get all line values before search
      return page.getAllLineDetails().then(function(datas) {

        // Predict values
        var filteredDatas = datas.filter(function(data) {
          return data.fields.name === search.name && data.fields.description === search.description;
        });

        for (var i = 0; i < filteredDatas.length; i++)
          expectedValues.push(filteredDatas[i].cells[1]);

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.GROUPS.NAME_COLUMN);
      });
    });

    it('should be case sensitive', function() {
      var search = {name: lines[1].name.toUpperCase()};

      page.search(search);
      assert.isRejected(page.getLineValues(page.translations.GROUPS.NAME_COLUMN));
    });

    it('should be able to clear search', function() {
      var search = {name: lines[0].name};
      page.search(search);
      page.clearSearch();
      assert.isFulfilled(page.getLineValues(page.translations.GROUPS.NAME_COLUMN));
    });

  });

});
