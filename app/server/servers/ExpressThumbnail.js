var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var imageMagick = require('gm').subClass({ imageMagick: true });

var expressThumbnail = module.exports;

// Register middleware.
expressThumbnail.register = function(rootDir, options) {

  rootDir = path.normalize(rootDir);

  options = options || {};
  options.cacheDir = options.cacheDir || path.join(rootDir, '.thumb');       // cache folder, default to {root dir}/.thumb
  options.quality = options.quality || 90;                                   // compression level, default to 80
  options.gravity = options.gravity || 'Center';   
  
  options.imagesStyle = options.imagesStyle || {};
  options.imagesStyle['default'] = 10;

  return function (req, res, next) {
    var filename = decodeURI(req.url.replace(/\?(.*)/, ''));                 // file name in root dir
   
    var isImage = new RegExp(".*(.jpeg|.jpg|.png)$").test(filename);
    if(isImage){
      var filepath = path.join(rootDir, filename);                             // file path
      var dimension = req.query.thumb || '';                                   // thumbnail dimensions
      var location = path.join(options.cacheDir, dimension, filename);         // file location in cache

      // send converted file from cache
      function sendConverted() {
        var maxwidth=(options.imagesStyle[dimension])?(options.imagesStyle[dimension]):options.imagesStyle["default"];     
        var convertOptions = {
          filepath: filepath,
          location: location,
          width: maxwidth,
          quality: options.quality,
          gravity: options.gravity
        };
        expressThumbnail.convert(convertOptions, function (err) {
          if (err) {
            console.log(err);
            res.sendFile(filepath);
            return next();
          }
          return res.sendFile(location);
        });
      }
      fs.stat(filepath, function (err, stats) {
        // go forward
        if (err || !stats.isFile()) { return next(); }

        // send original file
        if (!dimension || dimension=='') {return res.sendFile(filepath); }

        // send converted file
        fs.exists(location, function (exists) {
          // file was found in cache
          if (exists) { return res.sendFile(location); }
          // convert and send
          sendConverted();
        });
      });
    } else return next(); 
  };
};

// Convert the image and store in the cache.
expressThumbnail.convert = function(options, callback) {
  mkdirp(path.dirname(options.location), function(err) {
    if (err) {return callback(err); }
    var width, height;
    var img = imageMagick(options.filepath).gravity(options.gravity);
    img.size(function(err, value){
      img.thumb(options.width, parseInt(value.height*options.width/value.width), options.location, options.quality, function(err, stdout, stderr, command) {
        return err ? callback(err) : callback(null);
      });
    });
    
    
  });
};