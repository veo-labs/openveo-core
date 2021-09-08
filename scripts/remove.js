#!/usr/bin/env node

/**
 * Removes a file or directory from file system.
 *
 * Usage:
 *
 * $ node remove directory1
 * $ node remove file1
 */

'use strict';

const fs = require('fs/promises');
const {fileSystem} = require('@openveo/api');
const util = require('util');

const resourcePath = process.argv[2];

/**
 * Removes resource.
 */
async function main() {
  try {
    await fs.access(resourcePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    } else {
      return Promise.resolve();
    }
  }

  await util.promisify(fileSystem.rm)(resourcePath);
}

main();
