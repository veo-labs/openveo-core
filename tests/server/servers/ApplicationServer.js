'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('ApplicationServer', function() {
  var openVeoApi;
  var express;
  var expressSession;
  var favicon;
  var consolidate;
  var storage;
  var routeLoader;
  var entityLoader;
  var namespaceLoader;
  var SocketServer;
  var SocketNamespace;
  var DefaultController;
  var ErrorController;
  var expectedConfiguration;
  var applicationServer;

  beforeEach(function() {
    expectedConfiguration = {};
    SocketServer = function() {};
    SocketServer.prototype.getNamespace = chai.spy(function(mountPath) {});
    SocketServer.prototype.addNamespace = chai.spy(function(mountPath, socketNamespace) {});
    SocketNamespace = function() {};
    SocketNamespace.prototype.use = chai.spy(function(middleware) {});
    favicon = chai.spy(function(faviconPath) {});
    express = function() {
      return {
        set: chai.spy(function(name, value) {}),
        use: chai.spy(function(param) {}),
        engine: chai.spy(function(extension, callback) {})
      };
    };
    express.static = chai.spy(function(rootPath, options) {
      return {rootPath: rootPath, options: options};
    });
    expressSession = function() {
      return function() {};
    };
    DefaultController = function() {};
    ErrorController = function() {};
    consolidate = {};
    storage = {
      setServerConfiguration: chai.spy(function(configuration) {})
    };
    openVeoApi = {
      socket: {
        SocketServer: SocketServer,
        SocketNamespace: SocketNamespace
      },
      middlewares: {
        logRequestMiddleware: null,
        imageProcessorMiddleware: chai.spy(function(directoryPath, cacheDirectory, styles, headers) {})
      },
      storages: {
        ResourceFilter: null
      },
      passport: {
        strategyFactory: null
      }
    };
    routeLoader = {
      applyRoutes: chai.spy(function(routes, router) {}),
      decodeRoutes: chai.spy(function(pluginPath, routes) {})
    };
    entityLoader = {
      buildEntitiesRoutes: chai.spy(function(entities) {})
    };
    namespaceLoader = {
      addHandlers: chai.spy(function(namespace, descriptors, pluginPath) {})
    };

    mock('@openveo/api', openVeoApi);
    mock('express', express);
    mock('express-session', expressSession);
    mock('server-favicon', favicon);
    mock('consolidate', consolidate);
    mock(path.join(process.root, 'app/server/controllers/DefaultController.js'), DefaultController);
    mock(path.join(process.root, 'app/server/controllers/ErrorController.js'), ErrorController);
    mock(path.join(process.root, 'app/server/storage.js'), storage);
    mock(path.join(process.root, 'app/server/loaders/routeLoader.js'), routeLoader);
    mock(path.join(process.root, 'app/server/loaders/entityLoader.js'), entityLoader);
    mock(path.join(process.root, 'app/server/loaders/namespaceLoader.js'), namespaceLoader);
  });

  beforeEach(function() {
    var ApplicationServer = mock.reRequire(path.join(process.root, 'app/server/servers/ApplicationServer.js'));
    applicationServer = new ApplicationServer(expectedConfiguration);
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  describe('onPluginLoaded', function() {

    it('should mount plugin libraries with plugin mount path on a static HTTP server', function(done) {
      var expectedPlugin = {
        libraries: [
          {
            name: 'chai',
            mountPath: 'chai-mount-path',
            files: []
          }
        ],
        mountPath: 'pluginMountPath',
        path: ''
      };

      applicationServer.httpServer.use = chai.spy(function(mountPath, middleware) {
        var libraryPath = path.dirname(require.resolve(path.join(expectedPlugin.libraries[0].name, 'package.json')));
        assert.equal(mountPath, path.join(expectedPlugin.mountPath, libraryPath), 'Wrong mount path');
        assert.equal(middleware.rootPath, libraryPath, 'Wrong library path');
      });

      applicationServer.onPluginLoaded(expectedPlugin, function() {
        applicationServer.httpServer.use.should.have.been.called.exactly(1);
        done();
      });
    });

    it('should ignore not found libraries', function(done) {
      var expectedPlugin = {
        libraries: [
          {
            name: 'no-found',
            mountPath: 'not-found-mount-path',
            files: []
          }
        ],
        mountPath: 'pluginMountPath'
      };

      applicationServer.httpServer.use = chai.spy(function(mountPath, middleware) {});

      applicationServer.onPluginLoaded(expectedPlugin, function() {
        applicationServer.httpServer.use.should.have.been.called.exactly(0);
        done();
      });
    });

  });

});
