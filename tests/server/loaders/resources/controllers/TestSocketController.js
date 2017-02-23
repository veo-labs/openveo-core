'use strict';

var util = require('util');
var openVeoApi = require('@openveo/api');

function TestSocketController() {

}

util.inherits(TestSocketController, openVeoApi.controllers.SocketController);
module.exports = TestSocketController;

TestSocketController.prototype.connectAction = function() {

};

TestSocketController.prototype.disconnectAction = function() {

};

TestSocketController.prototype.errorAction = function() {

};

TestSocketController.prototype.customAction = function() {

};
