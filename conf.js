'use strict';

module.exports = {
  routes: {
    public: {
      'get /getDictionary/:dictionary/:code': 'app/server/controllers/I18nController.getDictionaryAction'
    },
    private: {
      'get /login': 'app/server/controllers/DefaultController.defaultAction',
      'post /authenticate': 'app/server/controllers/AuthenticationController.authenticateAction',
      '*': 'app/server/controllers/AuthenticationController.restrictAction',
      'post /logout': 'app/server/controllers/AuthenticationController.logoutAction',
      'get /getMenu': 'app/server/controllers/MenuController.getMenuAction',
      'get /getDictionary/:dictionary/:code': 'app/server/controllers/I18nController.getAdminDictionaryAction',
      'get /permissions': 'app/server/controllers/AuthenticationController.getPermissionsAction',
      'get /ws/scopes': 'app/server/controllers/ApplicationController.getScopesAction',
      'post /search/:type': 'app/server/controllers/SearchController.searchEntitiesAction'
    },
    ws: {
      'get /taxonomies/:id/terms': 'app/server/controllers/TaxonomyController.getTaxonomyTermsAction'
    }
  },
  entities: {
    applications: 'app/server/controllers/ApplicationController',
    users: 'app/server/controllers/UserController',
    roles: 'app/server/controllers/RoleController',
    groups: 'app/server/controllers/GroupController',
    taxonomies: 'app/server/controllers/TaxonomyController'
  },
  permissions: [
    {
      id: 'core-access-applications-page',
      name: 'CORE.PERMISSIONS.ACCESS_APPLICATIONS_PAGE_NAME'
    },
    {
      id: 'core-access-users-page',
      name: 'CORE.PERMISSIONS.ACCESS_USERS_PAGE_NAME',
      paths: [
        'get /roles'
      ]
    },
    {
      id: 'core-access-roles-page',
      name: 'CORE.PERMISSIONS.ACCESS_ROLES_PAGE_NAME'
    },
    {
      id: 'core-access-groups-page',
      name: 'CORE.PERMISSIONS.ACCESS_GROUPS_PAGE_NAME'
    }
  ],
  backOffice: {
    menu: [
      {
        weight: 100,
        label: 'CORE.MENU.WEB_SERVICE',
        subMenu: [
          {
            label: 'CORE.MENU.APPLICATIONS',
            path: 'applications-list',
            permission: 'core-access-applications-page'
          }
        ]
      },
      {
        weight: 99,
        label: 'CORE.MENU.RIGHTS',
        subMenu: [
          {
            label: 'CORE.MENU.USERS',
            path: 'users-list',
            permission: 'core-access-users-page'
          },
          {
            label: 'CORE.MENU.ROLES',
            path: 'roles-list',
            permission: 'core-access-roles-page'
          },
          {
            label: 'CORE.MENU.GROUPS',
            path: 'groups-list',
            permission: 'core-access-groups-page'
          }
        ]
      }
    ],
    scriptLibFiles: {
      base: [
        '/lib/api-check/dist/api-check.min.js',
        '/lib/angular/angular.min.js',
        '/lib/angular-animate/angular-animate.min.js',
        '/lib/angular-route/angular-route.min.js',
        '/lib/angular-cookies/angular-cookies.min.js',
        '/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        '/lib/angular-touch/angular-touch.min.js',
        '/lib/angular-sanitize/angular-sanitize.min.js',
        '/lib/angular-ui-tree/dist/angular-ui-tree.min.js',
        '/lib/angular-formly/dist/formly.min.js',
        '/lib/angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.min.js',
        '/lib/checklist-model/checklist-model.js',
        '/lib/ng-jsonpath/dist/ng-jsonpath.min.js',
        '/lib/ng-tasty/ng-tasty-tpls.min.js'
      ],
      dev: [
        '/authentication/AuthenticationApp.js',
        '/storage/StorageApp.js',
        '/i18n/I18nApp.js',
        '/entity/EntityApp.js',
        '/alert/AlertApp.js',
        '/tableForm/tableForm.js'
      ],
      prod: [
        '/be/js/libOpenveo.js'
      ]
    },
    scriptFiles: {
      dev: [
        '/angular-temporary-fix-ie.js',
        '/ov/OvApp.js',
        '/ov/ErrorInterceptor.js',
        '/ov/MainController.js',
        '/ov/LoginController.js',
        '/ov/HomeController.js',
        '/ov/ApplicationController.js',
        '/ov/RoleController.js',
        '/ov/UserController.js',
        '/ov/GroupController.js',
        '/ov/ProfileController.js',
        '/ov/MenuService.js',
        '/ov/UserService.js',
        '/ov/ApplicationService.js',
        '/ov/TruncateFilter.js',
        '/ov/TagsDirective.js',
        '/ov/MultiCheckBoxDirective.js'
      ],
      prod: [
        '/be/js/openveo.js'
      ]
    },
    cssFiles: [
      '/be/css/bootstrap.css',
      '/lib/angular/angular-csp.css',
      '/lib/angular-bootstrap/ui-bootstrap-csp.css',
      '/lib/angular-ui-tree/dist/angular-ui-tree.min.css',
      '/be/css/style.css'
    ]
  },
  viewsFolders: [
    'app/client/admin/views'
  ],
  imageProcessing: {
    imagesFolders: [],
    imagesStyle: {}
  }
};
