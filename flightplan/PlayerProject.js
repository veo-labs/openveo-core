"use scrict"

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
 * Nothing to compile in player project, for now.
 *
 * @param Transport server The server on which working 
 */
PlayerProject.prototype.compile = function(server){};

/**
 * Nothing particular to remove.
 *
 * @param Transport server The server on which working
 */
PlayerProject.prototype.cleanProject = function(server){};

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