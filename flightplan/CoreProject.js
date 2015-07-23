"use scrict"

// Module dependencies
var path = require("path");
var util = require("util");
var Project = require("./Project.js");

/**
 * Creates a manager to plan actions on project openveo-core.
 *
 * @param Object config Flightplan configuration file
 * @param Object options The list of script arguments
 * @param String target The plan's target  
 */
function CoreProject(config, options, target){
  Project.prototype.init.call(this, config, options, target);
  
  this.projectName = "openveo-core";
  this.gitRepo = this.config.gitCoreRepository;
  this.releaseDir = path.join(this.targetDir, "openveo", "release");
  this.currentReleaseLink = path.join(this.targetDir, "openveo", "current"); 
}

module.exports = CoreProject;
util.inherits(CoreProject, Project);

/**
 * Installs bootstrap SASS to be able to compile bootstrap CSS.
 *
 * @param Transport server The server on which working 
 */
CoreProject.prototype.beforeCompiling = function(server){
  
  // Install bootstrap to compile bootstrap css for a core deployment
  server.exec("bower install bootstrap-sass");
  
};

/**
 * Extracts the tar file and establish symbolic link to openveo-publish
 * project.
 *
 * @param Transport server The server on which working
 */
CoreProject.prototype.extract = function(server){
  var self = this;
  Project.prototype.extract.call(this, server);
  
  // Create a symbolic link to openveo-publish from openveo-core
  server.with("cd " + this.newReleaseDir + "/node_modules/", function(){
     server.ln("-s " + path.join(self.config.destinationDirectory[self.target], "openveo-publish", "current") + " openveo-publish");
  });
};

/**
 * Installs project's dependencies and openveo-api dependencies.
 *
 * @param Transport server The server on which working
 */
CoreProject.prototype.install = function(server){  
  var self = this;
  Project.prototype.install.call(this, server);
  
  server.with("cd " + this.newReleaseDir + "/node_modules/openveo-api/" , function(){
    server.exec("npm install" + ((self.isProduction) ? " --production" : ""));
  });
  
};

/**
 * Defines CoreProject specific exception.
 *
 * @param String message The error message
 */
function CoreProjectException(message){
   this.message = message;
   this.name = "CoreProjectException";
}