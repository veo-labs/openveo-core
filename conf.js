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
    }
  },
  entities: {
    applications: 'app/server/controllers/ApplicationController',
    users: 'app/server/controllers/UserController',
    roles: 'app/server/controllers/RoleController',
    groups: 'app/server/controllers/GroupController',
    taxonomies: 'app/server/controllers/TaxonomyController'
  },
  webServiceScopes: [
    {
      id: 'taxonomy',
      name: 'WS_SCOPES.GET_TAXONOMY_NAME',
      description: 'WS_SCOPES.GET_TAXONOMY_DESCRIPTON',
      paths: [
        'get /taxonomies*'
      ]
    },
    {
      id: 'group',
      name: 'WS_SCOPES.GET_GROUP_NAME',
      description: 'WS_SCOPES.GET_GROUP_DESCRIPTON',
      paths: [
        'get /groups*'
      ]
    }
  ],
  permissions: [
    {
      id: 'access-applications-page',
      name: 'PERMISSIONS.ACCESS_APPLICATIONS_PAGE_NAME'
    },
    {
      id: 'access-users-page',
      name: 'PERMISSIONS.ACCESS_USERS_PAGE_NAME',
      paths: [
        'get /roles'
      ]
    },
    {
      id: 'access-roles-page',
      name: 'PERMISSIONS.ACCESS_ROLES_PAGE_NAME'
    },
    {
      id: 'access-groups-page',
      name: 'PERMISSIONS.ACCESS_GROUPS_PAGE_NAME'
    }
  ],
  backOffice: {
    menu: [
      {
        weight: 100,
        label: 'MENU.WEB_SERVICE',
        subMenu: [
          {
            label: 'MENU.APPLICATIONS',
            path: 'applications-list',
            permission: 'access-applications-page'
          }
        ]
      },
      {
        weight: 99,
        label: 'MENU.RIGHTS',
        subMenu: [
          {
            label: 'MENU.USERS',
            path: 'users-list',
            permission: 'access-users-page'
          },
          {
            label: 'MENU.ROLES',
            path: 'roles-list',
            permission: 'access-roles-page'
          },
          {
            label: 'MENU.GROUPS',
            path: 'groups-list',
            permission: 'access-groups-page'
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
