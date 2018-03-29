'use strict';

var util = require('util');
var shortid = require('shortid');
var e2e = require('@openveo/test').e2e;
var Helper = e2e.helpers.Helper;

/**
 * Creates a new ApplicationHelper to help manipulate applications without interacting with the web browser.
 *
 * Each function is inserting in protractor's control flow.
 *
 * @param {ClientProvider} provider The entity provider that will be used by the Helper
 */
function ApplicationHelper(provider) {
  ApplicationHelper.super_.call(this, provider);
  this.textSearchProperties = ['name'];
  this.sortProperties = [{
    name: 'name',
    type: 'string'
  }];
}

module.exports = ApplicationHelper;
util.inherits(ApplicationHelper, Helper);

/**
 * Gets entity object example to use with web service put /entityName.
 *
 * If the entity managed by the Helper is registered to be tested automatically by the core, it needs to implement
 * this method which will be used to perform a put /entityName.
 *
 * @method getAddExample
 * @return {Object} The data to add
 */
ApplicationHelper.prototype.getAddExample = function() {
  return {
    id: shortid.generate(),
    name: 'Application example',
    scopes: ['scope1', 'scope2']
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
ApplicationHelper.prototype.getUpdateExample = function() {
  return {
    name: 'Application example new name',
    scopes: ['scope3']
  };
};

/**
 * Gets scopes names from configuration files.
 *
 * @param {Object} OpenVeo translations
 * @return {Array} The list of scopes names
 */
ApplicationHelper.prototype.getScopes = function(translations) {
  var plugins = process.api.getPlugins();
  var scopes = [];

  // Get the list of entities and the list of scopes from plugins' configuration
  plugins.forEach(function(plugin) {

    // Scopes
    if (plugin.webServiceScopes) {
      plugin.webServiceScopes.forEach(function(webServiceScope) {
        scopes.push(eval('translations.' + webServiceScope.name));
      });
    }

    // Scopes based on entities
    if (plugin.entities) {
      for (var id in plugin.entities) {
        var idUc = id.toUpperCase();
        var pluginNameUc = plugin.name.toUpperCase();
        scopes.push(eval('translations.' + pluginNameUc + '.WS_SCOPES.GET_' + idUc + '_NAME'));
        scopes.push(eval('translations.' + pluginNameUc + '.WS_SCOPES.UPDATE_' + idUc + '_NAME'));
        scopes.push(eval('translations.' + pluginNameUc + '.WS_SCOPES.DELETE_' + idUc + '_NAME'));
        scopes.push(eval('translations.' + pluginNameUc + '.WS_SCOPES.ADD_' + idUc + '_NAME'));
      }
    }
  });

  return scopes;
};
