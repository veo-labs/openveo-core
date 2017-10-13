'use strict';

(function(app) {

  /**
   * Defines the settings controller for the settings page.
   */
  function SettingsController($scope, $filter, $q, entityService, ldapSettings, casSettings, roles) {
    var strategies = openVeoSettings.authenticationStrategies;
    this.isSaving = false;
    this.hasLdap = openVeoSettings.authenticationMechanisms.indexOf(strategies.LDAP) >= 0;
    this.hasCas = openVeoSettings.authenticationMechanisms.indexOf(strategies.CAS) >= 0;
    this.formValues = {
      hasLdap: this.hasLdap,
      hasCas: this.hasCas,
      ldapMatches: ldapSettings.data.entity && ldapSettings.data.entity.value,
      casMatches: casSettings.data.entity && casSettings.data.entity.value
    };

    /**
     * Builds role options for matchers.
     *
     * @return {Array} The list of role options with names and values
     */
    function buildRoleOptions() {
      var options = [];
      roles.data.entities.forEach(function(role) {
        options.push({
          name: role.name,
          value: role.id
        });
      });
      return options;
    }

    // Build role options for matchers
    var roleOptions = buildRoleOptions();

    // Form fields
    this.formFields = [
      {
        type: 'section',
        templateOptions: {
          title: $filter('translate')('CORE.SETTINGS.LDAP.TITLE')
        },
        hideExpression: '!model.hasLdap'
      },
      {
        key: 'ldapMatches',
        type: 'horizontalMatch',
        templateOptions: {
          label: $filter('translate')('CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL'),
          description: $filter('translate')('CORE.SETTINGS.LDAP.GROUP_ASSOC_DESC'),
          addLabel: $filter('translate')('CORE.SETTINGS.LDAP.GROUP_ASSOC_ADD'),
          multiple: true,
          inputPlaceholder: $filter('translate')('CORE.SETTINGS.LDAP.GROUP_ASSOC_INPUT'),
          tagsPlaceholder: $filter('translate')('CORE.SETTINGS.LDAP.GROUP_ASSOC_TAGS'),
          availableOptions: roleOptions,
          inputProperty: 'group',
          tagsProperty: 'roles'
        },
        hideExpression: '!model.hasLdap'
      },
      {
        type: 'section',
        templateOptions: {
          title: $filter('translate')('CORE.SETTINGS.CAS.TITLE')
        },
        hideExpression: '!model.hasCas'
      },
      {
        key: 'casMatches',
        type: 'horizontalMatch',
        templateOptions: {
          label: $filter('translate')('CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL'),
          description: $filter('translate')('CORE.SETTINGS.CAS.GROUP_ASSOC_DESC'),
          addLabel: $filter('translate')('CORE.SETTINGS.CAS.GROUP_ASSOC_ADD'),
          multiple: true,
          inputPlaceholder: $filter('translate')('CORE.SETTINGS.CAS.GROUP_ASSOC_INPUT'),
          tagsPlaceholder: $filter('translate')('CORE.SETTINGS.CAS.GROUP_ASSOC_TAGS'),
          availableOptions: roleOptions,
          inputProperty: 'group',
          tagsProperty: 'roles'
        },
        hideExpression: '!model.hasCas'
      }
    ];

    /**
     * Saves settings.
     */
    this.save = function() {
      var self = this;
      var promises = [];

      if (this.hasLdap && this.formValues.ldapMatches) {
        promises.push(entityService.updateEntity('settings', null, 'core-' + strategies.LDAP, {
          value: this.formValues.ldapMatches
        }));
      }

      if (this.hasCas && this.formValues.casMatches) {
        promises.push(entityService.updateEntity('settings', null, 'core-' + strategies.CAS, {
          value: this.formValues.casMatches
        }));
      }

      if (promises.length) {
        this.isSaving = true;

        $q.all(promises).then(function() {
          self.isSaving = false;
          $scope.$emit('setAlert', 'success', $filter('translate')('CORE.SETTINGS.SAVE_SUCCESS'), 4000);
        });
      }
    };
  }

  app.controller('SettingsController', SettingsController);
  SettingsController.$inject = ['$scope', '$filter', '$q', 'entityService', 'ldapSettings', 'casSettings', 'roles'];

})(angular.module('ov'));
