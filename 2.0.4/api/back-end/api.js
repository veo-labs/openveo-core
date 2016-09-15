YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "alertService",
        "applicationService",
        "authenticationService",
        "entityService",
        "i18nService",
        "menuService",
        "ovMultiCheckBox",
        "ovTags",
        "storageProvider",
        "translateFilter",
        "truncateFilter",
        "userService",
        "utilService"
    ],
    "modules": [
        "ov",
        "ov.alert",
        "ov.authentication",
        "ov.entity",
        "ov.i18n",
        "ov.storage",
        "ov.util"
    ],
    "allModules": [
        {
            "displayName": "ov",
            "name": "ov",
            "description": "Main OpenVeo module.\n\nLoads all AngularJS dependencies and plugins modules. It also initializes formly and define routes exposed\nby OpenVeo core."
        },
        {
            "displayName": "ov.alert",
            "name": "ov.alert",
            "description": "Controls alerts for the whole application."
        },
        {
            "displayName": "ov.authentication",
            "name": "ov.authentication",
            "description": "Service to authenticate / logout or manipulate authenticated user informations."
        },
        {
            "displayName": "ov.entity",
            "name": "ov.entity",
            "description": "Manage OpenVeo entities described in conf.js."
        },
        {
            "displayName": "ov.i18n",
            "name": "ov.i18n",
            "description": "Control back end internationalization."
        },
        {
            "displayName": "ov.storage",
            "name": "ov.storage",
            "description": "Helper module to manipulate local storage."
        },
        {
            "displayName": "ov.util",
            "name": "ov.util",
            "description": "OpenVeo helper ."
        }
    ],
    "elements": []
} };
});