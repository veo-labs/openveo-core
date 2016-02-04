# Introduction

End to end tests are performed using [Protractor](http://www.protractortest.org/).

Each plugin (and OpenVeo core) defines a list of test suites in **tests/client/protractorSuites.json**.

# Install Protractor

First of all you need to install Protractor, all information are available on Protractor's web site.

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

# Launch server in test mode

    node server.js -t

# Launch end to end tests

    # Launch all end to end tests on chrome
    grunt test-e2e --capabilities="{\"browserName\": \"chrome\"}" --directConnect=true

    # Launch all end to end tests on firefox
    grunt test-e2e --capabilities="{\"browserName\": \"firefox\"}" --directConnect=true

    # Launch only homePage suite on chrome
    grunt test-e2e --capabilities="{\"browserName\": \"chrome\"}" --directConnect=true --suite="homePage"