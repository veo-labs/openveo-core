"use strict"

// Module dependencies
var logger = require("winston");

// Module files
var loggerConf = process.require("config/loggerConf.json");

// Create a file logger
logger.loggers.add("openveo", {
  file: {
    level: loggerConf.level,
    filename: loggerConf.fileName,
    maxsize : loggerConf.maxFileSize,
    maxFiles : loggerConf.maxFiles
  }
});