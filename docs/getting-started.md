# Installation

    npm install @openveo/core

# Configuration

To finalize the installation you need to configure OpenVeo.
Configuration files are all in **config** directory

- **config/conf.json**
- **config/databaseConf.json**
- **config/loggerConf.json**
- **config/serverConf.json**

## Configure OpenVeo

Open **config/conf.json**

```json
{
  "passwordHashKey" : "KEY" // Replace KEY by a secret key used to encrypt users passwords
}
```

## Configure database access

Open **config/databaseConf.json**

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

## Configure the logger

Open **config/loggerConf.json**

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

## Configure the server

Open **config/serverConf.json**

```json
{
  "app" : {
    "port" : PORT, // Replace PORT by the HTTP server port to use (e.g. 3000)
    "sessionSecret" : "SECRET" // Replace SECRET by a secret used to secure HTTP sessions
  }
}
```

# Create a back end user

OpenVeo CMS requires a super admin to access the back end. This user has full access to all the features of the back end and can't be removed. You can create it using the following command :

    node install.js

# Launch the application

OpenVeo is now installed. Launch it :

    node server.js

# Log to the back end

You can now access the back end at `http://localhost:PORT/be/login` (replace *PORT* by the port specified in **config/serverConf.json**) using the super admin email and password.