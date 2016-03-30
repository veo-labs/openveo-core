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
  "superAdminId" : "ID", // Replace ID by the super administrator id
  "anonymousUserId" : "ID" // Replace ID by the anonymous user id
}
```

# Configure database access

Open **~/.openveo/core/databaseConf.json**

```json
{
  "type" : "mongodb", // Do not change
  "host" : "localhost", // MongoDB server host
  "port" : 27017, // MongoDB port
  "database" : "DATABASE_NAME", // Replace DATABASE_NAME by the name of the OpenVeo database
  "username" : "DATABASE_USER_NAME", // Replace DATABASE_USER_NAME by the name of the database user
  "password" : "DATABASE_USER_PWD" // Replace DATABASE_USER_PWD  by the password of the database user
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
  }
}
```

# Configure the server

Open **~/.openveo/core/serverConf.json**

```json
{
  "app" : {
    "port" : PORT, // Replace PORT by the HTTP server port to use (e.g. 3000)
    "sessionSecret" : "SECRET" // Replace SECRET by a secret used to secure HTTP sessions
  }
}
```