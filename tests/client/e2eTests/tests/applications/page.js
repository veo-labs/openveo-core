'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var ApplicationPage = process.require('tests/client/e2eTests/pages/ApplicationPage.js');
var ClientModel = process.require('app/server/models/ClientModel.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var storage = process.require('app/server/storage.js');
var ApplicationHelper = process.require('tests/client/e2eTests/helpers/ApplicationHelper.js');
var TableAssert = e2e.asserts.TableAssert;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Application page', function() {
  var page, tableAssert, defaultApplications, applicationHelper;

  // Prepare page
  before(function() {
    var clientModel = new ClientModel(new ClientProvider(storage.getDatabase()));
    applicationHelper = new ApplicationHelper(clientModel);
    page = new ApplicationPage(clientModel);
    tableAssert = new TableAssert(page, applicationHelper);
    page.logAsAdmin();
    applicationHelper.getEntities().then(function(applications) {
      defaultApplications = applications;
    });
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Remove all extra applications after each test then reload the page
  afterEach(function() {
    process.protractorConf.startOpenVeo();
    applicationHelper.removeAllEntities(defaultApplications);
    page.refresh();
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleElement.isPresent());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionElement.isPresent());
  });

  it('should propose scopes as defined in configuration', function() {
    assert.eventually.sameMembers(page.getAvailableScopes(), applicationHelper.getScopes(page.translations));
  });

  it('should be able to add / remove an application', function() {
    var name = 'test add / remove application';
    page.addLine(name, applicationHelper.getScopes(page.translations));
    assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
    assert.eventually.notEmpty(page.getApplicationClientId(name));
    assert.eventually.notEmpty(page.getApplicationClientKey(name));
    page.getLineFieldText(name, 'scopes').then(function(scopesText) {
      assert.sameMembers(scopesText.split(', '), applicationHelper.getScopes(page.translations));
    });
    page.removeLine(name);
    assert.isRejected(page.getLine(name));
  });

  it('should indicate "Not set" if no scopes in the application', function() {
    var name = 'test add no scopes application';
    page.addLine(name);
    assert.eventually.equal(page.getLineFieldText(name, 'scopes'), page.translations.CORE.UI.EMPTY);
    page.removeLine(name);
  });

  it('should display an error if adding an application failed on server side', function() {
    var name = 'test add error';

    process.protractorConf.stopOpenVeo();
    page.addLine(name);

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    process.protractorConf.startOpenVeo();
    assert.isRejected(page.getLine(name));
  });

  it('should display an error if removing an application failed on server side', function() {
    var name = 'test remove error';

    page.addLine(name);

    // Search for the line before stopping the server
    page.search({query: name});

    process.protractorConf.stopOpenVeo();
    page.removeLine(name);

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    assert.isFulfilled(page.getLine(name));
  });

  it('should not be able to add an application without a name', function() {
    page.openAddForm();
    assert.eventually.notOk(page.addButtonElement.isEnabled());
    page.closeAddForm();
  });

  it('should be able to edit an application', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var scopes = applicationHelper.getScopes(page.translations);
    var newScopes = scopes.slice(0, scopes.length - 2);

    // Create line
    page.addLine(name, scopes);

    // Edit application with a new name
    page.editApplication(name, {name: newName, scopes: newScopes});
    assert.eventually.notOk(page.isOpenedLine(newName));
    assert.eventually.equal(page.getLineFieldText(newName, 'name'), newName);
    page.getLineFieldText(newName, 'scopes').then(function(scopesText) {
      assert.sameMembers(scopesText.split(', '), newScopes);
    });

  });

  it('should be able to cancel when editing an application', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var scopes = applicationHelper.getScopes(page.translations);
    var newScopes = scopes.slice(0, scopes.length - 2);

    // Create line
    page.addLine(name, scopes);

    // Edit application with a new name and cancel
    page.editApplication(name, {name: newName, scopes: newScopes}, true);
    assert.eventually.ok(page.isOpenedLine(name));

    assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
    page.getLineFieldText(name, 'scopes').then(function(scopesText) {
      assert.sameMembers(scopesText.split(', '), scopes);
    });
  });

  it('should not be able to update an application without a name', function() {
    var name = 'test edition without a name';

    // Create line
    page.addLine(name);

    assert.isRejected(page.editApplication(name, {name: ''}));
  });

  it('should be able to cancel when removing an application', function() {
    tableAssert.checkCancelRemove();
  });

  it('should be able to sort by name', function() {
    tableAssert.checkSort(page.translations.CORE.APPLICATIONS.NAME_COLUMN);
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

  it('should have actions to remove applications', function() {
    tableAssert.checkActions([
      page.translations.CORE.UI.REMOVE
    ]);
  });

  describe('search', function() {
    var lines;

    // Add lines
    beforeEach(function() {
      return applicationHelper.addEntitiesAuto('test search', 2).then(function(addedLines) {
        lines = addedLines;
        return page.refresh();
      });
    });

    it('should be able to search by full name', function() {
      var expectedValues;
      var search = {query: lines[0].name};

      // Get all line values before search
      return page.getLineValues(page.translations.CORE.APPLICATIONS.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return element === search.query;
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.CORE.APPLICATIONS.NAME_COLUMN);
      });
    });

    it('should not be able to search by partial name', function() {
      var search = {query: lines[1].name.slice(0, 2)};

      page.search(search);
      assert.isRejected(page.getLineValues(page.translations.CORE.APPLICATIONS.NAME_COLUMN));
    });

    it('should be case insensitive', function() {
      var expectedValues;
      var search = {query: lines[1].name.toUpperCase()};

      // Get all line values before search
      return page.getLineValues(page.translations.CORE.APPLICATIONS.NAME_COLUMN).then(function(values) {
        var regexp = new RegExp(search.query, 'i');

        // Predict values
        expectedValues = values.filter(function(element) {
          return regexp.test(element);
        });

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.CORE.APPLICATIONS.NAME_COLUMN);
      });
    });

    it('should be able to clear search', function() {
      var search = {query: lines[0].name};
      page.search(search);
      page.clearSearch();
      assert.isFulfilled(page.getLineValues(page.translations.CORE.APPLICATIONS.NAME_COLUMN));
    });

  });

});
