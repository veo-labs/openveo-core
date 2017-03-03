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
  var FILE_TYPES = {
    JPG: 'ffd8ffe0',
    PNG: '89504e47',
    GIF: '47494638'
  };

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
    var fileSystemPath;
    var cacheLocation;

    /**
     * Sends image to client.
     *
     * @param {String} imagePath The absolute image path
     */
    function sendFile(imagePath) {
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
        filepath: fileSystemPath,
        location: cacheLocation,
        width: maxwidth,
        quality: options.quality,
        gravity: options.gravity
      };
      expressThumbnail.convert(convertOptions, function(err) {
        if (err)
          return sendFile(fileSystemPath);

        return sendFile(cacheLocation);
      });
    }

    var filePath = decodeURI(req.url.replace(/\?(.*)/, '')); // file name requested

    fileSystemPath = path.join(rootDir, filePath);  // file system path
    dimension = req.query.thumb || '';  // thumbnail dimensions

    fs.stat(fileSystemPath, function(err, stats) {

      // error or not a file: go forward
      if (err || !stats.isFile())
        return next();

      // no dimension requested, send original file
      if (!dimension || dimension == '')
        return sendFile(fileSystemPath);

      // verify that file is supported
      var readable = fs.createReadStream(path.normalize(fileSystemPath), {start: 0, end: 3});
      var isImage;
      readable.on('data', function(chunk) {
        isImage = Object.values(FILE_TYPES).indexOf(chunk.toString('hex', 0, 4));
      });
      readable.on('end', function() {

        // send original file which type not supported
        if (!isImage)
          return sendFile(fileSystemPath);

        // send converted file
        cacheLocation = path.join(options.cacheDir, dimension, filePath);         // file location in cache
        fs.stat(cacheLocation, function(error, stats) {

          // file was found in cache
          if (stats && stats.isFile())
            return sendFile(cacheLocation);

          // convert and send
          sendConverted();
        });
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
