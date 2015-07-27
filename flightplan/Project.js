"use scrict"

// Module dependencies
var path = require("path");

/**
 * Creates a Project manager.
 *
 * Must not be used directly, use one of its sub classes instead.
 */
function Project(){}

/**
 * Initializes project plan.
 *
 * @param Object config Flightplan configuration file
 * @param Object options A list of options describing the dehaviour of
 * the manager
 * @param String target The plan's target
 */
Project.prototype.init = function(config, options, target){
  
  // Configuration
  this.config = config;
  
  // Options
  this.isInteractive = options["ov-interactive"] || false;
  this.isProduction = (typeof options["ov-production"] === "boolean") ? options["ov-production"] : true;
  this.gitRef = options["ov-tag"] || null;
  this.release = options["release"] || null;
  this.mustDelete = options["delete"];
  this.mustRestoreDB = options["restore"];
  
  // Target
  this.target = target;
  
  this.archivePrefix = "sources_";
  this.tmpDir = path.join("build", "tmp");
  this.archiveName = null;
  this.gitRepo = null;
  this.projectName = null;
  this.currentReleaseDir = null;
  this.sha1 = "unknown";
  this.targetDir = this.config.destinationDirectory[this.target];
  this.releaseDir = path.join(this.targetDir, "release");
  this.currentReleaseLink = path.join(this.targetDir, "current");
  
};

/**
 * Checkouts project sources in a temporary directory.
 *
 * @param Transport server The server on which working
 * @throws Exception
 */
Project.prototype.checkout = function(server){
  var self = this;
  server.log("Checkout sources of project " + this.projectName + " in " + path.join(this.tmpDir, "sources"));
  
  // Ask user the tag to checkout
  if(!this.gitRef && this.isInteractive)
    this.gitRef = server.prompt("Enter the version number or branch git to deploy? [ex: 1.2.3]");
  
  // No tag
  if(!this.gitRef)
    throw new ProjectException("Missing tag argument (use \"fly help -ovh\" for help)");
  
  this.newReleaseDir = path.join(this.releaseDir, this.gitRef);
  
  // Create tmp directory
  server.mkdir("-p " + path.join(this.tmpDir, "sources"));
  
  // Checkout tag
  server.with("cd " + path.join(this.tmpDir, "sources"), function(){
    server.exec("git archive --remote=" + self.gitRepo + " " + self.gitRef + " | tar -x");
  });
};

/**
 * Compiles sources (CSS and JavaScript files).
 *
 * @param Transport server The server on which working
 * @throws Exception
 */
Project.prototype.compile = function(server){
  var self = this;
  server.log("Compile " + this.projectName + " sources");
  
  server.with("cd " + path.join(this.tmpDir, "sources"), function(){
    
    // Install Grunt to compile js and CSS
    server.exec("npm install glob grunt grunt-contrib-compass grunt-contrib-concat grunt-contrib-uglify grunt-contrib-watch grunt-extend-config grunt-init grunt-mocha-test grunt-karma");
    
    // Before compiling hook
    self.beforeCompiling(server);
    
    // Launch compilation
    server.exec("grunt prod");
    
  });
};

/**
 * Packages the project into a tar file.
 *
 * @param Transport server The server on which working
 */
Project.prototype.package = function(server){
  var self = this;
  server.log("Package " + this.projectName);
    
  this.archiveName = this.archivePrefix + this.gitRef.replace(/\//g, "_") + ".tar.gz";
  this.sha1 = server.git("log -n 1 --pretty=format:\"%H\" " + this.gitRef).stdout;
  
  // Remove unused stuffs before packaging
  this.cleanProject(server);
  
  server.with("cd " + path.join(this.tmpDir, "sources"), function(){
    
    // Add project's version details to the package
    server.echo("\"" + self.gitRef + "\" > VERSION");
    server.echo("\"" + self.sha1 + "\" >> VERSION");
    
    // Compress archive
    server.tar("-zcf ../../" + self.archiveName + " * .??*");
    
  });
};

/**
 * Executes code before CSS and JavaScript compilation occures.
 *
 * @param Transport server The server on which working
 */
Project.prototype.beforeCompiling = function(server){};

/**
 * Removes unused stuffs in project.
 *
 * @param Transport server The server on which working
 */
Project.prototype.cleanProject = function(server){
  var self = this;
  
  server.with("cd " + path.join(this.tmpDir, "sources"), function(){

    // Keep unit tests and grunt configuration while not in production
    if(self.isProduction)
      server.rm("-rf tests app/client/admin/js tasks Gruntfile.js");
    
    // Remove unused stuffs
    server.rm("-rf flightplan flightplan.js public/lib app/client/admin/compass .sass-cache build nodemon.json .git*");
    
    // Remove unused modules (all except openveo*)
    server.with("cd node_modules", function(){
      server.exec('find * -maxdepth 0 -name "openveo*" -prune -o -exec rm -rf "{}" ";"');
    });
    
  });
};

/**
 * Prepares release directories.
 *
 * @param Transport server The server on which working
 */
Project.prototype.prepareReleaseDir = function(server){
  server.log("Prepare " + this.projectName + " release directory");
  server.mkdir("-p " + this.releaseDir);
  
  // Create shared directories between releases
  server.mkdir("-p " + path.join(this.releaseDir, "..", "shared", "config"));
  server.mkdir("-p " + path.join(this.releaseDir, "..", "shared", "log"));
};

/**
 * Uploads the tar file to a server.
 *
 * @param Transport server The server on which working
 */
Project.prototype.upload = function(server){
  var self = this;
  server.log("Upload " + this.projectName + " package to destination server");
    
  if(this.isInteractive){
  
    // Confirm deployment, as we don't want to do this accidentally
    var input = server.prompt("Ready for deploying to " + this.releaseDir + "? [yes]");

    if(input.indexOf("yes") === -1)
      server.abort("User canceled flight");

  }

  // Rsync files to destination server
  server.log("Copy files to remote hosts");
  server.with("cd build", function(){
    server.transfer(self.archiveName, self.releaseDir);
  });
};

/**
 * Copies the tar file locally.
 *
 * This is the equivalent of the upload but on the same server.
 *
 * @param Transport server The server on which working
 */
Project.prototype.copy = function(server){
  var self = this;
  server.log("Copy " + this.projectName + " package to " + this.releaseDir);
  
  // Rsync files to all the destination's hosts
  server.log("Copy files to remote hosts");
  server.with("cd build", function(){
    server.cp(self.archiveName + " " + self.releaseDir);
  });
};

/**
 * Removes old tag if already present on the server.
 *
 * @param Transport server The server on which working
 */
Project.prototype.removeOld = function(server){
  server.exec("rm -rf " + this.newReleaseDir);
};

/**
 * Extracts the tar file.
 *
 * @param Transport server The server on which working
 */
Project.prototype.extract = function(server){
  var self = this;
  server.log("Extract " + this.projectName + " package to " + this.newReleaseDir);  
  
  var destinationDirectory = this.config.destinationDirectory[this.target];
  
  // Only used if there is a disaster deploy
  this.currentReleaseDir = server.exec("readlink current || echo " + this.newReleaseDir, {
    failsafe : true,
    exec : { cwd : destinationDirectory }
  }).stdout;

  // Create release directory, extract delivery package into it and remove package
  server.with("cd " + this.releaseDir, function(){
    server.mkdir("-p " + self.newReleaseDir);
    server.tar("-xzf " + self.archiveName + " -C " + self.newReleaseDir);
    server.rm("-f " + self.archiveName);
  });
  
};

/**
 * Links shared content to project.
 *
 * @param Transport server The server on which working
 */
Project.prototype.linkShared = function(server){
  var self = this;
  
  // Link shared directories
  server.with("cd " + this.newReleaseDir, function(){
    server.rm("-rf log");
    server.ln("-s " + path.join(self.releaseDir, "..", "shared", "log") + " " + path.join("log"));
    
    var sharedParametersFile = path.join(self.releaseDir, "..", "shared", "config");
    server.exec("test -d " + sharedParametersFile + " && echo \"config already exist\" || cp " + path.join(self.newReleaseDir, "config", "*") + " " + sharedParametersFile);
    server.rm("-rf config");
    server.ln("-s " + path.join(self.releaseDir, "..", "shared", "config") + " " + path.join("config"));
  });
};

/**
 * Installs project's dependencies.
 *
 * @param Transport server The server on which working
 */
Project.prototype.install = function(server){
  var self = this;
  server.log("Installs " + this.projectName + " dependencies");
  
  // Retrieve npm and bower dependencies
  server.with("cd " + this.newReleaseDir, function(){
    server.exec("npm install" + ((self.isProduction) ? " --production" : ""));
    server.exec("bower install --allow-root" + ((self.isProduction) ? " --production" : ""));
  });
};

/**
 * Publishes the delivery.
 *
 * @param Transport server The server on which working 
 */
Project.prototype.publish = function(server){
  server.log("Publish " + this.projectName);
  
  this.currentReleaseDir = server.exec("readlink current || echo " + this.newReleaseDir, {
    failsafe: true,
    exec : { cwd : this.config.destinationDirectory[this.target] }
  }).stdout;
  
  server.log("Link folder to web root");
  server.rm("-f " + this.currentReleaseLink);
  server.ln("-s " + this.newReleaseDir + " " + this.currentReleaseLink);
};

/**
 * Rolls back to a previous version of the project.
 * 
 * @param Transport server The server on which working
 */
Project.prototype.rollback = function(server){
  server.log("Rollback " + this.projectName);
  
  this.currentReleaseDir = server.exec("readlink " + this.currentReleaseLink + " || echo", {
    failsafe: true,
    exec : { cwd : this.config.destinationDirectory[this.target] }
  }).stdout;
  
  // List available releases
  var listRelease = server.ls("-1 " + this.releaseDir, {silent: true}).stdout.split("\n");
  server.log("List of releases:");
  for(var i = 0; i < listRelease.length; i++){
    if(listRelease[i] != ""){
      server.log("- " + listRelease[i]);
    }
  }
  
  // Let user choose a release and restore it
  if(!this.release && this.isInteractive)
    this.release = server.prompt("Select the release to restore? [ex: 20141007092521]");
  
  // No release or unknown release
  if(!this.release || listRelease.indexOf(this.release) < 0)
    plan.abort("Missing release argument to rollback (use \"fly help -ovh\" for help)");
  
  // Restore web root to the release
  server.log("Link folder to web root");
  server.rm("-f " + this.currentReleaseLink);
  server.ln("-s " + path.join(this.releaseDir, this.release) + " " + this.currentReleaseLink);

  if(this.currentReleaseDir != ""){
    
    // Let user decide if current release must be removed
    if(this.mustDelete === undefined && this.isInteractive){
      var input = server.prompt("Do you want to delete the broken release (" + this.currentReleaseDir + ")? [yes/no]");
      this.mustDelete = (input === "yes");
    }
    else
      this.mustDelete = false;
    
    // Remove the release
    if(this.mustDelete)
      server.rm("-rf " + this.currentReleaseDir);
  }
  
  // Let user decide if database must be restored
  if(this.mustRestoreDB === undefined && this.isInteractive){
    var input = server.prompt("Do you want to migrate down database ? [yes/no]");
    this.mustRestoreDB = (input === "yes");
  }
  else
    this.mustRestoreDB;

  // Actions after sources rollback
  if(this.mustRestoreDB){
    server.with("cd " + path.join(this.releaseDir, this.release), function(){
        server.exec("mongorestore dump/*.bson");
    });
  }
};

/**
 * Cleans temporary directories.
 *
 * @param Transport server The server on which working
 */
Project.prototype.clean = function(server){
  server.log("Cleanup " + this.projectName + " temporary directory");
  
  // Remove tmp directory
  server.exec("rm -rf " + this.tmpDir);
};

/**
 * Defines Project specific exception.
 *
 * @param String message The error message
 */
function ProjectException(message){
   this.message = message;
   this.name = "ProjectException";
}

module.exports = Project;