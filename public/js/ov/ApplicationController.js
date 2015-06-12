(function(app){
  
  "use strict"

  app.controller("ApplicationController", ApplicationController);
  ApplicationController.$inject = ["$scope", "applicationService", "applications", "scopes"];

  /**
   * Defines the applications controller for the applications page.
   */
  function ApplicationController($scope, applicationService, applications, scopes){
    $scope.applications = applications.data.applications;
    $scope.scopes = scopes.data.scopes;
    $scope.scopesOptions = [];
    
    // Prepare the list of options for scopes checkboxes
    for(var scopeName in $scope.scopes){
      $scope.scopesOptions.push({
        label : $scope.scopes[scopeName].name,
        value : scopeName
      });
    }
    
    prepareApplicationsScopes();

    /**
     * Toggles the applications detail.
     * Can't open / close detail of the application if its saving.
     * @param Object application The application associated to the form
     */
    $scope.toggleApplicationDetails = function(application){
      if(!application.saving){
        for(var i = 0 ; i < $scope.applications.length ; i++){
          $scope.applications[i].opened = ($scope.applications[i].id === application.id) ? !$scope.applications[i].opened : false;
        }
      }
    };
    
    /**
     * Removes the application.
     * Can't remove an application if its saving.
     * @param Object application The application to remove
     */
    $scope.removeApplication = function(application){
      if(!application.saving){
        application.saving = true;
        applicationService.removeApplication(application.id).success(function(data, status, headers, config){
          var index = 0;

          // Look for application index
          for(index = 0 ; index < $scope.applications.length ; index++){
            if($scope.applications[index].id === application.id)
              break;
          }

          // Remove application from the list of applications
          $scope.applications.splice(index, 1);

        }).error(function(data, status, headers, config){
          application.saving = false;
          if(status === 401)
            $scope.$parent.logout();
        });
      }
    };

    /**
     * Saves application.
     * @param Object form The angular edition form controller
     * @param Object application The application associated to the form
     */
    $scope.saveApplication = function(form, application){
      application.saving = true;
      form.saving = true;
      
      var applicationScopes = angular.copy($scope.scopes);
      
      for(var scopeName in applicationScopes){
        applicationScopes[scopeName].activated = application.scopesValues.indexOf(scopeName) > -1;
      }

      applicationService.updateApplication(application.id, application.name, applicationScopes).success(function(data, status, headers, config){
        application.saving = form.saving = false;
        form.edition = false;
        form.closeEdition();
        $scope.toggleApplicationDetails(application);
      }).error(function(data, status, headers, config){
        application.saving = form.saving = false;
        if(status === 401)
          $scope.$parent.logout();
      });
    };
    
    /**
     * Opens application edition.
     * @param Object form The angular edition form controller
     */
    $scope.openEdition = function(form){
      form.edition = true;
      form.openEdition();
    };
    
    /**
     * Cancels application edition.
     * @param Object form The angular edition form controller
     */
    $scope.cancelEdition = function(form){
      form.edition = false;
      form.cancelEdition();
    };
    
    /**
     * Adds an application.
     * @param Object form The angular form controller
     */
    $scope.addApplication = function(form){
      form.saving = true;
      var scopes = {};
      
      // Get selected scopes
      for(var scopeName in $scope.scopes){
        scopes[scopeName] = {name : scopeName};
        scopes[scopeName].activated = $scope.scopes[scopeName].activated || false;
      }
      
      applicationService.addApplication($scope.applicationName, scopes).success(function(data, status, headers, config){
        form.saving = false;
        resetAddForm(form);
        $scope.applications.push(data.application);
        prepareApplicationsScopes();
      }).error(function(data, status, headers, config){
        form.saving = false;
        if(status === 401)
          $scope.$parent.logout();
      });
    };
    
    /**
     * Resets add's form values.
     * @param Object form The formular to reset
     */
    function resetAddForm(form){
      $scope.applicationName = null;
      form.$submitted = false;
      for(var scopeName in $scope.scopes)
        $scope.scopes[scopeName].activated = false;
    }
    
    /**
     * Prepares activated scopes by application.
     */ 
    function prepareApplicationsScopes(){
      
      // Prepare the list of values for application's scopes
      for(var i = 0 ; i < $scope.applications.length ; i++){
        var application = $scope.applications[i];
        application["scopesValues"] = [];

        for(var scopeId in application["scopes"])
          if(application["scopes"][scopeId].activated)
            application["scopesValues"].push(scopeId);
      }
      
    }

  }

})(angular.module("ov"));