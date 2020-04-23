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
  "contentLanguage" : "fr", // The language of the content that will be created in OpenVeo, see supportedContentLanguages.json file for the full list of languages
  "passwordHashKey" : "KEY", // Replace KEY by a secret key used to encrypt users passwords
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
    "maxFileSize" : 104857600, // Maximum log file size (in Bytes)
    "maxFiles" : 2, // Maximum number of files archived
    "console": true // Also print logs to standard output
  },
  "ws" : {
    "fileName" : "/var/log/openveo/openveo-ws.log", // Path to the web service log file
    "level" : "info", // Log level
    "maxFileSize" : 104857600, // Maximum log file size (in Bytes)
    "maxFiles" : 2, // Maximum number of files archived
    "console": true // Also print logs to standard output
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
    "sessionSecret" : "SECRET", // Replace SECRET by a secret used to secure HTTP sessions
    "auth": {
      "cas": { // CAS configuration
        "version": "3", // The version of the CAS server
        "service": "https://my-openveo-portal.test", // The service to use to authenticate to the CAS server
        "url": "https://my-cas-server.test:8443/cas", // The url of the CAS server
        "userGroupAttribute": "group", // The name of the CAS attribute holding the group name of a user
        "userIdAttribute": "id", // The name of the CAS attribute holding the unique id of a user
        "userNameAttribute": "name", // The name of the CAS attribute holding the name of a user
        "userEmailAttribute": "name", // The name of the CAS attribute holding the email of a user
        "certificate": "/etc/ssl/certs/cas.crt" // The absolute path of the CAS server certificate if root CA is not in the Node.JS well known CAs
      },
      "ldapauth": { // LDAP configuration
        "url": "ldaps://my-ldap.test", // The url of the LDAP server
        "bindAttribute": "dn", // The LDAP attribute used by "bindDn" (default to "dn")
        "bindDn": "cn=my-user,dc=my-ldap,dc=test", // The value of the "bindAttribute" associated to the entry used to connect to the server API
        "bindPassword": "qT5gvobG2ZxYSiY2r4mt", // The password of the entry used to connect to the server API
        "searchBase": "ou=user,dc=my-ldap,dc=test", // The search base when looking for users
        "searchScope": "sub", // The search scope when looking for users (default to "sub")
        "searchFilter": "(&(objectclass=person)(cn={{username}}))", // The search filter to find user by name, use placeholder "{{username}}" which will be replaced by the user name when searching
        "userGroupAttribute": "group", // The name of the LDAP attribute holding the group name of a user
        "userIdAttribute": "dn", // The name of the LDAP attribute holding the unique id of a user
        "userNameAttribute": "cn", // The name of the LDAP attribute holding the name of a user
        "userEmailAttribute": "email", // The name of the LDAP attribute holding the email of a user
        "certificate": "/etc/ssl/certs/ldap.crt" // The absolute path of the LDAP server certificate full chain if root CA is not in the Node.JS well known CAs
      }
    }
  },
  "ws": {
    "port": WS_HTTP_PORT // Replace WS_HTTP_PORT by the HTTP server port to use (e.g. 3002)
  }
}
```
