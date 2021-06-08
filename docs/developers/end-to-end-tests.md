# Introduction

End to end tests are performed using [Protractor](http://www.protractortest.org/).

Each plugin (including OpenVeo core) defines a list of test suites in **tests/client/protractorSuites.json**.

# Install selenium web driver and chrome driver

    npm run upgrade-web-driver

If the version of Google Chrome is too recent for the Chrome Driver installed with Protractor you can enter a specific version of the Chrome Driver using:

    npm run upgrade-web-driver -- --versions.chrome=80.0.3987.149

# Configure tests

You need to specify a new database which will be used during tests. To do so, you can add a new configuration file in user's directory under **~/.openveo/core** called **databaseTestConf.json**.

**~/.openveo/core/databaseTestConf.json**

```json
{
  "type": "mongodb",
  "host": "localhost",
  "port": 27017,
  "database": "openveo-test",
  "username": "openveo",
  "password": "openveo"
}
```

**WARNING** : Each time you launch end to end tests, all information will be removed from this database ! DO NOT use the same database as the one described in **databaseConf.json**

When launching tests, OpenVeo HTTP server, socket server, CAS mock server and LDAP mock server are automatically spawned and must be configured through **serverTestConf.json**. Typically you may want to change servers ports.

**~/.openveo/core/serverTestConf.json**

```json
{
  "app": {
    "httpPort": 3003,
    "socketPort": 3004,
    "browserSocketPort": 3004,
    "sessionSecret": "2bXELdIqoT9Tbv5i1RfcXGEIE+GQS+XYbwVn0qEx",
    "auth": {
      "cas": {
        "version": "3",
        "service": "http://127.0.0.1:3003/be/authenticate/cas",
        "url": "http://127.0.0.1:3005",
        "userIdAttribute": "name",
        "userNameAttribute": "attributes.name",
        "userEmailAttribute": "attributes.mail",
        "userGroupAttribute": "attributes.groups"
      },
      "ldapauth": {
        "searchFilter": "(&(objectclass=person)(cn={{username}}))",
        "url": "ldap://127.0.0.1:3006",
        "bindAttribute": "dn",
        "bindDn": "cn=openveo,dc=test",
        "bindPassword": "test",
        "searchBase": "dc=test",
        "searchScope": "sub",
        "userGroupAttribute": "groups",
        "userIdAttribute": "dn",
        "userNameAttribute": "cn",
        "userEmailAttribute": "mail"
      }
    }
  },
  "ws": {
    "port": 3007
  }
}
```

You also need to specify the CDN URL to precise the new server port. To do so, you can add a new configuration file in user's directory under **~/.openveo/core** called **testConf.json**.

**~/.openveo/core/testConf.json**

```json
{
  "passwordHashKey": "Eu2MNdGjJD",
  "cdn": {
    "url": "http://127.0.0.0:3003"
  }
}

Finally the logger has to be configured through **loggerTestConf.json**. Typically you may want to deactivate logger standard output.

**~/.openveo/core/loggerTestConf.json**

```json
{
  "app": {
    "level": "info",
    "maxFileSize": 1048576,
    "maxFiles": 2,
    "fileName": "/tmp/openveo/logs/openveoTest.log",
    "console": false
  },
  "ws": {
    "level": "info",
    "maxFileSize": 1048576,
    "maxFiles": 2,
    "fileName": "/tmp/openveo/logs/openveoTest-ws.log",
    "console": false
  }
}
```

**console: false** will deactivate standard output.

# Writing tests

## Boot steps

When launching end to end tests, several things happen before the first test is launched:

1. Database defined in **~/.openveo/core/databaseTestConf.json** is dropped
2. Users, roles, groups and applications described in **tests/client/e2eTests/database/data.json**, from core and plugins, are inserted into database
3. CAS users and LDAP users described in **tests/client/e2eTests/database/data.json**, from core and plugins, are inserted respectively into **tests/client/e2eTests/build/casUsers.json** and **tests/client/e2eTests/build/ldapUsers.json**
4. Tests suites files, in **tests/client/e2eTests/protractorSuites.json** from core and plugins, are merged into one single file (**tests/client/e2eTests/suites/suites.json**)
5. A CAS server mock is launched
6. An LDAP server mock is launched
7. An OpenVeo HTTP server is launched
8. An OpenVeo socket server is launched
9. An OpenVeo Web Service server is launched
10. A database connection is made to be able to use models in tests
11. All plugins are loaded

## Add users, roles, groups and application before tests

Users, roles, groups and applications can be added before tests are launched using **tests/client/e2eTests/resources/data.json** configuration file.

Structure is as follow:

```json
{
  "groups": {
    ...
  },
  "roles": {
    ...
  },
  "users": {
    ...
  },
  "casUsers": [
    ...
  ],
  "ldapUsers": [
    ...
  ],
  "applications": {
    ...
  }
}
```

### Create a group

```json
{
  "groups": {
    "coreGroupId": { // Id of the group to use when creating roles
      "name": "Core group name", // The name of the group
      "description": "Core group description" // The description of the group
    }
  }
}
```

### Create a role

```json
{
  "roles": {
    "coreAdmin": { // Id of the role to use when creating users
      "name": "core-admin", // The name of the role
      "permissions": [ // The list of permissions ids as described in conf.js file
        "add-application",
        "update-application",
        "delete-application",
        "add-taxonomy",
        "update-taxonomy",
        "delete-taxonomy",
        "add-user",
        "update-user",
        "delete-user",
        "add-role",
        "update-role",
        "delete-role",
        "access-applications-page",
        "access-users-page",
        "access-roles-page",
        "get-group-coreGroupId", // Permission "get" on the group "coreGroupId"
        "update-group-coreGroupId", // Permission "update" on the group "coreGroupId"
        "delete-group-coreGroupId" // Permission "delete" on the group "coreGroupId"
      ]
    }
  }
}
```

### Create a user

```json
{
  "users": {
    "coreAdmin": { // Id of the user (not used)
      "name": "core-admin", // The name of the user
      "email": "core-admin@veo-labs.com", User's email
      "password": "core-admin", // User's password
      "roles": [ "coreAdmin" ] // User's list of roles (role ids are the one described in the same file)
    }
  }
}
```

### Create a CAS user

```json
{
  "casUsers": [
    {
      "name": "my-user", // The id of the CAS user
      "attributes": { // CAS user attributes
        "name": "my-user", // The attribute holding the name of the CAS user
        "mail": "my-usert@openveo.com", // The attribute holding the email of the CAS user
        "groups": ["my-user1", "my-user2"]  // The attribute holding the groups of the CAS user
      }
    }
  ]
}
```

### Create an LDAP user

```json
{
  "ldapUsers": [
    {
      "dn": "cn=my-user,dc=test", // User's id on LDAP
      "cn": "my-user", // User's name
      "groups": "my-user-group1,my-user-group2", // A comma separated list of groups
      "mail": "my-user@openveo.com" // User's email
    }
  ]
}
```

### Create an application

```json
{
  "applications": {
    "coreApplicationsGuest": { // Id of the application (not used)
      "name": "core-applications-guest", // Name of the application
      "scopes": [ "publish-videos" ] // List of scope ids for the application
    }
  }
}
```

### Create test

Create your test file in **tests/client/e2eTests/** then update the list of suites, if necessary, in  **tests/client/e2eTests/suites/suites.json**.

# Debug

If a test fails, a screenshot of the browser at the instant is taken and available in **build/screenshots** of the core.

# Launch end to end tests

    # Launch all end to end tests on chrome
    npm run e2e -- --capabilities="{\"browserName\": \"chrome\"}" --directConnect=true

    # Launch all end to end tests on firefox
    npm run e2e -- --capabilities="{\"browserName\": \"firefox\"}" --directConnect=true

    # Launch only coreHome suite on chrome
    npm run e2e -- --capabilities="{\"browserName\": \"chrome\"}" --directConnect=true --suite="coreHome"
