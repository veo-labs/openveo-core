'use strict';

var util = require('util');
var shortid = require('shortid');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new TaxonomyHelper to help manipulate taxonomies without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {TaxonomyProvider} provider The entity provider that will be used by the Helper
 */
function TaxonomyHelper(provider) {
  TaxonomyHelper.super_.call(this, provider);
  this.textSearchProperties = ['name'];
  this.sortProperties = [{
    name: 'name',
    type: 'string'
  }];
}

module.exports = TaxonomyHelper;
util.inherits(TaxonomyHelper, Helper);

/**
 * Gets entity object example to use with web service put /entityName.
 *
 * If the entity managed by the Helper is registered to be tested automatically by the core, it needs to implement
 * this method which will be used to perform a put /entityName.
 *
 * @method getAddExample
 * @return {Object} The data to add
 */
TaxonomyHelper.prototype.getAddExample = function() {
  return {
    id: shortid.generate(),
    name: 'Taxonomy example',
    tree: [
      {
        id: shortid.generate(),
        items: [],
        title: 'Term example'
      }
    ]
  };
};

/**
 * Gets entity object example to use with web service post /entityName.
 *
 * If the entity managed by the Helper is registered to be tested automatically by the core, it needs to implement
 * this method which will be used to perform a post /entityName.
 *
 * @method getUpdateExample
 * @return {Object} The data to perform the update
 */
TaxonomyHelper.prototype.getUpdateExample = function() {
  return {
    name: 'Taxonomy example new name',
    tree: [
      {
        items: [],
        title: 'Term example new title'
      }
    ]
  };
};
