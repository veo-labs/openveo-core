'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var ApplicationPage = process.require('tests/client/e2eTests/pages/ApplicationPage.js');
var ClientModel = process.require('app/server/models/ClientModel.js');
var TableAssert = e2e.asserts.TableAssert;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Application page', function() {
  var page, tableAssert;

  before(function() {
    page = new ApplicationPage(new ClientModel());
    tableAssert = new TableAssert(page);
    page.logAsAdmin();
    page.load();
  });

  after(function() {
    page.logout();
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleElement.isPresent());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionElement.isPresent());
  });

  it('should be able to add / remove an application', function() {
    var name = 'test add / remove application';
    page.addLine(name);
    assert.isFulfilled(page.getLine(name));
    assert.eventually.isDefined(page.getApplicationClientId(name));
    assert.eventually.isDefined(page.getApplicationClientKey(name));
    assert.eventually.isDefined(page.getLineFieldText(name, 'scopes'));
    assert.eventually.notEqual(page.getLineFieldText(name, 'scopes'), page.translations.APPLICATIONS.EMPTY);
    page.removeLine(name);
  });

  it('should not be able to add an application with no name', function() {
    page.openAddForm();
    assert.eventually.notOk(page.addButtonElement.isEnabled());
    page.closeAddForm();
  });

  it('should not display buttons to change the number of items per page if applications lower than 6', function() {
    page.getTotalLines().then(function(totalLines) {
      if (totalLines < 6)
        assert.eventually.equal(page.itemsPerPageLinkElements.count(), 0);
    });
  });

  it('should be able to edit an application', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';

    // Create line
    page.addLine(name);

    // Edit application with a new name
    page.editApplication(name, {name: newName});
    assert.isFulfilled(page.getLine(newName));

    // Remove line
    page.removeLine(newName);
  });

  it('should be able to cancel when removing an application', function() {
    return tableAssert.checkCancelRemove();
  });

  it('should be able to sort by name', function() {
    return tableAssert.checkSort(page.translations.APPLICATIONS.NAME_COLUMN);
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

  describe('Search', function() {
    var lines;

    // Add lines
    before(function() {
      return page.addLinesByPassAuto('test search', 2).then(function(addedLines) {
        lines = addedLines;
      });
    });

    // Remove lines
    after(function() {
      return page.removeLinesByPass(lines);
    });

    it('should be able to search by full name', function() {
      var expectedValues;
      var search = {name: lines[0].name};

      // Get all line values before search
      return page.getLineValues(page.translations.APPLICATIONS.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return element === search.name;
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.APPLICATIONS.NAME_COLUMN);
      });
    });

    it('should be able to search by partial name', function() {
      var expectedValues;
      var search = {name: lines[1].name.slice(0, 2)};

      // Get all line values before search
      return page.getLineValues(page.translations.APPLICATIONS.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return new RegExp(search.name).test(element);
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.APPLICATIONS.NAME_COLUMN);
      });
    });

    it('should be case sensitive', function() {
      var search = {name: lines[1].name.toUpperCase()};

      page.search(search);
      assert.isRejected(page.getLineValues(page.translations.APPLICATIONS.NAME_COLUMN));
    });

    it('should be able to clear search', function() {
      var search = {name: lines[0].name};
      page.search(search);
      page.clearSearch();
      assert.isFulfilled(page.getLineValues(page.translations.APPLICATIONS.NAME_COLUMN));
    });

  });

});
