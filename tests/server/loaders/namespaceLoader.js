'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var namespaceLoader = process.require('app/server/loaders/namespaceLoader.js');
var TestSocketController = require('./resources/controllers/TestSocketController.js');

var assert = chai.assert;
chai.should();
chai.use(spies);

// namespaceLoader.js
describe('namespaceLoader', function() {
  var expectedSocket;
  var expectedMessageDescriptors;
  var controllersPath = path.join(__dirname, 'resources/controllers');

  beforeEach(function() {
    expectedSocket = {
      handshake: {},
      on: function() {}
    };
    expectedMessageDescriptors = {
      connection: 'TestSocketController.connectAction',
      disconnect: 'TestSocketController.disconnectAction',
      error: 'TestSocketController.errorAction',
      customMessage: 'TestSocketController.customAction'
    };
    TestSocketController.prototype.connectAction = chai.spy(TestSocketController.prototype.connectAction);
    TestSocketController.prototype.disconnectAction = chai.spy(TestSocketController.prototype.disconnectAction);
    TestSocketController.prototype.errorAction = chai.spy(TestSocketController.prototype.errorAction);
    TestSocketController.prototype.customAction = chai.spy(TestSocketController.prototype.customAction);
  });

  // addHandlers method
  describe('addHandlers', function() {

    it('should listen to namespace "connection" message', function(done) {
      var expectedMessageDescriptors = {};
      var expectedNamespace = {
        on: function(message, callback) {
          done();
        }
      };

      namespaceLoader.addHandlers(expectedNamespace, expectedMessageDescriptors, controllersPath);

      expectedNamespace.on.should.have.been.called.exactly(1);
    });

    it('should execute action corresponding to "connection" message when receiving it', function() {
      var namespaceCallback;
      var expectedNamespace = {
        on: function(message, callback) {
          namespaceCallback = callback;
        }
      };

      namespaceLoader.addHandlers(expectedNamespace, expectedMessageDescriptors, controllersPath);
      namespaceCallback(expectedSocket);

      TestSocketController.prototype.connectAction.should.have.been.called.exactly(1);
    });

    it('should execute action corresponding to "disconnect" message when receiving it', function() {
      var namespaceCallback;
      var expectedNamespace = {
        on: function(message, callback) {
          namespaceCallback = callback;
        }
      };

      expectedSocket.on = function(message, callback) {
        if (message === 'disconnect')
          callback();
      };

      namespaceLoader.addHandlers(expectedNamespace, expectedMessageDescriptors, controllersPath);
      namespaceCallback(expectedSocket);

      TestSocketController.prototype.disconnectAction.should.have.been.called.exactly(1);
    });

    it('should execute action corresponding to "error" message when receiving it', function() {
      var namespaceCallback;
      var expectedNamespace = {
        on: function(message, callback) {
          namespaceCallback = callback;
        }
      };

      expectedSocket.on = function(message, callback) {
        if (message === 'error')
          callback();
      };

      namespaceLoader.addHandlers(expectedNamespace, expectedMessageDescriptors, controllersPath);
      namespaceCallback(expectedSocket);

      TestSocketController.prototype.errorAction.should.have.been.called.exactly(1);
    });

    it('should execute action corresponding to "customMessage" message when receiving it', function() {
      var namespaceCallback;
      var expectedNamespace = {
        on: function(message, callback) {
          namespaceCallback = callback;
        }
      };

      expectedSocket.on = function(message, callback) {
        if (message === 'customMessage')
          callback();
      };

      namespaceLoader.addHandlers(expectedNamespace, expectedMessageDescriptors, controllersPath);
      namespaceCallback(expectedSocket);

      TestSocketController.prototype.customAction.should.have.been.called.exactly(1);
    });

    it('should ignore wrong message descriptors', function() {
      var namespaceCallback;
      var expectedNamespace = {
        on: function(message, callback) {
          namespaceCallback = callback;
        }
      };
      var wrongMessageDescriptors = {
        malformed: 'TestSocketController.customAction.action',
        unknownController: 'UnknownController.customAction',
        unknownAction: 'TestSocketController.unknownAction'
      };

      expectedSocket.on = function(message, callback) {
        if (wrongMessageDescriptors[message])
          assert.ok(false, 'Unexpected message ' + message);
      };

      namespaceLoader.addHandlers(expectedNamespace, wrongMessageDescriptors, controllersPath);
      namespaceCallback(expectedSocket);
    });
  });

});
