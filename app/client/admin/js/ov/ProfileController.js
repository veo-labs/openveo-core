(function (app) {
    "use strict"
    app.controller("ProfileController", ProfileController);
    ProfileController.$inject = ["$scope", "$filter", "entityService", "user"];

    /**
     * Defines the profile controller for the profile page.
     */
    function ProfileController($scope, $filter, entityService, user) {
        
        $scope.password = "";
        $scope.confirmPassword = "";
        $scope.isInValid = true;
        
        var getRoles = function () {
            var tmp = "";
            var i = 0;
            for (i = 0; i < user.roles.length - 1; i++) {
                tmp += user.roles[i].name + ", ";
            }
            tmp += user.roles[i].name;
            return tmp;
        }

        /**
         * FORM
         */
        var scopeEditForm = $scope.editFormContainer = {};
        $scope.row = user;
        scopeEditForm.fields = [
            {
                //the key to be used in the model values
                //so this will be bound to vm.user.username
                key: 'name',
                type: 'horizontalExtendInput',
                templateOptions: {
                    label: $filter('translate')('PROFILES.ATTR_NAME'),
                    required: true
                }
            },
            {
                key: 'email',
                type: 'emptyrow',
                templateOptions: {
                    label: $filter('translate')('PROFILES.ATTR_EMAIL'),
                    message: user.email
                }
            }]

        if (user.roles) {
            if (user.roles.length)
                scopeEditForm.fields.push(
                        {
                            noFormControl: true,
                            type: "emptyrow",
                            templateOptions: {
                                label: $filter('translate')('PROFILES.ATTR_ROLES'),
                                message: getRoles()
                            }
                        }
                );
        }

        scopeEditForm.conditionEditDetail = function (user){
            return (user.id !== 0);
        };
        scopeEditForm.onSubmit = function (model, successCb, errorCb) {
            saveProfile(model, successCb, errorCb);
        };

        $scope.onSubmit = function (model, successCb, errorCb) {
            updatePassword(model, successCb, errorCb);
        };

        $scope.cancelForm = function () {
            $scope.password = "";
            $scope.confirmPassword = "";
            $scope.isInValid = true;
        };
        
        $scope.checkValid = function () {
            if (($scope.password === "") || $scope.confirmPassword === "") {
                $scope.isInValid = true;
            }
            else {
                if ($scope.password === $scope.confirmPassword) {
                    $scope.isInValid = false;
                }
                else {
                    $scope.isInValid = true;
                }
                return $scope.isInValid;
            }
        };
        
        $scope.isNotSuperAdmin = function(){
                return (user.id !=0)
        };
        /**
         * updates the user password.
         * @param Object user The user associated to the form
         */
        var updatePassword = function (user) {
            user.saving = true;
            user.password = $scope.password;
            entityService.updateEntity("user", user.id, {
                password: user.password,
                passwordValidate: user.password,
                email: user.email
            }).success(function (data, status, headers, config) {
                user.saving = false;
                $scope.$emit("setAlert", 'success', $filter('translate')('UI.SAVE_SUCCESS'), 4000);
            }).error(function (data, status, headers, config) {
                user.saving = false;
                $scope.$emit("setAlert", 'danger', $filter('translate')('UI.SAVE_ERROR'), 4000);
                if (status === 401)
                    $scope.$parent.logout();
            });
        };
       
        /**
         * Saves the user profile.
         * @param Object form The angular edition form controller
         * @param Object user The user associated to the form
         */
        var saveProfile = function (user, successCb, errorCb) {
            user.saving = true;
            entityService.updateEntity("user", user.id, {
            name: user.name,
            email: user.email
            }).success(function (data, status, headers, config) {
                user.saving = false;
                successCb();
            }).error(function (data, status, headers, config) {
                user.saving = false;
                errorCb();
                if (status === 401)
                    $scope.$parent.logout();
            });
        };
    }
})(angular.module("ov"));