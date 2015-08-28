module.exports = {
  
  // Core doc
  core : {
    name : "<%= pkg.name %>",
    description : "<%= pkg.description %>",
    version : "<%= pkg.version %>",
    options : {
      paths : "app/server",
      outdir : "./doc/openveo",
      linkNatives : true,
      "external": {
        "data" : {
          "base" : "../../openveo-api/",
          "json" : "./doc/openveo-api/data.json"
        }
      }
    }
  }
  
};