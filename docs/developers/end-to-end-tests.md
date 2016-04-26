# Introduction

End to end tests are performed using [Protractor](http://www.protractortest.org/).

Each plugin (and OpenVeo core) defines a list of test suites in **tests/client/protractorSuites.json**.

# Install Protractor globally

First of all you need to install Protractor, all information are available on Protractor's web site.

# Remove grunt-protractor-runner local protractor

    rm -rf node_modules/grunt-protractor-runner/node_modules/protractor

# Configure tests

To be able to launch end to end tests, OpenVeo needs to find the selenium jar and the chrome driver file installed with Protractor.
You can specify the path of the selenium jar using **SELENIUM_JAR** environment variable and chrome driver using **CHROME_DRIVER** environment variable.

You also need to specify a new database which will be used during tests. To do so, you can add a new configuration file in user's directory under **~/.openveo/core** called **databaseTestConf.json**.

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

When launching tests, an OpenVeo server is automatically spawned and must be configured through **serverTestConf.json**. Typically you may want to change the server port.

**~/.openveo/core/serverTestConf.json**

```json
{
  "app": {
    "port": 3004,
    "sessionSecret": "2bXELdIqoT9Tbv5i1RfcXGEIE+GQS+XYbwVn0qEx"
  },
  "ws": {
    "port": 3005
  }
}
```

Finally the logger has to be configured through **loggerTestConf.json**. Typically you may want to deactivate logger standard output.

**~/.openveo/core/loggerTestConf.json**

```json
{
  "app": {
    "level": "info",
    "maxFileSize": 1048576,
    "maxFiles": 2,
    "fileName": "C:/Users/Vodalys/AppData/Local/Temp/openveo/logs/openveo.log",
    "console": false
  },
  "ws": {
    "level": "info",
    "maxFileSize": 1048576,
    "maxFiles": 2,
    "fileName": "C:/Users/Vodalys/AppData/Local/Temp/openveo/logs/openveo-ws.log",
    "console": false
  }
}
```

**console: false** will deactivate standard output.

# Writing tests

## Boot steps

When launching end to end tests, several things happen before the first test is launched :

1. Database defined in **~/.openveo/core/databaseTestConf.json** is dropped
2. Users, roles and applications described in **tests/client/e2eTests/database/data.json**, from core and plugins, are inserted into database
3. Tests suites files, in **tests/client/e2eTests/protractorSuites.json** from core and plugins, are merged into one single file (**tests/client/e2eTests/suites/suites.json**)
4. An OpenVeo server is launched
5. A database connection is made to be able to use models in tests
6. All plugins are loaded and available in ApplicationStorage

## Add users, roles and application before tests

Users, roles and applications can be added before tests are launched using **tests/client/e2eTests/database/data.json** configuration file.

Structure is as follow :

```json
{
  "roles": {
    ...
  },
  "users": {
    ...
  },
  "applications": {
    ...
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
        "create-application",
        "update-application",
        "delete-application",
        "create-taxonomy",
        "update-taxonomy",
        "delete-taxonomy",
        "create-user",
        "update-user",
        "delete-user",
        "create-role",
        "update-role",
        "delete-role",
        "access-applications-page",
        "access-users-page",
        "access-roles-page"
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

### Create an application

```json
{
  "applications": {
    "coreApplicationsGuest": { // Id of the application (not used)
      "name": "core-applications-guest", // Name of the application
      "scopes": [ "video" ] // List of scope ids for the application
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
    grunt test-e2e --capabilities="{\"browserName\": \"chrome\"}" --directConnect=true

    # Launch all end to end tests on firefox
    grunt test-e2e --capabilities="{\"browserName\": \"firefox\"}" --directConnect=true

    # Launch only homePage suite on chrome
    grunt test-e2e --capabilities="{\"browserName\": \"chrome\"}" --directConnect=true --suite="homePage"