"use scrict"

// Module dependencies
var path = require("path");
var util = require("util");
var Project = require("./Project.js");

/**
 * Creates a manager to plan actions on project openveo-publish.
 *
 * @param Object config Flightplan configuration file
 * @param Object options The list of script arguments
 * @param String target The plan's target  
 */
function PublishProject(config, options, target){
  Project.prototype.init.call(this, config, options, target);
  
  this.projectName = "openveo-publish";
  this.gitRepo = this.config.gitPublishRepository;
  this.releaseDir = path.join(this.targetDir, "openveo-publish", "release");
  this.currentReleaseLink = path.join(this.targetDir, "openveo-publish", "current");
}

module.exports = PublishProject;
util.inherits(PublishProject, Project);

/**
 * Extracts the tar file and establish symbolic link to openveo-api, and
 * openveo-player projects.
 *
 * @param Transport server The server on which working
 */
PublishProject.prototype.extract = function(server){
  var self = this;
  Project.prototype.extract.call(this, server);
  
  var destinationDirectory = this.config.destinationDirectory[this.target];
  
  // Create a symbolic link to openveo-api from openveo-publish
  server.with("cd " + this.newReleaseDir + "/node_modules/", function(){
     server.ln("-s " + path.join(destinationDirectory, "openveo", "current", "node_modules", "openveo-api") + " openveo-api");
  });

  if(!this.isProduction){

    // Create a symbolic link to openveo-test from openveo-publish
    server.with("cd " + this.newReleaseDir + "/node_modules/", function(){
       server.ln("-s " + path.join(destinationDirectory, "openveo", "current", "node_modules", "openveo-test") + " openveo-test");
    });

  }

  // Create a symbolic link to openveo-player from openveo-publish
  server.mkdir("-p " + path.join(this.newReleaseDir, "public/publish/lib"));
  server.with("cd " + this.newReleaseDir + "/public/publish/lib/", function(){
     server.ln("-s " + path.join(destinationDirectory, "openveo-player", "current") + " openveo-player");
  });

  // Create a symbolic link to videos
  server.with("cd " + this.newReleaseDir + "/public/publish/", function(){
     server.ln("-s " + path.join(self.releaseDir, "..", "shared", "videos") + " " + path.join("videos"));
  });
  
};

/**
 * Defines PublishProject specific exception.
 *
 * @param String message The error message
 */
function PublishProjectException(message){
   this.message = message;
   this.name = "PublishProjectException";
}