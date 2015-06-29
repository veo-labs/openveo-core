// Module dependencies
var path = require("path");
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

/**
 * Generates a database which always succeed.
 */
module.exports.generateSuccessDatabase = function(){
  var FakeSuccessDatabase = process.requireTest("lib/database/FakeSuccessDatabase.js");
  applicationStorage.setDatabase(new FakeSuccessDatabase());
};

/**
 * Generates a database which always fails.
 */
module.exports.generateFailDatabase = function(){
  var FakeFailDatabase = process.requireTest("lib/database/FakeFailDatabase.js");
  applicationStorage.setDatabase(new FakeFailDatabase());
};

/**
 * Generates fake web service scopes into application storage.
 */
module.exports.generateWebServiceScopes = function(){
  applicationStorage.setWebServiceScopes(
    {
      "scope1" : {
        "name" : "name 1",
        "description" : "description 1",
        "paths" : ["/ws/videos"]
      },
      "scope2" : {
        "name" : "name 2",
        "description" : "description 2",
        "paths" : []
      }
    }
  );
};

/**
 * Generates fake permissions into application storage.
 */
module.exports.generatePermissions = function(){
  applicationStorage.setPermissions(
    [
      {
        "id" : "perm1",
        "name" : "name 1",
        "description" : "description 1",
        "paths" : [
          "get /crud/application"
        ]
      },
      {
        "id" : "perm2",
        "name" : "name 2",
        "description" : "description 2",
        "paths" : [
          "put /crud/application"
        ]
      }
    ]
  );
};