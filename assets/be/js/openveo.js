"use strict";!function(){"undefined"==typeof SVGElement.prototype.contains&&(SVGElement.prototype.contains=HTMLDivElement.prototype.contains);var a="undefined"!=typeof HTMLDocument?HTMLDocument:"undefined"!=typeof Document?Document:null;a&&"undefined"==typeof a.prototype.contains&&(a.prototype.contains=function(a){return Boolean(16&this.compareDocumentPosition(a))})}();;"use strict";!function(a){var b=["ngRoute","ov.authentication","ov.storage","ov.i18n","ov.entity","ov.alert","ov.tableForm","ov.utilService","ov.socket","ui.bootstrap","ui.tree","ngTasty","formly","formlyBootstrap","ngJSONPath","ngAnimate","checklist-model","ui.tinymce"];"undefined"!=typeof openVeoSettings&&openVeoSettings.plugins&&a.forEach(openVeoSettings.plugins,function(c){a.module("ov."+c),b.push("ov."+c)});var c=a.module("ov",b);c.run(["formlyConfig","$filter","$sce",function(b,c,d){b.setWrapper({name:"collapse",templateUrl:"ov-core-collapse.html"}),b.setWrapper({name:"horizontalBootstrapLabel",templateUrl:"ov-core-horizontal-bootstrap-label.html"}),b.setWrapper({name:"horizontalBootstrapLabelOnly",templateUrl:"ov-core-horizontal-bootstrap-label-only.html"}),b.setWrapper({name:"editableWrapper",templateUrl:"ov-core-editable-wrapper.html"}),b.setType({name:"tags",templateUrl:"ov-core-formly-tags.html",defaultOptions:{validation:{show:!0}}}),b.setType({name:"emptyrow",templateUrl:"ov-core-empty-row.html",wrapper:["horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({extends:"input",name:"editableInput",link:function(a,b,c){a.show=function(){return a.isEmpty=!a.model[a.options.key],a.model[a.options.key]||"CORE.UI.EMPTY"}}}),b.setType({extends:"select",name:"editableSelect",link:function(a,b,c){a.show=function(){var b,c=[];return b="[object Array]"===Object.prototype.toString.call(a.model[a.options.key])?a.model[a.options.key]:[a.model[a.options.key]],a.to.options.forEach(function(a){b.forEach(function(b){a.value===b&&c.push(a.name)})}),a.isEmpty=!c.length,c.length?c.join(", "):"CORE.UI.EMPTY"}}}),b.setType({name:"editableTags",extends:"tags",wrapper:["editableTagsWrapper"],link:function(a,b,c){a.show=function(){var b=a.model[a.options.key];return a.isEmpty=!b||!b.length,b&&b.join(", ")||"CORE.UI.EMPTY"}}}),b.setType({name:"ovMultiCheckBox",templateUrl:"ov-core-formly-multi-check-box.html"}),b.setType({name:"ovEditableMultiCheckBox",extends:"ovMultiCheckBox",link:function(b){b.show=function(){var c=[];return a.forEach(b.to.options,function(a){b.model[b.options.key]&&b.model[b.options.key].indexOf(a.id)>=0&&c.push(a.name)}),b.isEmpty=!c.length,c.length?c.join(", "):"CORE.UI.EMPTY"}}}),b.setType({extends:"checkbox",name:"editableCheckbox",link:function(a,b,c){a.show=function(){return a.isEmpty=!1,a.model[a.options.key]&&"CORE.UI.TRUE"||"CORE.UI.FALSE"}}}),b.setType({name:"ovTinymce",templateUrl:"ov-core-textarea-tinymce.html"}),b.setType({name:"ovEditableTinymce",extends:"ovTinymce",link:function(a){a.show=function(){return a.isEmpty=!a.model[a.options.key],a.model[a.options.key]||"CORE.UI.EMPTY"}}}),b.setType({name:"horizontalTinymce",extends:"ovTinymce",wrapper:["horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalEditableTinymce",extends:"ovEditableTinymce",wrapper:["editableWrapper","horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalInput",extends:"input",wrapper:["horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalEditableInput",extends:"editableInput",wrapper:["editableWrapper","horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalSelect",extends:"select",wrapper:["horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalEditableSelect",extends:"editableSelect",wrapper:["editableWrapper","horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalMultiCheckbox",extends:"ovMultiCheckBox",wrapper:["horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalEditableMultiCheckbox",extends:"ovEditableMultiCheckBox",wrapper:["editableWrapper","horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalTags",extends:"tags",wrapper:["horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalEditableTags",extends:"editableTags",wrapper:["editableWrapper","horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalCheckbox",extends:"checkbox",wrapper:["horizontalBootstrapLabel","bootstrapHasError"]}),b.setType({name:"horizontalEditableCheckbox",extends:"editableCheckbox",wrapper:["editableWrapper","horizontalBootstrapLabel","bootstrapHasError"]})}]),c.config(["$routeProvider","$locationProvider","$httpProvider",function(a,b,c){a.when("/",{templateUrl:"views/home.html",controller:"HomeController",title:"CORE.HOME.PAGE_TITLE"}),a.when("/login",{title:"CORE.LOGIN.PAGE_TITLE",templateUrl:"views/login.html",controller:"LoginController",resolve:{i18nCommon:["i18nService",function(a){return a.addDictionary("common")}],i18nLogin:["i18nService",function(a){return a.addDictionary("login")}]}}).otherwise("/"),a.when("/applications-list",{templateUrl:"views/applications.html",controller:"ApplicationController",title:"CORE.APPLICATIONS.PAGE_TITLE",access:"core-access-applications-page",resolve:{scopes:["applicationService",function(a){return a.loadScopes()}]}}),a.when("/users-list",{templateUrl:"views/users.html",controller:"UserController",title:"CORE.USERS.PAGE_TITLE",access:"core-access-users-page",resolve:{roles:["userService",function(a){return a.loadRoles()}]}}),a.when("/profile",{templateUrl:"views/profile.html",controller:"ProfileController",title:"CORE.PROFILES.PAGE_TITLE",resolve:{user:["authenticationService",function(a){return a.getUserInfo()}]}}),a.when("/roles-list",{templateUrl:"views/roles.html",controller:"RoleController",title:"CORE.ROLES.PAGE_TITLE",access:"core-access-roles-page",resolve:{permissions:["userService",function(a){return a.loadPermissions()}]}}),a.when("/groups-list",{templateUrl:"views/groups.html",controller:"GroupController",title:"CORE.GROUPS.PAGE_TITLE",access:"core-access-groups-page"}),b.html5Mode(!0),c.interceptors.push("errorInterceptor"),FastClick.attach(document.body)}]),c.filter("noBreakSpace",function(){return function(a){return a.replace(/ /g," ")}})}(angular);;"use strict";!function(a,b){function c(a,b){var c,d;return a.data&&a.data.error&&(c=a.data.error.code,d=a.data.error.module),403===a.status?b("translate")("CORE.ERROR.FORBIDDEN"):400===a.status?b("translate")("CORE.ERROR.CLIENT")+" (code="+c+", module="+d+")":c&&d?b("translate")("CORE.ERROR.SERVER")+" (code="+c+", module="+d+")":b("translate")("CORE.ERROR.SERVER")}function d(a,b,d){return{responseError:function(e){return 401===e.status?a.$broadcast("forceLogout"):e.status==-1?e.config&&e.config.timeout&&e.config.timeout.status||a.$broadcast("setAlert","danger",c(e,b),0):a.$broadcast("setAlert","danger",c(e,b),0),d.reject(e)}}}b.factory("errorInterceptor",d),d.$inject=["$rootScope","$filter","$q"]}(angular,angular.module("ov"));;"use strict";!function(a){function b(a,b,c,d,e,f,g,h,i,j,k,l,m){function n(){b.closeResponsiveMenu(),e.setUserInfo(),b.menu=!1,b.displayMainMenu=!1,f.destroyMenu(),i.removeDictionary("back-office"),g.destroy(),h.destroy(),k.deleteCache(),j.closeAll(),c.path("/login")}function o(a,b){var c=[];return angular.forEach((a||"").split(":"),function(a,d){if(0===d)c.push(a);else{var e=a.match(/(\w+)(?:[?*])?(.*)/),f=e[1];c.push(b[f]),c.push(e[2]||""),delete b[f]}}),c.join("")}function p(a,b){return b=angular.copy(b),b&&Object.keys(b).length?o(a,b):a}function q(a,b){var c=[];return a&&a.length&&a.forEach(function(a){c.push(b+"-group-"+a)}),c}b.displayMainMenu=!1,b.isResponsiveMenuClosed=!0,b.languages=i.getLanguages(),b.language=i.getLanguageName(i.getLanguage()),b.indexOpen=-1,b.menuDropdownIsOpen=!1,b.newAnimation="",b.toggleResponsiveMenu=function(){b.isResponsiveMenuClosed=!b.isResponsiveMenuClosed},b.closeResponsiveMenu=function(){!b.isResponsiveMenuClosed&&b.displayMainMenu&&(b.isResponsiveMenuClosed=!0)},b.openResponsiveMenu=function(){b.isResponsiveMenuClosed&&b.displayMainMenu&&(b.isResponsiveMenuClosed=!1)},b.navigate=function(a){a&&(b.closeResponsiveMenu(),c.path(angular.element(a.currentTarget).attr("href")))},b.changeLanguage=function(a){i.setLanguage(a),l.location.reload()},b.toggleSidebarSubMenu=function(a){b.indexOpen==-1?b.indexOpen=a:b.indexOpen==a?b.indexOpen=-1:b.indexOpen=a},b.logout=function(){e.logout().then(n,n)},b.$on("setAlert",function(a,b,c,d){j.add(b,c,d)}),b.$on("logout",function(){b.logout()}),b.$on("forceLogout",function(){n()}),b.$on("$routeChangeStart",function(a,g){var h=g.params,j=p(g.originalPath,h);if(!j)return!1;var k=e.getUserInfo(),l=i.getDictionary("back-office",i.getLanguage());if(!("/login"===c.path()||!k||f.getMenu()&&l)){a.preventDefault();var o={i18nCommon:i.addDictionary("common"),i18nBE:i.addDictionary("back-office",!0),menu:f.loadMenu()};return m.all(o).then(function(a){j===p(c.path(),h)?d.reload():c.path(j)},function(a){401===a.status&&(n(),d.reload())}),!1}if("/login"!==c.path()&&!k)return a.preventDefault(),c.path("/login"),!1;if("/login"!==c.path()&&k){if(b.userInfo=k,g.access&&!b.checkAccess(g.access))return a.preventDefault(),c.path("/"),!1;"LR"==a.targetScope.newAnimation?a.currentScope.newAnimation="RL":"RL"==a.targetScope.newAnimation?a.currentScope.newAnimation="LR":a.currentScope.newAnimation=""}else if("/login"===c.path()&&k)return a.preventDefault(),c.path("/"),!1}),b.$on("$routeChangeSuccess",function(c,g){k.deleteCache(),b.userInfo=e.getUserInfo(),b.userInfo?(b.menu=f.getMenu(),b.displayMainMenu=!!b.menu,f.setActiveMenuItem()):b.displayMainMenu=!1,b.title=d.current&&d.current.title||"",b.newAnimation=a.newAnimation}),b.$on("$routeChangeError",function(a,d,e,f){b.userInfo?f&&f.redirect?c.path(f.redirect):c.path("/"):c.path("/login")}),b.checkAccess=function(a){if(b.userInfo){if(0==b.userInfo.id)return!0;if("string"==typeof a&&(a=[a]),b.userInfo.roles&&0!=b.userInfo.roles.length&&b.userInfo.permissions&&0!=b.userInfo.permissions.length)return a.filter(function(a){return b.userInfo.permissions.indexOf(a)>=0}).length>0}return!1},b.checkContentAccess=function(a,c){if(b.userInfo&&a&&c){if("0"===b.userInfo.id||"1"===a.metadata.user||b.userInfo.id===a.metadata.user)return!0;if(a.metadata.groups&&a.metadata.groups.length)for(var d=q(a.metadata.groups,c),e=0;e<d.length;e++)if(b.userInfo.permissions.indexOf(d[e])>=0)return!0}return!1}}a.controller("MainController",b),b.$inject=["$rootScope","$scope","$location","$route","authenticationService","menuService","applicationService","userService","i18nService","alertService","entityService","$window","$q"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b,c,d,e){a.verticalAlign=!0,a.onError=!1,a.languages=e.getLanguages(),a.language=e.getLanguage(),a.changeLanguage=function(a){e.setLanguage(a),c.location.reload()},a.signIn=function(){var c=d.login(a.userEmail,a.password);c&&c.then(function(a){d.setUserInfo(a.data),b.path("/")},function(){a.onError=!0,a.userEmail=a.password=""})}}a.controller("LoginController",b),b.$inject=["$scope","$location","$window","authenticationService","i18nService"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b){a.version=openVeoSettings.version,a.open=function(c){b.open({templateUrl:"versionModal.html",controller:"ModalInstanceCtrl",size:c,resolve:{items:function(){return a.version}}})}}function c(a,b,c){a.items=c,a.close=function(){b.close("close")}}a.controller("HomeController",b),a.controller("ModalInstanceCtrl",c),b.$inject=["$scope","$uibModal"],c.$inject=["$scope","$uibModalInstance","items"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b,c,d){function e(){angular.forEach(a.scopes,function(a){a.name=b("translate")(a.name),a.description=b("translate")(a.description)})}function f(d,e){c.removeEntity(i,null,d.join(",")).then(function(){a.$emit("setAlert","success",b("translate")("CORE.APPLICATIONS.REMOVE_SUCCESS"),4e3),e()})}function g(a){return c.updateEntity(i,null,a.id,{name:a.name,scopes:a.scopes})}function h(a){return c.addEntity(i,null,a)}var i="applications";a.scopes=d.data.scopes,e(),a.rights={},a.rights.add=a.checkAccess("core-add-"+i),a.rights.edit=a.checkAccess("core-update-"+i),a.rights.delete=a.checkAccess("core-delete-"+i);var j=a.tableContainer={};j.entityType=i,j.filterBy=[{key:"query",value:"",label:b("translate")("CORE.APPLICATIONS.QUERY_FILTER")}],j.header=[{key:"name",name:b("translate")("CORE.APPLICATIONS.NAME_COLUMN"),class:["col-xs-11"]},{key:"action",name:b("translate")("CORE.UI.ACTIONS_COLUMN"),class:["col-xs-1"]}],j.actions=[{label:b("translate")("CORE.UI.REMOVE"),warningPopup:!0,condition:function(b){return a.rights.delete&&!b.locked&&!b.saving},callback:function(a,b){f([a.id],b)},global:function(a,b){f(a,b)}}];var k=a.editFormContainer={};k.model={},k.entityType=i,k.init=function(a){k.fields[1].templateOptions.message=a.id,k.fields[2].templateOptions.message=a.secret},k.fields=[{key:"name",type:"horizontalEditableInput",templateOptions:{label:b("translate")("CORE.APPLICATIONS.ATTR_NAME"),required:!0}},{noFormControl:!0,type:"emptyrow",templateOptions:{label:b("translate")("CORE.APPLICATIONS.ATTR_ID"),message:""}},{noFormControl:!0,type:"emptyrow",templateOptions:{label:b("translate")("CORE.APPLICATIONS.ATTR_SECRET"),message:""}}],0!=a.scopes.length&&k.fields.push({key:"scopes",type:"horizontalEditableMultiCheckbox",templateOptions:{label:b("translate")("CORE.APPLICATIONS.ATTR_SCOPES"),options:a.scopes,valueProperty:"id",labelProperty:"name"}}),k.conditionEditDetail=function(b){return a.rights.edit&&!b.locked},k.onSubmit=function(a){return g(a)};var l=a.addFormContainer={};l.model={},l.fields=[{key:"name",type:"horizontalInput",templateOptions:{label:b("translate")("CORE.APPLICATIONS.FORM_ADD_NAME"),required:!0,description:b("translate")("CORE.APPLICATIONS.FORM_ADD_NAME_DESC")}}],0==a.scopes.length?l.fields.push({noFormControl:!0,template:"<p>"+b("translate")("CORE.APPLICATIONS.NO_APPLICATIONS")+"</p>"}):l.fields.push({key:"scopes",type:"horizontalMultiCheckbox",templateOptions:{label:b("translate")("CORE.APPLICATIONS.FORM_ADD_SCOPES"),required:!1,options:a.scopes,valueProperty:"id",labelProperty:"name",description:b("translate")("CORE.APPLICATIONS.FORM_ADD_SCOPES_DESC")},expressionProperties:{"templateOptions.disabled":"!model.name"}}),l.onSubmit=function(a){return h(a)}}a.controller("ApplicationController",b),b.$inject=["$scope","$filter","entityService","scopes"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b,c,d,e){function f(){angular.forEach(a.permissions,function(a){a.label=b("translate")(a.label),angular.forEach(a.permissions,function(a){a.name=b("translate")(a.name),a.description=b("translate")(a.description)})})}function g(a){var b={name:a.name,permissions:[]};return angular.forEach(a,function(a,c){var d="permissions_";c.slice(0,d.length)==d&&(b.permissions=b.permissions.concat(a))}),b}function h(a){var b=g(a);return c.updateEntity(l,null,a.id,b).then(function(){a.permissions=angular.copy(b.permissions),d.cacheClear(l)})}function i(a){var b=g(a);return c.addEntity(l,null,b).then(function(){a.permissions=angular.copy(b.permissions),d.cacheClear(l)})}function j(a,b){var c={};return angular.forEach(a,function(a,d){angular.forEach(a.permissions,function(a){c["permissions_"+d]||(c["permissions_"+d]=[]),b.indexOf(a.id)>=0&&c["permissions_"+d].push(a.id)})}),c}function k(e,f){c.removeEntity(l,null,e.join(",")).then(function(){d.cacheClear(l),a.$emit("setAlert","success",b("translate")("CORE.ROLES.REMOVE_SUCCESS"),4e3),f()})}var l="roles";a.permissions=e.data.permissions;var m;f(),a.rights={},a.rights.add=a.checkAccess("core-add-"+l),a.rights.edit=a.checkAccess("core-update-"+l),a.rights.delete=a.checkAccess("core-delete-"+l);var n=a.tableContainer={};n.entityType=l,n.filterBy=[{key:"query",value:"",label:b("translate")("CORE.ROLES.QUERY_FILTER")}],n.header=[{key:"name",name:b("translate")("CORE.ROLES.NAME_COLUMN"),class:["col-xs-11"]},{key:"action",name:b("translate")("CORE.UI.ACTIONS_COLUMN"),class:["col-xs-1"]}],n.actions=[{label:b("translate")("CORE.UI.REMOVE"),warningPopup:!0,condition:function(b){return a.rights.delete&&!b.locked&&!b.saving},callback:function(a,b){k([a.id],b)},global:function(a,b){k(a,b)}}];var o=a.editFormContainer={};o.model={},o.entityType=l,o.init=function(b){var c=j(a.permissions,b.permissions);angular.forEach(c,function(a,c){b[c]=a})},o.fields=[{key:"name",type:"horizontalEditableInput",templateOptions:{label:b("translate")("CORE.ROLES.ATTR_NAME"),required:!0}}],0==a.permissions.length?o.fields.push({noFormControl:!0,template:"<p>"+b("translate")("CORE.ROLES.NO_DATA")+"</p>"}):(m=[],o.fields.push({noFormControl:!0,templateOptions:{label:b("translate")("CORE.ROLES.FORM_ADD_PERMISSIONS")},wrapper:["horizontalBootstrapLabelOnly"],template:""}),angular.forEach(a.permissions,function(a,b){m.push({key:"permissions_"+b,type:"ovEditableMultiCheckBox",wrapper:["editableWrapper","collapse"],templateOptions:{label:"",labelCollapse:a.label,options:a.permissions,valueProperty:"id",labelProperty:"name"}})}),o.fields.push({className:"col-md-8 col-push-md-4",fieldGroup:m})),o.conditionEditDetail=function(b){return a.rights.edit&&!b.locked},o.onSubmit=function(a){return h(a)};var p=a.addFormContainer={};p.model={},p.fields=[{key:"name",type:"horizontalInput",templateOptions:{label:b("translate")("CORE.ROLES.FORM_ADD_NAME"),required:!0,description:b("translate")("CORE.ROLES.FORM_ADD_NAME_DESC")}}],0==a.permissions.length?p.fields.push({noFormControl:!0,template:"<p>"+b("translate")("CORE.ROLES.NO_DATA")+"</p>"}):(m=[],p.fields.push({noFormControl:!0,templateOptions:{label:b("translate")("CORE.ROLES.FORM_ADD_PERMISSIONS")},wrapper:["horizontalBootstrapLabelOnly"],template:""}),angular.forEach(a.permissions,function(a,b){m.push({key:"permissions_"+b,type:"ovMultiCheckBox",wrapper:["collapse"],templateOptions:{label:"",labelCollapse:a.label,options:a.permissions,valueProperty:"id",labelProperty:"name"}})}),p.fields.push({className:"col-md-8 col-push-md-4",fieldGroup:m})),p.onSubmit=function(a){return i(a)}}a.controller("RoleController",b),b.$inject=["$scope","$filter","entityService","userService","permissions"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b,c,d){function e(a){var b={name:a.name,email:a.email,password:a.password,passwordValidate:a.passwordValidate,roles:a.roles||[]};return c.addEntity(h,null,b)}function f(d,e){c.removeEntity(h,null,d.join(",")).then(function(){a.$emit("setAlert","success",b("translate")("CORE.USERS.REMOVE_SUCCESS"),4e3),e()})}function g(a){return c.updateEntity(h,null,a.id,{name:a.name,email:a.email,roles:a.roles})}var h="users",i="^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$";a.roles=d.data.entities,a.rights={},a.rights.add=a.checkAccess("core-add-"+h),a.rights.edit=a.checkAccess("core-update-"+h),a.rights.delete=a.checkAccess("core-delete-"+h);var j=a.tableContainer={};j.entityType=h,j.filterBy=[{key:"query",value:"",label:b("translate")("CORE.USERS.QUERY_FILTER")}],j.header=[{key:"name",name:b("translate")("CORE.USERS.NAME_COLUMN"),class:["col-xs-11"]},{key:"action",name:b("translate")("CORE.UI.ACTIONS_COLUMN"),class:["col-xs-1"]}],j.actions=[{label:b("translate")("CORE.UI.REMOVE"),warningPopup:!0,condition:function(b){return a.rights.delete&&!b.locked&&!b.saving},callback:function(a,b){f([a.id],b)},global:function(a,b){f(a,b)}}];var k=a.editFormContainer={};k.model={},k.entityType=h,k.fields=[{key:"name",type:"horizontalEditableInput",templateOptions:{label:b("translate")("CORE.USERS.ATTR_NAME"),required:!0}},{key:"email",type:"horizontalEditableInput",templateOptions:{label:b("translate")("CORE.USERS.ATTR_EMAIL"),required:!0,pattern:i}}],0!=a.roles.length&&k.fields.push({key:"roles",type:"horizontalEditableMultiCheckbox",templateOptions:{label:b("translate")("CORE.USERS.ATTR_ROLE"),required:!1,options:a.roles,valueProperty:"id",labelProperty:"name"}}),k.conditionEditDetail=function(b){return a.rights.edit&&!b.locked},k.onSubmit=function(a){return g(a)};var l=a.addFormContainer={};l.model={},l.fields=[{key:"name",type:"horizontalInput",templateOptions:{label:b("translate")("CORE.USERS.FORM_ADD_NAME"),required:!0,description:b("translate")("CORE.USERS.FORM_ADD_NAME_DESC")}},{key:"email",type:"horizontalInput",templateOptions:{type:"email",label:b("translate")("CORE.USERS.FORM_ADD_EMAIL"),required:!0,description:b("translate")("CORE.USERS.FORM_ADD_EMAIL_DESC"),pattern:i},expressionProperties:{"templateOptions.disabled":"!model.name"}},{key:"password",type:"horizontalInput",templateOptions:{type:"password",label:b("translate")("CORE.USERS.FORM_ADD_PASSWORD"),required:!0,description:b("translate")("CORE.USERS.FORM_ADD_PASSWORD_DESC")},expressionProperties:{"templateOptions.disabled":"!model.email"}},{key:"passwordValidate",type:"horizontalInput",templateOptions:{type:"password",label:b("translate")("CORE.USERS.FORM_ADD_PASSWORD_VALIDATE"),required:!0,description:b("translate")("CORE.USERS.FORM_ADD_PASSWORD_VALIDATE_DESC")},expressionProperties:{"templateOptions.disabled":"!model.password"}}],0==a.roles.length?l.fields.push({noFormControl:!0,type:"emptyrow",templateOptions:{label:b("translate")("CORE.USERS.FORM_ADD_ROLE"),message:b("translate")("CORE.USERS.NO_ROLE")}}):l.fields.push({key:"roles",type:"horizontalMultiCheckbox",templateOptions:{label:b("translate")("CORE.USERS.FORM_ADD_ROLE"),required:!1,options:a.roles,valueProperty:"id",labelProperty:"name",description:b("translate")("CORE.USERS.FORM_ADD_ROLE_DESC")},expressionProperties:{"templateOptions.disabled":"!model.passwordValidate"}}),l.onSubmit=function(a){return e(a)}}a.controller("UserController",b),b.$inject=["$scope","$filter","entityService","roles"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b,c,d){function e(a){return c.addEntity(h,null,a).then(function(){d.cacheClear("permissions")})}function f(a){return c.updateEntity(h,null,a.id,a).then(function(){d.cacheClear("permissions")})}function g(e,f){c.removeEntity(h,null,e.join(",")).then(function(){d.cacheClear("permissions"),a.$emit("setAlert","success",b("translate")("CORE.GROUPS.REMOVE_SUCCESS"),4e3),f()})}var h="groups";a.rights={},a.rights.add=a.checkAccess("core-add-"+h),a.rights.edit=a.checkAccess("core-update-"+h),a.rights.delete=a.checkAccess("core-delete-"+h);var i=a.addFormContainer={};i.model={},i.fields=[{key:"name",type:"horizontalInput",templateOptions:{label:b("translate")("CORE.GROUPS.FORM_ADD_NAME"),required:!0,description:b("translate")("CORE.GROUPS.FORM_ADD_NAME_DESC")}},{key:"description",type:"horizontalInput",templateOptions:{label:b("translate")("CORE.GROUPS.FORM_ADD_DESCRIPTION"),required:!0,description:b("translate")("CORE.GROUPS.FORM_ADD_DESCRIPTION_DESC")}}],i.onSubmit=function(a){return e(a)};var j=a.tableContainer={};j.entityType=h,j.filterBy=[{key:"query",label:b("translate")("CORE.GROUPS.QUERY_FILTER")}],j.header=[{key:"name",name:b("translate")("CORE.GROUPS.NAME_COLUMN"),class:["col-xs-11"]},{key:"action",name:b("translate")("CORE.UI.ACTIONS_COLUMN"),class:["col-xs-1"]}],j.actions=[{label:b("translate")("CORE.UI.REMOVE"),warningPopup:!0,condition:function(b){return a.rights.delete&&!b.locked&&!b.saving},callback:function(a,b){g([a.id],b)},global:function(a,b){g(a,b)}}];var k=a.editFormContainer={};k.model={},k.entityType=h,k.fields=[{key:"name",type:"horizontalEditableInput",templateOptions:{label:b("translate")("CORE.GROUPS.ATTR_NAME"),required:!0}},{key:"description",type:"horizontalEditableInput",templateOptions:{label:b("translate")("CORE.GROUPS.ATTR_DESCRIPTION"),required:!0}}],k.conditionEditDetail=function(b){return a.rights.edit&&!b.locked},k.onSubmit=function(a){return f(a)}}a.controller("GroupController",b),b.$inject=["$scope","$filter","entityService","userService"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b,c,d,e){function f(){var a="",b=0;for(b=0;b<e.roles.length-1;b++)a+=e.roles[b].name+", ";return a+=e.roles[b].name}function g(c){c.saving=!0,c.password=a.password,d.updateEntity(i,null,c.id,{password:c.password,passwordValidate:c.password,email:c.email}).then(function(){c.saving=!1,a.$emit("setAlert","success",b("translate")("CORE.UI.SAVE_SUCCESS"),4e3),a.password="",a.confirmPassword="",a.isInValid=!0},function(a,b){c.saving=!1})}function h(a){return a.saving=!0,e.name=a.name,d.updateEntity(i,null,a.id,{name:a.name,email:a.email}).then(function(){c.setUserInfo(e)}).finally(function(){a.saving=!1})}var i="users";a.password="",a.confirmPassword="",a.isInValid=!0;var j=a.editFormContainer={};a.row=e,j.entityType=i,j.fields=[{key:"name",type:"horizontalEditableInput",templateOptions:{label:b("translate")("CORE.PROFILES.ATTR_NAME"),required:!0}},{key:"email",type:"emptyrow",templateOptions:{label:b("translate")("CORE.PROFILES.ATTR_EMAIL"),message:e.email}}],e.roles&&e.roles.length&&j.fields.push({noFormControl:!0,type:"emptyrow",templateOptions:{label:b("translate")("CORE.PROFILES.ATTR_ROLES"),message:f()}}),j.conditionEditDetail=function(a){return 0!==a.id},j.onSubmit=function(a){return h(a)},a.onSubmit=function(a){g(a)},a.cancelForm=function(){a.password="",a.confirmPassword="",a.isInValid=!0},a.checkValid=function(){return""!==a.password&&""!==a.confirmPassword?(a.password===a.confirmPassword?a.isInValid=!1:a.isInValid=!0,a.isInValid):void(a.isInValid=!0)},a.passwordEditable=function(){return 0!=e.id&&!e.locked}}a.controller("ProfileController",b),b.$inject=["$scope","$filter","authenticationService","entityService","user"]}(angular.module("ov"));;"use strict";!function(a,b){function c(b,c,d){function e(){if(i){var b=d.path();for(var c in i)if(a.isArray(i[c].subMenu)){i[c].active=!1;for(var e=0;e<i[c].subMenu.length;e++)i[c].subMenu[e].active="/"+i[c].subMenu[e].path===b,i[c].active=i[c].active||i[c].subMenu[e].active}else i[c].active="/"+i[c].path===b}}function f(){return i?c.when(i):b.get(j+"getMenu").success(function(a){i=a,e()})}function g(){return i}function h(){i=null}var i,j="/be/";return{loadMenu:f,getMenu:g,destroyMenu:h,setActiveMenuItem:e}}b.factory("menuService",c),c.$inject=["$http","$q","$location"]}(angular,angular.module("ov"));;"use strict";!function(a){function b(a,b){function c(){return i?b.when({data:{entities:i}}):a.get(k+"roles").success(function(a){i=a.entities})}function d(){return j?b.when({data:j}):a.get(k+"permissions").success(function(a){j=a})}function e(){return i}function f(){return j}function g(){i=j=null}function h(a){if(a)switch(a){case"roles":i=null;break;case"permissions":j=null;break;default:return}else i=j=null}var i,j,k="/be/";return{loadRoles:c,loadPermissions:d,getRoles:e,getPermissions:f,destroy:g,cacheClear:h}}a.factory("userService",b),b.$inject=["$http","$q"]}(angular.module("ov"));;"use strict";!function(a){function b(a,b){function c(){return f?b.when({data:f}):a.get(g+"ws/scopes").success(function(a){f=a})}function d(){return f}function e(){f=null}var f,g="/be/";return{destroy:e,loadScopes:c,getScopes:d}}a.factory("applicationService",b),b.$inject=["$http","$q"]}(angular.module("ov"));;"use strict";!function(a,b){function c(){var a=35;return function(b){return b&&""!=b&&b.length>a&&(b=b.slice(0,a)+"..."),b}}b.filter("truncate",c)}(angular,angular.module("ov"));;"use strict";!function(a){function b(){return{restrict:"E",templateUrl:"ov-core-tags.html",require:["?ngModel"],replace:!0,scope:!0,link:function(a,b,c,d){var e=d[0];a.editableTagsInput="",e.$render=function(){a.tags=angular.copy(e.$viewValue)||[]},a.addTag=function(b){13===b.keyCode&&(a.editableTagsInput&&(a.tags.push(a.editableTagsInput),a.editableTagsInput="",e.$setViewValue(angular.copy(a.tags))),b.stopImmediatePropagation(),b.stopPropagation(),b.preventDefault(),e.$validate())},a.removeTag=function(b,c){a.tags.splice(c,1),e.$setViewValue(angular.copy(a.tags)),b.stopImmediatePropagation(),b.stopPropagation(),b.preventDefault(),e.$validate()},e.$isEmpty=function(a){return!a||0===a.length}}}}a.directive("ovTags",b)}(angular.module("ov"));;"use strict";!function(a){function b(){return{restrict:"E",templateUrl:"ov-core-mutli-check-box.html",require:["?ngModel"],replace:!0,scope:{options:"=",labelProperty:"=?",valueProperty:"=?",disabled:"=?"},link:function(a,b,c,d){function e(b){for(var c=0;c<a.options.length;c++)if(a.options[c][a.valueProperty]===b)return c;return-1}var f,g=d[0],h=NaN;a.labelProperty=a.labelProperty||"name",a.valueProperty=a.valueProperty||"value",g.$render=function(){var b=angular.copy(g.$viewValue)||[];a.values=[];for(var c=0;c<b.length;c++){var d=e(b[c]);d>=0&&(a.values[d]=!0)}},a.onChange=function(){for(var b=[],c=0;c<a.values.length;c++)a.values[c]&&b.push(a.options[c][a.valueProperty]);g.$setViewValue(b)},a.$watch(function(){h!==g.$viewValue||angular.equals(f,g.$viewValue)||(f=angular.copy(g.$viewValue),g.$render()),h=g.$viewValue}),g.$isEmpty=function(a){return!a||0===a.length}}}}a.directive("ovMultiCheckBox",b)}(angular.module("ov"));