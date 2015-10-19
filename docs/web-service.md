# Introduction

OpenVeo offers a Web Service which must be started as a different process and needs some extra configuration.

# Configure the Web Service

Open **config/serverConf.json**

```json
{
  "ws" : {
    "port" : PORT // Replace PORT by the HTTP server port to use (e.g. 3001)
  }
}
```

# Configure the Web Service logger

Open **config/loggerConf.json**

```json
{
  "ws" : {
    "fileName" : "/var/log/openveo/openveo-ws.log", // Path to web service log file
    "level" : "info", // Log level
    "maxFileSize" : 1048576, // Maximum log file size (in Bytes)
    "maxFiles" : 2 // Maximum number of files archived
  }
}
```

# Launch the Web Service

If you want to interact with OpenVeo through the Web Service, you need to start it.
To start the OpenVeo Web Service, just use the **-ws** option :

    node server.js -ws

# Endpoints

No endpoints are exposed by the core.