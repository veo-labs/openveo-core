'use strict';

module.exports = {
  http: {
    routes: {
      public: {
        'get /getDictionary/:dictionary/:code': 'app/server/controllers/I18nController.getDictionaryAction'
      },
      private: {
        'get /login': 'app/server/controllers/DefaultController.defaultAction',
        'post /authenticate': 'app/server/controllers/AuthenticationController.authenticateInternalAction',
        'get /authenticate/:type': 'app/server/controllers/AuthenticationController.authenticateExternalAction',
        '*': 'app/server/controllers/AuthenticationController.restrictAction',
        'get /logout': 'app/server/controllers/AuthenticationController.logoutAction',
        'post /logout': 'app/server/controllers/AuthenticationController.logoutAction',
        'get /getMenu': 'app/server/controllers/MenuController.getMenuAction',
        'get /getDictionary/:dictionary/:code': 'app/server/controllers/I18nController.getAdminDictionaryAction',
        'get /permissions': 'app/server/controllers/AuthenticationController.getPermissionsAction',
        'get /ws/scopes': 'app/server/controllers/ApplicationController.getScopesAction'
      },
      ws: {
        'get /taxonomies/:id/terms': 'app/server/controllers/TaxonomyController.getTaxonomyTermsAction'
      }
    }
  },
  entities: {
    applications: 'app/server/controllers/ApplicationController',
    users: 'app/server/controllers/UserController',
    roles: 'app/server/controllers/RoleController',
    groups: 'app/server/controllers/GroupController',
    taxonomies: 'app/server/controllers/TaxonomyController',
    settings: 'app/server/controllers/SettingsController'
  },
  permissions: [
    {
      label: 'CORE.PERMISSIONS.GROUP_APPLICATIONS',
      permissions: [
        {
          id: 'core-access-applications-page',
          name: 'CORE.PERMISSIONS.ACCESS_APPLICATIONS_PAGE_NAME'
        }
      ]
    },
    {
      label: 'CORE.PERMISSIONS.GROUP_USERS',
      permissions: [
        {
          id: 'core-access-users-page',
          name: 'CORE.PERMISSIONS.ACCESS_USERS_PAGE_NAME',
          paths: [
            'get /roles'
          ]
        }
      ]
    },
    {
      label: 'CORE.PERMISSIONS.GROUP_ROLES',
      permissions: [
        {
          id: 'core-access-roles-page',
          name: 'CORE.PERMISSIONS.ACCESS_ROLES_PAGE_NAME'
        }
      ]
    },
    {
      label: 'CORE.PERMISSIONS.GROUP_GROUPS',
      permissions: [
        {
          id: 'core-access-groups-page',
          name: 'CORE.PERMISSIONS.ACCESS_GROUPS_PAGE_NAME'
        }
      ]
    },
    {
      label: 'CORE.PERMISSIONS.GROUP_SETTINGS',
      permissions: [
        {
          id: 'core-access-settings-page',
          name: 'CORE.PERMISSIONS.ACCESS_SETTINGS_PAGE_NAME',
          paths: [
            'get /roles'
          ]
        }
      ]
    }
  ],
  backOffice: {
    menu: [
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
      },
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
        weight: 101,
        label: 'CORE.MENU.SETTINGS',
        path: 'openveo-settings',
        permission: 'core-access-settings-page'
      }
    ],
    scriptLibFiles: {
      dev: [
        '/authentication/AuthenticationApp.js',
        '/storage/StorageApp.js',
        '/i18n/I18nApp.js',
        '/entity/EntityApp.js',
        '/alert/AlertApp.js',
        '/socket/SocketApp.js',
        '/tableForm/tableForm.js',
        '/util/UtilApp.js',
        '/util/utilService.js',
        '/util/UrlFactory.js'
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
        '/ov/MultiCheckBoxDirective.js',
        '/ov/MatchDirective.js',
        '/ov/SettingsController.js',
        '/ov/DateTimePickerDirective.js',
        '/ov/DateTimePickerController.js',
        '/ov/AutoCompleteDirective.js'
      ],
      prod: [
        '/be/js/openveo.js'
      ]
    },
    cssFiles: [
      '/be/css/bootstrap.css',
      '/be/css/style.css'
    ]
  },
  viewsFolders: [
    'app/client/admin/views'
  ],
  libraries: [
    {
      name: 'angular',
      mountPath: 'angular',
      files: ['angular.min.js', 'angular-csp.css']
    },
    {
      name: 'angular-animate',
      mountPath: 'angular-animate',
      files: ['angular-animate.min.js']
    },
    {
      name: 'angular-cookies',
      mountPath: 'angular-cookies',
      files: ['angular-cookies.min.js']
    },
    {
      name: 'angular-i18n',
      mountPath: 'angular-i18n',
      files: []
    },
    {
      name: 'angular-route',
      mountPath: 'angular-route',
      files: ['angular-route.min.js']
    },
    {
      name: 'angular-sanitize',
      mountPath: 'angular-sanitize',
      files: ['angular-sanitize.min.js']
    },
    {
      name: 'angular-ui-bootstrap',
      mountPath: 'angular-bootstrap',
      files: ['dist/ui-bootstrap-tpls.js', 'dist/ui-bootstrap-csp.css']
    },
    {
      name: 'angular-ui-tinymce',
      mountPath: 'angular-ui-tinymce',
      files: ['dist/tinymce.min.js']
    },
    {
      name: 'angular-ui-tree',
      mountPath: 'angular-ui-tree',
      files: ['dist/angular-ui-tree.min.js', 'dist/angular-ui-tree.min.css']
    },
    {
      name: 'api-check',
      mountPath: 'api-check',
      files: ['dist/api-check.min.js']
    },
    {
      name: 'angular-formly',
      mountPath: 'angular-formly',
      files: ['dist/formly.min.js']
    },
    {
      name: 'angular-formly-templates-bootstrap',
      mountPath: 'angular-formly-templates-bootstrap',
      files: ['dist/angular-formly-templates-bootstrap.min.js']
    },
    {
      name: 'bootstrap-sass',
      mountPath: 'bootstrap-sass',
      files: []
    },
    {
      name: 'fastclick',
      mountPath: 'fastclick',
      files: ['lib/fastclick.js']
    },
    {
      name: 'ng-file-upload',
      mountPath: 'ng-file-upload',
      files: ['dist/ng-file-upload.min.js']
    },
    {
      name: 'ng-tasty',
      mountPath: 'ng-tasty',
      files: ['ng-tasty-tpls.min.js']
    },
    {
      name: 'socket.io-client',
      mountPath: 'socket.io-client',
      files: ['dist/socket.io.min.js']
    },
    {
      name: 'tinymce',
      mountPath: 'tinymce',
      files: ['tinymce.min.js']
    }
  ]
};
