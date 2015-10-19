# Introduction

All server logs are performed by module [Winston](https://github.com/winstonjs/winston).

# Use an existing logger

By default OpenVeo core creates one logger named **openveo**. You can get this logger using the following code :

```javascript
var openVeoAPI = require('@openveo/api');

// Get logger "openveo"
var logger = openVeoAPI.logger.get('openveo');
```

# Create a new logger

If you want a new logger you can instanciate one with the same method **get** :

```javascript
var openVeoAPI = require('@openveo/api');

// Get logger "openveo"
var logger = openVeoAPI.logger.get('openveo', {
  "fileName" : "/var/logs/openveo/my-logger.log",
  "level" : "verbose",
  "maxFileSize" : 1048576,
  "maxFiles" : 5
});
```