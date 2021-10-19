#!/usr/bin/env node

/**
 * Builds back office client files.
 *
 * It needs to be run from project root directory.
 *
 * Usage:
 *
 * # Build only back office client SCSS files with source maps
 * # Same as `build development`
 * $ build
 * $ build development
 *
 * # Build back office client SCSS and JavaScript files for production
 * $ build production
 */

'use strict';

const {exec} = require('child_process');
const path = require('path');
const util = require('util');

const openVeoApi = require('@openveo/api');

const applicationConf = require('../conf.js');

const ACTIONS = openVeoApi.fileSystem.ACTIONS;
const environment = process.argv[2];

/**
 * Logs given message to stdout with a prefix.
 *
 * @param {String} message the message to log
 */
function log(message) {
  console.log(`build > ${message}`);
}

/**
 * Compiles SCSS files.
 *
 * @param {String} scssDirectoryPath The path where to find SCSS files
 * @param {String} outputPath The destination directory path
 * @param {Boolean} [production] true to build for production, false otherwise
 * @return {Promise} Promise resolving when SCSS files have been compiled
 */
async function compileScssFiles(scssDirectoryPath, outputPath, production) {
  return new Promise((resolve, reject) => {
    const command = `compass compile -c ./compass.rb \
--force \
--sass-dir ${scssDirectoryPath} \
--css-dir ${outputPath} \
${production ? '-e production -s compressed --no-sourcemap' : ''}
`;
    log(command);
    exec(command, {cwd: process.cwd()}, (error, stdout, stderr) => {
      if (error) return reject(error);
      console.log(stdout);
      return resolve();
    });
  });
}

/**
 * Compiles and concat JavaScript files.
 *
 * @param {Array} filesPaths The list of files paths to compile and concat
 * @param {String} outputPath The file output path
 * @return {Promise} Promise resolving when JavaScript files have been compiled
 */
async function compileJavaScriptFiles(filesPaths, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `npx uglifyjs -c -m -o ${outputPath} -- ${filesPaths.join(' ')}`;
    log(`${process.cwd()} > Compile JavaScript files\n${command}`);
    exec(command, {cwd: process.cwd()}, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

/**
 * Resolves given files paths with the given prefix.
 *
 * @param {Array} filesPaths The list of files paths to resolve
 * @return {Array} The list of resolved files paths
 */
function resolveFilesPaths(filesPaths, prefix) {
  return filesPaths.map((filePath) => {
    return path.join(prefix, filePath);
  });
}

/**
 * Builds back office JavaScript files.
 */
async function main() {
  const rootPath = path.join(__dirname, '../');
  const assetsPath = path.join(rootPath, 'assets/be');
  const buildPath = path.join(rootPath, 'build');
  const baseSourcesPath = path.join(rootPath, 'app/client/admin');
  const scssPath = path.join(baseSourcesPath, 'compass/sass');
  const scssBuildPath = path.join(buildPath, 'scss');
  const cssDistPath = path.join(assetsPath, 'css');
  const jsPath = path.join(baseSourcesPath, 'js');
  const jsDistPath = path.join(assetsPath, 'js');
  const bootstrapCssBuildPath = path.join(scssBuildPath, 'bootstrap.css');
  const bootstrapCssDistPath = path.join(cssDistPath, 'bootstrap.css');
  const tinymceCssBuildPath = path.join(scssBuildPath, 'tinymce.css');
  const tinymceCssDistPath = path.join(cssDistPath, 'tinymce.css');
  const mainCssBuildPath = path.join(scssBuildPath, 'style.css');
  const mainCssDistPath = path.join(cssDistPath, 'style.css');

  log(`Copy back office bootstrap SCSS files to ${scssBuildPath}`);
  await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(
    scssPath,
    scssBuildPath
  );

  log(`Compile back office SCSS files to ${scssBuildPath}`);
  await compileScssFiles(scssBuildPath, scssBuildPath, environment === 'production');

  if (environment !== 'production') {
    log(`Copy back office CSS and SCSS files to ${cssDistPath}`);
    await util.promisify(openVeoApi.fileSystem.copy.bind(openVeoApi.fileSystem))(
      scssBuildPath,
      cssDistPath
    );
  } else {
    log(`Copy back office CSS files to ${cssDistPath}`);
    await util.promisify(openVeoApi.fileSystem.performActions.bind(openVeoApi.fileSystem))([
      {type: ACTIONS.COPY, sourcePath: bootstrapCssBuildPath, destinationPath: bootstrapCssDistPath},
      {type: ACTIONS.COPY, sourcePath: tinymceCssBuildPath, destinationPath: tinymceCssDistPath},
      {type: ACTIONS.COPY, sourcePath: mainCssBuildPath, destinationPath: mainCssDistPath}
    ]);

    await compileJavaScriptFiles(
      resolveFilesPaths(applicationConf.backOffice.scriptFiles.dev, jsPath),
      path.join(jsDistPath, 'openveo.js')
    );
    await compileJavaScriptFiles(
      resolveFilesPaths(applicationConf.backOffice.scriptLibFiles.dev, jsPath),
      path.join(jsDistPath, 'libOpenveo.js')
    );
  }
}

main();
