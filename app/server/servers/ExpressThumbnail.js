'use strict';

var fs = require('fs');
var path = require('path');
var imageMagick = require('gm').subClass({
  imageMagick: true
});
var openVeoApi = require('@openveo/api');

var expressThumbnail = module.exports;

// Register middleware.
expressThumbnail.register = function(rootDir, options) {

  rootDir = path.normalize(rootDir);

  options = options || {};
  options.cacheDir = options.cacheDir || path.join(rootDir,
    '.thumb');       // cache folder, default to {root dir}/.thumb
  options.quality = options.quality || 90;                                   // compression level, default to 80
  options.gravity = options.gravity || 'Center';

  options.imagesStyle = options.imagesStyle || {};
  options.imagesStyle['default'] = 10;

  return function(req, res, next) {
    var dimension;
    var filepath;
    var location;

    /**
     * Sends image to client.
     *
     * @param {String} imagePath The absolute image path
     */
    function sendImage(imagePath) {
      res.set(options.headers);
      res.sendFile(imagePath);
    }

    /**
     * Send converted file from cache
     */
    function sendConverted() {
      var widthDimension = options.imagesStyle[dimension];
      var maxwidth = (widthDimension) ? (widthDimension) : options.imagesStyle['default'];
      var convertOptions = {
        filepath: filepath,
        location: location,
        width: maxwidth,
        quality: options.quality,
        gravity: options.gravity
      };
      expressThumbnail.convert(convertOptions, function(err) {
        if (err)
          return sendImage(filepath);

        return sendImage(location);
      });
    }
    var filename = decodeURI(req.url.replace(/\?(.*)/, ''));                 // file name in root dir

    var isImage = new RegExp('.*(.jpeg|.jpg|.png)$').test(filename);

    filepath = path.join(rootDir, filename);  // file path
    dimension = req.query.thumb || '';  // thumbnail dimensions

    fs.stat(filepath, function(err, stats) {

      // go forward
      if (err || !stats.isFile() || !isImage)
        return next();

      // send original file
      if (!dimension || dimension == '')
        return sendImage(filepath);

      // send converted file
      location = path.join(options.cacheDir, dimension, filename);         // file location in cache
      fs.stat(location, function(error, stats) {

        // file was found in cache
        if (stats && stats.isFile())
          return sendImage(location);

        // convert and send
        sendConverted();
      });
    });
  };
};

// Convert the image and store in the cache.
expressThumbnail.convert = function(options, callback) {
  openVeoApi.fileSystem.mkdir(path.dirname(options.location), function(err) {
    if (err) {
      return callback(err);
    }
    var img = imageMagick(options.filepath).gravity(options.gravity);
    img.size(function(err, value) {
      img.thumb(options.width, parseInt(value.height * options.width / value.width), options.location, options.quality,
        function(err) {
          return err ? callback(err) : callback(null);
        });
    });
  });
};
