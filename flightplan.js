"use strict"

/**
 * Flightplan plans.
 *
 * Requirements to executes flightplan :
 * - node (e.g. apt-get install node ; apt-get install nodejs-legacy)
 * - npm
 * - grunt clit (npm install -g grunt-cli)
 * - flightplan cli (npm install -g flightplan)
 * - flightplan (npm install flightplan)
 * - nopt (npm install nopt)
 *
 * Requirements on destination server :
 * - bower (npm install -g bower)
 * - karma (npm install -g karma)
 *
 * @see https://coderwall.com/p/l1dzfw
 */

// Dependencies
var path = require("path");
var plan = require("flightplan");
var nopt = require("nopt");

// Process arguments
var knownOptions = {
  "ov-file" : [String],
  "ov-project" : [String],
  "ov-tag" : [String],
  "ov-production" : [Boolean],
  "ov-interative" : [Boolean],
  "ov-help" : [Boolean]
};

var shortHands = {
  "ovf" : ["--ov-file"],
  "ovp" : ["--ov-project"],
  "ovt" : ["--ov-tag"],
  "ovprod" : ["--ov-production"],
  "ovi" : ["--ov-interative"],
  "ovh" : ["--ov-help"]
};

// Parse process arguments
var options = nopt(knownOptions, shortHands, process.argv, 2);
var task = process.argv[2].split(":")[0];
var target = process.argv[2].split(":")[1];

if(options["ov-help"]){
  console.log("\n" +
    "  Usage: fly [deploy|package]:[target] [options]\n\n" +
    "  Tasks:\n\n" +
    "    deploy : Deploy a project to a target environment\n" +
    "    package : Locally package the delivery\n" +
    "  \n\n" +
    "  Options:\n\n" +
    "    -ovf, --ov-file            path to configuration file defining targets\n" +
    "    -ovp, --ov-project         precise the project to work on (co, pu or pl for respectively openveo-core, openveo-publish and openveo-player)\n" +
    "    -ovt, --ov-tag             precise the tag to work on (e.g. 1.0.0)\n" +
    "    -ovprod, --ov-production   ignore development stuff\n" +
    "    -ovi, --ov-interactive     enter interactive mode, process will ask for project and tag\n" +
    "    -ovh, --ov-help            output this help\n" +
    "  \n\n" +
    "  Targets:\n\n" +
    "  A target as defined in the configuration file defining targets (see --ov-file)\n" +
    "  \n\n" +
    "  Examples:\n\n" +
    "  fly deploy:production -ovf \"./flightplan/config.js\" -ovi\n" +
    "  fly deploy:production -ovf \"./flightplan/config.js\" -ovp \"co\" -ovt \"1.0.0\"\n" +
    "  fly package:demo -ovf \"./flightplan/config.js\" -ovp \"co\" -ovt \"1.0.0\"\n"
  );
  process.exit(1);
}

// Set default arguments values
var isInteractive = options["ov-interactive"] || false;
var projectName = options["ov-project"] || null;

// Verfiy if a configuration file, defining targets, has been precised
if(!options["ov-file"])
  plan.abort("Missing configuration file, use option --ov-file");

// Load the configuration file defining targets
var config = require(options["ov-file"]);

// Set targets configuration
// A target configuration "local" is added which does not run on a 
// distant server
plan.target("local");
if(config.briefing.destinations[target])
  plan.target(target, config.briefing.destinations[target]);

// A project manager depending on the project to work on
// This is a Project instance
var project = null;

// Set configuration variables
plan.local(["deploy", "install", "package", "upload", "extract", "localDeploy"], function(local){
  
  // Ask user the project to work on
  if(!projectName && isInteractive)
    projectName = local.prompt("Would you deploy Core, Publish or Player ? [co, pu, pl]");
  
  // No project name provided
  else if(!projectName)
    plan.abort("Missing a project use --ov-project option (use \"fly help -ovh\" for help)");
    
  // openveo-core
  if(projectName === "co"){
    var CoreProject = require("./flightplan/CoreProject.js");
    project = new CoreProject(config, options, target);
  }
  
  // openveo-publish
  else if(projectName === "pu"){
    var PublishProject = require("./flightplan/PublishProject.js");
    project = new PublishProject(config, options, target);
  }
  
  // openveo-player
  else if(projectName === "pl"){
    var PlayerProject = require("./flightplan/PlayerProject.js");
    project = new PlayerProject(config, options, target);
  }
  
  // Unknown project
  else
    plan.abort("Unknown project " + projectName + " (use \"fly help -ovh\" for help)");
});

// Package and deploy a version of the project on local
// environment just like a standard deployment
plan.local(["localDeploy"], function(local){
  try{
    project.clean(local);
    project.checkout(local);
    project.compile(local);
    project.package(local);
    project.prepareReleaseDir(local);
    project.copy(local);
    project.removeOld(local);
    project.extract(local);
    project.linkShared(local);
    project.install(local);
    project.publish(local);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Package a project as a tar file
plan.local(["deploy", "package"], function(local){
  try{
    project.checkout(local);
    project.compile(local);
    project.package(local);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Prepare destination server by creating remote directories
plan.remote(["deploy", "upload"], function(remote){
  try{
    project.prepareReleaseDir(remote);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Upload the package from local to destination server
plan.local(["deploy", "upload"], function(local){
  try{
    project.upload(local);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Extract sources on destination server
plan.remote(["deploy", "extract"], function(remote){
  try{
    project.removeOld(remote);
    project.extract(remote);
    project.linkShared(remote);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Install deployed project on destination server
plan.remote(["deploy", "install"], function(remote){
  try{
    project.install(remote);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Link current folder on the new release
plan.remote(["deploy"], function(remote){
  try{
    project.publish(remote);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Rollback management
plan.remote(["rollback"], function(remote){
  try{
    project.rollback(remote);
  }
  catch(e){
    plan.abort(e.message);
  }
});

// Clean up local directories used in plan
plan.local(["deploy", "install", "package", "upload", "extract", "localDeploy"], function(local){
  try{
    project.clean(local);
  }
  catch(e){
    plan.abort(e.message);
  }
});
