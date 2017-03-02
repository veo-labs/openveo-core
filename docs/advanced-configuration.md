# Introduction

Configuration files are all in user's directory under **~/.openveo/core**

- **~/.openveo/core/conf.json**
- **~/.openveo/core/databaseConf.json**
- **~/.openveo/core/loggerConf.json**
- **~/.openveo/core/serverConf.json**

**Nb :** You must restart OpenVeo servers after modifications.

# Configure OpenVeo

Open **~/.openveo/core/conf.json**

```json
{
  "passwordHashKey" : "KEY", // Replace KEY by a secret key used to encrypt users passwords
  "anonymousUserId" : "ID" // Replace ID by the anonymous user id
  "cdn" : {
    "url": "CDN_URL" // Replace CDN_URL by the url of the OpenVeo CDN (actually the OpenVeo server url)
  }
}
```

# Configure database access

Open **~/.openveo/core/databaseConf.json**

```json
{
  "type" : "mongodb", // Do not change. Only MongoDB is available right now
  "host" : "localhost", // Database server host
  "port" : 27017, // Database port
  "database" : "DATABASE_NAME", // Replace DATABASE_NAME by the name of the OpenVeo database
  "username" : "DATABASE_USER_NAME", // Replace DATABASE_USER_NAME by the name of the database user
  "password" : "DATABASE_USER_PWD" // Replace DATABASE_USER_PWD by the password of the database user
}
```

# Configure the logger

Open **~/.openveo/core/loggerConf.json**

```json
{
  "app" : {
    "fileName" : "/var/log/openveo/openveo.log", // Path to application log file
    "level" : "info", // Log level
    "maxFileSize" : 1048576, // Maximum log file size (in Bytes)
    "maxFiles" : 2 // Maximum number of files archived
  },
  "ws" : {
    "fileName" : "/var/log/openveo/openveo-ws.log", // Path to the web service log file
    "level" : "info", // Log level
    "maxFileSize" : 1048576, // Maximum log file size (in Bytes)
    "maxFiles" : 2 // Maximum number of files archived
  }
}
```

# Configure the server

Open **~/.openveo/core/serverConf.json**

```json
{
  "app" : {
    "httpPort" : HTTP_PORT, // Replace HTTP_PORT by the HTTP server port to use (e.g. 3000)
    "socketPort" : SOCKET_PORT, // Replace SOCKET_PORT by the socket server port to use (e.g. 3001)
    "browserSocketPort" : SOCKET_PORT, // Replace SOCKET_PORT by the port of the socket server to connect to from the browser (e.g. 3001)
    "sessionSecret" : "SECRET" // Replace SECRET by a secret used to secure HTTP sessions
  },
  "ws": {
    "port": WS_HTTP_PORT // Replace WS_HTTP_PORT by the HTTP server port to use (e.g. 3002)
  }
}
```