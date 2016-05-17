'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoTest = require('@openveo/test');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var check = openVeoTest.util.check;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Web service', function() {
  var page;
  var clientWithoutAccess;
  var clientWithoutCredentials;

  // Initiliaze different clients
  before(function() {
    var application;
    var webServiceUrl = process.protractorConf.webServiceUrl;

    // Application without any access
    application = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGuest.name
    );
    clientWithoutAccess = new OpenVeoClient(webServiceUrl, application.id, application.secret);

    // Application with wrong credentials
    clientWithoutCredentials = new OpenVeoClient(webServiceUrl, 'wrong id', 'wrong secret');
  });

  before(function() {
    page = new HomePage();
    page.logAsAdmin();
    page.load();
  });

  // Logout when its done
  after(function() {
    page.logout();
  });

  it('should return an HTTP forbidden without get permission', function(done) {
    clientWithoutAccess.get('groups/something').then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected get results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 403, 'Expected get access to be refused');
      }, done);
    });
  });

  it('should return an HTTP forbidden without put permission', function(done) {
    clientWithoutAccess.put('groups', {}).then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected put results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 403, 'Expected put access to be refused');
      }, done);
    });
  });

  it('should return an HTTP forbidden without post permission', function(done) {
    clientWithoutAccess.post('groups/something', {}).then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected post results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 403, 'Expected post access to be refused');
      }, done);
    });
  });

  it('should return an HTTP forbidden without post permission', function(done) {
    clientWithoutAccess.delete('groups/something').then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected delete results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 403, 'Expected delete access to be refused');
      }, done);
    });
  });

  it('should return an HTTP unauthorized, if credentials are wrong, for a get request', function(done) {
    clientWithoutCredentials.get('groups/something').then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected get results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 401, 'Expected get access to be refused');
      }, done);
    });
  });

  it('should return an HTTP unauthorized, if credentials are wrong, for a put request', function(done) {
    clientWithoutCredentials.put('groups', {}).then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected put results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 401, 'Expected put access to be refused');
      }, done);
    });
  });

  it('should return an HTTP unauthorized, if credentials are wrong, for a post request', function(done) {
    clientWithoutCredentials.post('groups', {}).then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected post results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 401, 'Expected post access to be refused');
      }, done);
    });
  });

  it('should return an HTTP unauthorized, if credentials are wrong, for a delete request', function(done) {
    clientWithoutCredentials.delete('groups/something').then(function(results) {
      check(function() {
        assert.ok(false, 'Unexpected delete results');
      }, done);
    }).catch(function(error) {
      check(function() {
        assert.equal(error.httpCode, 401, 'Expected delete access to be refused');
      }, done);
    });
  });

});
