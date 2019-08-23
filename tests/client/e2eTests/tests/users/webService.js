'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoTest = require('@openveo/test');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var UserProvider = process.require('app/server/providers/UserProvider.js');
var UserHelper = process.require('tests/client/e2eTests/helpers/UserHelper.js');
var storage = process.require('app/server/storage.js');
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var check = openVeoTest.util.check;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Users web service', function() {
  var page;
  var webServiceClient;
  var helper;
  var defaultUsers;

  before(function() {
    var userProvider = new UserProvider(storage.getDatabase());
    var application = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsUsers.name
    );

    helper = new UserHelper(userProvider);
    page = new HomePage();
    webServiceClient = new OpenVeoClient(process.protractorConf.webServiceUrl, application.id, application.secret);

    page.logAsAdmin();

    helper.getEntities().then(function(users) {
      defaultUsers = users;
    });

    page.load();
  });

  // Logout when its done
  after(function() {
    page.logout();
  });

  // Remove all users after each test
  afterEach(function() {
    helper.removeAllEntities(defaultUsers);
  });

  describe('get /users', function() {

    it('should be able to filter by email', function(done) {
      var usersToAdd = [
        {
          id: '1',
          name: 'filter-by-email-1',
          email: 'filter-by-email-1@veo-labs.com',
          password: 'filter-by-email-1',
          passwordValidate: 'filter-by-email-1'
        },
        {
          id: '2',
          name: 'filter-by-email-2',
          email: 'filter-by-email-2@veo-labs.com',
          password: 'filter-by-email-2',
          passwordValidate: 'filter-by-email-2'
        },
        {
          id: '3',
          name: 'filter-by-email-3',
          email: 'filter-by-email-3@veo-labs.com',
          password: 'filter-by-email-3',
          passwordValidate: 'filter-by-email-3'
        }
      ];
      helper.addEntities(usersToAdd).then(function() {
        return webServiceClient.get('users?email=' + usersToAdd[0].email);
      }).then(function(results) {
        var entity = results.entities[0];

        check(function() {
          assert.equal(results.entities.length, 1, 'Wrong total');
          assert.equal(entity.name, usersToAdd[0].name, 'Wrong user');
        }, done, true);

        return webServiceClient.get('users?email[]=' + usersToAdd[0].email + '&email[]=' + usersToAdd[2].email);
      }).then(function(results) {
        check(function() {
          assert.equal(results.entities.length, 2, 'Wrong total');
          assert.sameMembers(
            [results.entities[0].id, results.entities[1].id],
            [usersToAdd[0].id, usersToAdd[2].id],
            'Wrong users'
          );
        }, done);
      }).catch(function(error) {
        check(function() {
          assert.ok(false, 'Unexpected error : ' + error.message);
        }, done);
      });
    });

  });

});
