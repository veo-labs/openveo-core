'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');
var openVeoApi = require('@openveo/api');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('DefaultController', function() {
  var coreApi;
  var originalCoreApi;
  var storage;
  var request;
  var response;
  var defaultController;
  var expectedConfiguration;
  var expectedServerConfiguration;

  beforeEach(function() {
    expectedConfiguration = {
      auth: [],
      anonymousId: 43,
      superAdminId: 44
    };
    expectedServerConfiguration = {
      browserSocketPort: 42
    };
    response = {
      locals: {},
      render: chai.spy(function(template, parameters) {})
    };
    request = {
      isAuthenticated: chai.spy(function() {
        return true;
      }),
      user: {id: 42}
    };
    storage = {
      getConfiguration: chai.spy(function() {
        return expectedConfiguration;
      }),
      getServerConfiguration: chai.spy(function() {
        return expectedServerConfiguration;
      })
    };

    coreApi = {
      getPlugins: function() {}
    };

    originalCoreApi = process.api;
    process.api = coreApi;
    mock(path.join(process.root, 'app/server/storage.js'), storage);
  });

  beforeEach(function() {
    var DefaultController = mock.reRequire(path.join(process.root, 'app/server/controllers/DefaultController.js'));
    defaultController = new DefaultController();
  });

  // Stop mocks
  afterEach(function() {
    process.api = originalCoreApi;
    mock.stopAll();
  });

  describe('defaultAction', function() {

    it('should serve root.html template with its parameters', function(done) {
      var expectedPlugins = [
        {
          name: 'plugin1',
          mountPath: 'plugin1',
          version: {
            name: 'Plugin 1',
            version: '1.0.0'
          },
          libraries: [
            {
              name: 'library1',
              mountPath: 'library-1',
              files: ['path/to/jsFile1.js', 'path/to/cssFile1.css']
            }
          ],
          scriptLibFiles: {
            dev: ['dist/lib1.js']
          },
          scriptFiles: {
            dev: ['dist/1.js']
          },
          cssFiles: ['dist/1.css'],
          menu: true
        },
        {
          name: 'plugin2',
          mountPath: 'plugin2',
          version: {
            name: 'Plugin 2',
            version: '2.0.0'
          },
          libraries: [],
          scriptLibFiles: {
            dev: []
          },
          scriptFiles: {
            dev: []
          },
          cssFiles: [],
          menu: true
        }
      ];

      coreApi.getPlugins = function() {
        return expectedPlugins;
      };

      response.render = function(template, parameters) {
        assert.equal(template, 'root', 'Wrong template');
        assert.equal(parameters.user, JSON.stringify(request.user), 'Wrong user');
        assert.equal(
          parameters.authenticationMechanisms,
          JSON.stringify([openVeoApi.passport.STRATEGIES.LOCAL]),
          'Wrong authentication mechanisms'
        );
        assert.equal(
          parameters.authenticationStrategies,
          JSON.stringify(openVeoApi.passport.STRATEGIES),
          'Wrong authentication strategies'
        );
        assert.equal(
          parameters.version,
          JSON.stringify(expectedPlugins.map(function(expectedPlugin) {
            return expectedPlugin.version;
          })),
          'Wrong plugins version'
        );
        assert.equal(
          parameters.angularJsModules,
          expectedPlugins.map(function(expectedPlugin) {
            return '"' + expectedPlugin.name + '"';
          }).join(','),
          'Wrong AngularJS modules'
        );
        assert.equal(
          parameters.socketServerPort,
          expectedServerConfiguration.browserSocketPort,
          'Wrong socket server port'
        );
        assert.equal(parameters.anonymousId, expectedConfiguration.anonymousId, 'Wrong anonymous id');
        assert.equal(parameters.superAdminId, expectedConfiguration.superAdminId, 'Wrong super administrator id');

        expectedPlugins.forEach(function(expectedPlugin) {
          expectedPlugin.libraries.forEach(function(library) {
            assert.includeMembers(
              parameters.css,
              library.files.filter(function(file) {
                return /.css$/.test(file);
              }).map(function(file) {
                return path.join(expectedPlugin.mountPath, library.mountPath, file);
              }),
              'Wrong libraries CSS files'
            );

            assert.includeMembers(
              parameters.librariesScripts,
              library.files.filter(function(file) {
                return /.js$/.test(file);
              }).map(function(file) {
                return path.join(expectedPlugin.mountPath, library.mountPath, file);
              }),
              'Wrong libraries JavaScript files'
            );
          });

          assert.includeMembers(
            parameters.librariesScripts,
            expectedPlugin.scriptLibFiles.dev,
            'Wrong plugin library files'
          );
          assert.includeMembers(parameters.scripts, expectedPlugin.scriptFiles.dev, 'Wrong plugin JavaScript files');
          assert.includeMembers(parameters.css, expectedPlugin.cssFiles, 'Wrong plugin CSS files');
        });

        done();
      };

      defaultController.defaultAction(request, response);
    });

    it('should serve root.html template without files nor versions if no plugins', function(done) {
      response.render = function(template, parameters) {
        assert.empty(parameters.librariesScripts, 'Unexpected JavaScript library files');
        assert.empty(parameters.scripts, 'Unexpected JavaScript files');
        assert.empty(parameters.css, 'Unexpected CSS files');
        assert.equal(parameters.version, '[]', 'Unexpected versions');

        done();
      };

      defaultController.defaultAction(request, response);
    });

    it('should serve root.html template with AngularJS modules in camel case', function(done) {
      var expectedPlugins = [
        {
          name: 'plugin-with-several-words1',
          menu: true
        },
        {
          name: 'plugin-with-several-words2',
          menu: true
        }
      ];

      coreApi.getPlugins = function() {
        return expectedPlugins;
      };

      response.render = function(template, parameters) {
        assert.equal(parameters.angularJsModules, ['"pluginWithSeveralWords1"', '"pluginWithSeveralWords2"'].join(','));
        done();
      };

      defaultController.defaultAction(request, response);
    });

  });

});
