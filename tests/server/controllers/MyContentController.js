'use strict';

var util = require('util');
var openVeoAPI = require('@openveo/api');
var ContentController = openVeoAPI.controllers.ContentController;

function MyContentController() {
  ContentController.call(this, function() {});
}

module.exports = MyContentController;
util.inherits(MyContentController, ContentController);
