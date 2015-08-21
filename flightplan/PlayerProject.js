"use strict"

// Module dependencies
var path = require("path");
var util = require("util");
var Project = require("./Project.js");

/**
 * Creates a manager to plan actions on project openveo-player.
 *
 * @param Object config Flightplan configuration file
 * @param Object options The list of script arguments
 * @param String target The plan's target  
 */
function PlayerProject(config, options, target){
  Project.prototype.init.call(this, config, options, target);
  
  this.projectName = "openveo-player";
  this.gitRepo = this.config.gitPlayerRepository;
  this.releaseDir = path.join(this.targetDir, "openveo-player", "release");
  this.currentReleaseLink = path.join(this.targetDir, "openveo-player", "current");
}

module.exports = PlayerProject;
util.inherits(PlayerProject, Project);

/**
 * Compiles project sources.
 *
 * @param Transport server The server on which working 
 */
PlayerProject.prototype.compile = function(server){
  var self = this;
  server.log("Compile " + this.projectName + " sources");

  server.with("cd " + path.join(this.tmpDir, "sources"), function(){

    // Install Grunt to compile js and CSS
    server.exec("npm install glob grunt grunt-contrib-compass grunt-contrib-concat grunt-contrib-uglify");

    // Before compiling hook
    self.beforeCompiling(server);

    // Launch compilation
    server.exec("grunt dist");

  });
};

/**
 * Removes unused stuffs in project.
 *
 * @param Transport server The server on which working
 */
PlayerProject.prototype.cleanProject = function(server){
  var self = this;

  server.with("cd " + path.join(this.tmpDir, "sources"), function(){

    // Keep unit tests and grunt configuration while not in production
    if(self.isProduction)
      server.rm("-rf tests js package.json css js");

    // Remove unused stuffs
    server.rm("-rf node_modules tasks .git* Gruntfile.js");

  });
};

/**
 * Nothing much to install.
 *
 * @param Transport server The server on which working
 */
PlayerProject.prototype.install = function(server){};

/**
 * No shared content.
 *
 * @param Transport server The server on which working
 */
PlayerProject.prototype.linkShared = function(server){};

/**
 * Defines PlayerProject specific exception.
 *
 * @param String message The error message
 */
function PlayerProjectException(message){
   this.message = message;
   this.name = "PlayerProjectException";
}