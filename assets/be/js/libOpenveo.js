"use strict";!function(a){function b(a){function b(){g=openVeoSettings.user}function c(b,c){return a.post(h+"authenticate",{login:b,password:c})}function d(){return a.post(h+"logout")}function e(){return g}function f(a){g=a?a:null}var g,h="/be/";return b(),{login:c,logout:d,getUserInfo:e,setUserInfo:f}}var c=a.module("ov.authentication",[]);c.factory("authenticationService",b),b.$inject=["$http"]}(angular);;"use strict";!function(a){function b(){var a=this;this.prefix="ov-",this.type="localStorage",this.$get=["$window",function(b){function c(c){return b[a.type][a.prefix+c]}function d(c,d){b[a.type][a.prefix+c]=d}function e(c){b[a.type].removeItem(a.prefix+c)}return{get:c,add:d,set:d,remove:e}}]}var c=a.module("ov.storage",[]);c.provider("storage",b)}(angular);;"use strict";!function(a){function b(a,b){function c(b,c){if(b&&(!q[b]||void 0===q[b][p])){c||(c=!1);var d=c?"/be/":"/";return d+="getDictionary/"+b+"/"+p,a.get(d).then(function(a){q[b]||(q[b]={}),q[b][p]=a.data}).catch(function(a){q[b]||(q[b]={}),q[b][p]=null})}}function d(a){q[a]&&delete q[a]}function e(a,b){return b&&q[a]?q[a][b]:q[a]}function f(){return p}function g(){return r}function h(a){for(var b=0;b<r.length;b++)if(a===r[b].value)return!0;return!1}function i(){for(var a=0;a<r.length;a++)r[a].active=r[a].value===p}function j(a){h(a)&&(p=a,b.put("language",p),i(p))}function k(a){for(var b=0;b<r.length;b++)if(a===r[b].value)return r[b].label;return null}function l(a,b){if(a&&b){for(var c=a.split("."),d=b,e=0;e<c.length;e++)d[c[e]]&&(d=d[c[e]]);return"string"==typeof d?d:a}return a}function m(a,b){if(b&&q[b])return q[b][p]?l(a,q[b][p]):q[b].en?l(a,q[b].en):a;var c=a;for(var d in q){if(c=l(a,q[d][p]),c===a&&(c=l(a,q[d].en)),c!==a)break;c=a}return c}function n(){q={}}function o(){if(r=[{value:"en",label:"CORE.LANGUAGE.ENGLISH"},{value:"fr",label:"CORE.LANGUAGE.FRENCH"}],h(p))i();else{var a=p.split("-")[0];j(h(a)?a:r[0].value)}}var p=b.get("language")||navigator.language||navigator.browserLanguage,q={},r=[];return o(),{addDictionary:c,removeDictionary:d,getDictionary:e,getLanguage:f,getLanguages:g,setLanguage:j,translate:m,isLanguageSupported:h,getLanguageName:k,destroy:n}}function c(b,c,d){return function(e,f,g){var h,i=b.translate(e,f);return g&&(a.isObject(g)||(g=c(g)(this)),h=d(i),i=h(g)),i}}var d=a.module("ov.i18n",["ngCookies"]);d.factory("i18nService",b),d.filter("translate",c),b.$inject=["$http","$cookies"],c.$inject=["i18nService","$parse","$interpolate"]}(angular);;"use strict";!function(a){function b(b,c){function d(a,b){return a||b?(b||(b="core"),void(a?l[b]&&l[b][a]&&delete l[b][a]:l[b]={})):void(l=[])}function e(a,c,e){var f=c?c+"/":"";return d(a,c),b.put(k+f+a,e)}function f(a,c,e,f){var g=c?c+"/":"";return d(a,c),b.post(k+g+a+"/"+e,f)}function g(a,c,e){var f=c?c+"/":"";return d(a,c),b.delete(k+f+a+"/"+e)}function h(a,c,d){var e=c?c+"/":"";return b.get(k+e+a+"/"+d)}function i(d,e,f,g){var h=c.defer(),i={};g&&(i={timeout:g}),e||(e="core");var j=l[e],m=JSON.stringify(f);if(i.params=f,j&&j[d]&&j[d][m])h.resolve(a.copy(j[d][m]));else{var n=k+("core"!==e?e+"/":"")+d;b.get(n,i).then(function(b){j||(j=l[e]={}),j[d]||(j[d]={}),j[d][m]=a.copy({data:b.data}),h.resolve({data:b.data})})}return h.promise}function j(a,b){function d(){i(a,b,{page:e},null).then(function(a){f=f.concat(a.data.entities),e<a.data.pagination.pages-1?(e++,d()):g.resolve({data:{entities:f}})})}var e=0,f=[],g=c.defer();return d(),g.promise}var k="/be/",l={};return{addEntities:e,updateEntity:f,removeEntities:g,getEntity:h,getEntities:i,getAllEntities:j,deleteCache:d}}var c=a.module("ov.entity",[]);c.factory("entityService",b),b.$inject=["$http","$q"]}(angular);;"use strict";!function(a){function b(a,b){function c(b){return a.alerts.splice(b,1)}function d(b){return c(a.alerts.indexOf(b))}a.alerts=[];var e={add:function(c,e,f){var g={type:c,msg:e,close:function(){return g.timeout&&b.cancel(this.timeout),d(this)}};f&&(g.timeout=b(function(){d(g)},f)),a.alerts.push(g)},closeAll:function(){a.alerts=[]}};return e}var c=a.module("ov.alert",[]);c.factory("alertService",b),b.$inject=["$rootScope","$timeout"]}(angular);;"use strict";!function(a){function b(a){function b(b){return c||(c=io.connect(a.protocol()+"://"+a.host()+":"+openVeoSettings.socketServerPort+b)),c}var c=null;return{initSocket:b}}var c=a.module("ov.socket",[]);c.factory("SocketFactory",b),b.$inject=["$location"]}(angular);;"use strict";!function(a){function b(a){var b={};return b.broadcast=function(b){a.$broadcast("reloadDataTable",{callback:b})},b}function c(){var a=this;a.today=function(){a.dt=new Date},a.today(),a.clear=function(){a.dt=null},a.toggleMax=function(){a.maxDate=a.maxDate?null:new Date},a.toggleMax(),a.open=function(){a.status.opened=!0},a.dateOptions={startingDay:1},a.status={opened:!1}}function d(b,c,d,e){var f=this,g=b.editFormContainer.entityType||"",h=b.editFormContainer.pluginName;this.options={formState:{showForm:!1}},b.$watch("fec.options.formState.showForm",function(){a.forEach(f.fields,function(a){a.runExpressions&&a.runExpressions()})},!0),b.$on("$destroy",function(){f.cancelForm()}),this.init=function(a){f.model=a,b.editFormContainer.init&&b.editFormContainer.init(a),f.fields=b.editFormContainer.fields},this.conditionEditDetail=b.editFormContainer.conditionEditDetail||function(){return!0},this.updateRowBeforeEdit=function(a,c){b.editFormContainer.updateRowObjectBeforeEdit&&b.editFormContainer.updateRowObjectBeforeEdit(a,c);var d=!1;for(var e in c)a[e]&&"object"!=typeof a[e]&&a[e]!=c[e]&&(d=!0,a[e]=c[e]);return d};var i;this.onSubmit=function(){f.model.saving=!0,b.editFormContainer.onSubmit(f.model).then(function(){try{f.options.updateInitialValue()}catch(a){}f.model.saving=!1,f.options.formState.showForm=!1,e.broadcast()},function(){f.options.resetModel(),f.model.saving=!1,f.model=i})},this.editForm=function(){i=a.copy(f.model),d.getEntity(g,h,f.model.id).then(function(a){if(!a.data.entity)return d.deleteCache(g,h),b.$emit("setAlert","danger",c("translate")("CORE.UI.WARNING_ENTITY_DELETED"),8e3),void e.broadcast();var i=a.data.entity,j=f.updateRowBeforeEdit(f.model,i);j&&(b.$emit("setAlert","warning",c("translate")("CORE.UI.WARNING_ENTITY_MODIFIED"),8e3),d.deleteCache(g,h)),b.editFormContainer.pendingEdition=!0,f.options.formState.showForm=!0})},this.cancelForm=function(){b.editFormContainer.pendingEdition=!1,f.options.formState||(f.options.formState={}),f.options.formState.showForm=!1,f.options.resetModel(),f.model=i}}function e(a,b,c){var d=this;this.model=a.addFormContainer.model,this.fields=a.addFormContainer.fields,this.isAddButtonDisabled=!1,this.onSubmit=function(){d.isAddButtonDisabled=!0,a.addFormContainer.onSubmit(d.model).then(function(){d.options.resetModel(),c.broadcast(),a.$emit("setAlert","success",b("translate")("CORE.UI.SAVE_SUCCESS"),4e3),d.isAddButtonDisabled=!1},function(){d.isAddButtonDisabled=!1})},this.options={}}function f(b,c,d,e){var f=this;this.rows=b.tableContainer.rows||{},this.entityType=b.tableContainer.entityType||"",this.filterBy=a.copy(b.tableContainer.filterBy),this.header=b.tableContainer.header||[],this.actions=b.tableContainer.actions||[],this.notSortBy=(b.tableContainer.init?b.tableContainer.init.notSortBy:[]).concat(["action"]),this.conditionToggleDetail=b.editFormContainer.conditionToggleDetail||function(){return!0},this.showSelectAll=b.tableContainer.showSelectAll||!0,this.isRowSelected=!1,this.init={count:10,page:1,sortBy:b.tableContainer.init?b.tableContainer.init.sortBy:this.header[0].key,sortOrder:b.tableContainer.init?b.tableContainer.init.sortOrder:"asc",filterBase:!1},this.customTheme={iconUp:"glyphicon glyphicon-triangle-bottom",iconDown:"glyphicon glyphicon-triangle-top",listItemsPerPage:[5,10,20,30],itemsPerPage:10,loadOnInit:!0,cellTheme:b.tableContainer.cellTheme},this.showSelectAll&&(this.customTheme.templateHeadUrl="views/elements/head.html"),this.customTheme.templateUrl="views/elements/pagination.html";var g=b.tableContainer.pluginName,h=e.defer(),i=[];this.getResource=function(a,b){var c={};h&&(h.promise.status=!0,h.resolve()),h=e.defer();var j=[];return c.limit=b.count,c.page=Math.max(b.page-1,0),c.sortBy=b.sortBy,c.sortOrder="dsc"===b.sortOrder?"desc":"asc",f.filterBy.forEach(function(a){if(a.value&&""!=a.value)switch(a.type){case"date":var b=new Date(a.value);if("date"===a.param){var d=new Date(b);d.setDate(b.getDate()+1),c.dateStart=b.getTime(),c.dateEnd=d.getTime()}else"dateStart"===a.param?c.dateStart=b.getTime():"dateEnd"===a.param&&(b.setDate(b.getDate()+1),b.setMilliseconds(b.getMilliseconds()-1),c.dateEnd=b.getTime());break;case"select":var e=[a.value];if(a.filterWithChildren)for(var f=0;f<a.options.length;f++)if(a.options[f].value===a.value){""!==a.options[f].children&&(e=e.concat(a.options[f].children.split(",")));break}c[a.param]=e;break;default:j.push(a.value)}}),j.length&&(c.query=j.join(" ")),d.getEntities(f.entityType,g,c,h.promise).then(function(a){if(f.rows=a.data.entities,f.selectAll=!1,f.isRowSelected=!1,a.data.pagination.page++,i.length){for(var b=0;b<i.length;b++)i[b]();i=[]}return{rows:f.rows,header:f.header,pagination:a.data.pagination}},function(a){return{}})},this.toggleRowDetails=function(c){f.conditionToggleDetail(c)&&a.forEach(f.rows,function(a){a.opened=a.id===c.id&&!a.opened,b.editFormContainer.pendingEdition=!1})},this.reloadCallback=function(){f.selectAll=!1},b.$on("reloadDataTable",function(a,b){b.callback&&i.push(b.callback),f.reloadCallback()}),this.commonActionExist=!1,this.checkAll=function(){f.commonActionExist=!1,a.forEach(f.rows,function(a){a.selected=f.selectAll}),f.isRowSelected=f.selectAll},this.check=function(){var b=!0;f.isRowSelected=!1,f.commonActionExist=!1,a.forEach(f.rows,function(a){a.selected?f.isRowSelected=!0:b=!1}),f.selectAll=b},this.verifyCondition=function(a){for(var b=!0,c=0;c<f.rows.length&&b;c++){var d=f.rows[c];if(d.selected){var e=!a.condition||a.condition(d);b=b&&a.global&&e}}return f.commonActionExist=f.commonActionExist||b,b},this.prepareSingleAction=function(a,b){a.warningPopup?f.openModal(a.callback,b):a.callback(b,f.reloadCallback)},this.executeGlobalAction=function(a){var b=f.getSelectedId();f.openModal(a.global,b)},this.getSelectedId=function(){for(var a=[],b=0;b<f.rows.length;b++){var c=f.rows[b];c.selected&&a.push(c.id)}return a},this.openModal=function(a,b){var d=c.open({templateUrl:"tableModal.html",controller:"ModalInstanceTableController"});d.result.then(function(){a(b,f.reloadCallback)},function(){})}}function g(a,b){a.ok=function(){b.close(!0)},a.cancel=function(){b.dismiss("cancel")}}var h=a.module("ov.tableForm",["ov.i18n","ngSanitize"]);h.controller("DataTableController",f),h.controller("FormEditController",d),h.controller("FormAddController",e),h.controller("ModalInstanceTableController",g),h.controller("DatePickerController",c),h.factory("tableReloadEventService",b),f.$inject=["$scope","$uibModal","entityService","$q"],d.$inject=["$scope","$filter","entityService","tableReloadEventService"],e.$inject=["$scope","$filter","tableReloadEventService"],g.$inject=["$scope","$uibModalInstance"],c.$inject=["$scope"],b.$inject=["$rootScope"]}(angular);;"use strict";!function(a){a.module("ov.util",[])}(angular);;"use strict";!function(a){function b(a){function b(b){var c=[{name:a("translate")("CORE.UI.NONE"),value:null}];return b.forEach(function(a){c.push({name:a.name,value:a.id})}),c}return{buildSelectOptions:b}}a.factory("utilService",b),b.$inject=["$filter"]}(angular.module("ov.util"));;"use strict";!function(a){function b(){function a(a,b,c){var d,e,f,g={},h=[],i=a.match(/([^?#]*)(?:\?([^#]*))?(?:#(.*))?/);if(!i)throw new TypeError(a+" is not a valid URL");e=i[1],f=i[2],d=i[3],f&&(h=f.split("&"),h.forEach(function(a){var b=a.split("=");g[b[0]]=b[1]})),g[b]=c,h=[];for(var j in g)h.push(j+"="+g[j]);return h.length&&(e+="?"+h.join("&")),d&&(e+="#"+d),e}return{setUrlParameter:a}}a.factory("OvUrlFactory",b),b.$inject=[]}(angular.module("ov.util"));