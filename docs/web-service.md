# Introduction

OpenVeo offers a Web Service which must be started as a different process and needs some extra configuration.

# Configure the Web Service

Open **~openveo/core/serverConf.json**

```json
{
  "ws" : {
    "port" : PORT // Replace PORT by the HTTP server port to use (e.g. 3001)
  }
}
```

# Configure the Web Service logger

Open **~openveo/core/loggerConf.json**

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

# Authenticate to the Web Service

The Web Service uses [OAuth2](http://oauth.net/2/) for authentication.

## Get a client id and client secret

You can create a new application with a client id and a client secret through the back end (`http://localhost:PORT/be/applications-list`).

## Get an access token

To make Web Service requests you will need an Access token. To get an Access token, you must make an HTTP POST request on **/token**.

Expected headers :

- **'Authorization: Basic CREDENTIALS'** (Replace CREDENTIALS by "CLIENT_ID:CLIENT_SECRET" encoded in base 64)

Expected POST parameters :

- **'grant_type' => 'client_credentials'**

You will receive an Access token to authenticate each Web Service requests.

### PHP example

```php
$curlCookieJar = tempnam(sys_get_temp_dir(), "cookies_");

// Initialize a curl session
$curlHandle = curl_init();

// Default curl options for all future requests
curl_setopt($curlHandle, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curlHandle, CURLOPT_COOKIESESSION, false);
curl_setopt($curlHandle, CURLOPT_COOKIEJAR, $curlCookieJar);
curl_setopt($curlHandle, CURLOPT_COOKIEFILE, $curlCookieJar);
curl_setopt($curlHandle, CURLOPT_HEADER, false);
curl_setopt($curlHandle, CURLOPT_CONNECTTIMEOUT, 1);
curl_setopt($curlHandle, CURLOPT_TIMEOUT, 30);

// Retrieve an oauth token
// Use HTTP POST method
curl_setopt($curlHandle, CURLOPT_CUSTOMREQUEST, 'POST');

// Replace {OPENVEO_URL} by the openveo server url
curl_setopt($curlHandle, CURLOPT_URL, '{OPENVEO_URL}/token');

// Replace {CLIENT_ID} and {CLIENT_SECRET} by your credentials
curl_setopt($curlHandle, CURLOPT_HTTPHEADER, array(
  'Authorization: Basic ' . base64_encode('{CLIENT_ID}:{CLIENT_SECRET}'),
  'Content-Type: application/json'
));

// Set oauth grant type to client_credentials
curl_setopt($curlHandle, CURLOPT_POSTFIELDS, json_encode(array(
    'grant_type' => 'client_credentials'
  )
));

$resultWithToken = json_decode(curl_exec($curlHandle));
```

## Authenticate a request

All requests to the Web Service must be authenticated using the HTTP header :

- **'Authorization: Bearer TOKEN'** (Replace TOKEN by your access token)

### PHP example

```php
// Get the list of videos
curl_setopt($curlHandle, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($curlHandle, CURLOPT_URL, '{OPENVEO_URL}/taxonomies');
curl_setopt($curlHandle, CURLOPT_HTTPHEADER, array(
  'Authorization: Bearer ' . $resultWithToken->access_token
));

// Got the list of videos
$videos = json_decode(curl_exec($curlHandle));
```

# Endpoints

## Taxonomies

Get taxonomies.

    GET WEB_SERVICE_URL/taxonomies

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on taxonomies' name
sortOrder | String | No | desc | Sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | - | To limit the number of taxonomies per page. If not specified get all taxonomies

HTTP Status Code | Details
---- | ----
200 | Got the list of taxonomies (even if the list is empty)
500 | An error occured on the server side
400 | Wrong list of parameters
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "1443533344313",
      "name": "Taxonomy 1",
      "tree": [
        {
          "id" : "1445433239636",
          "items": [],
          "title": "Term 1"
        }
      ]
    },
    {
      "id": "1333443134453",
      "name": "Taxonomy 2",
      "tree": [
        {
          "id" : "3239636144543",
          "items": [],
          "title": "Term 1"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 1,
    "page": 1,
    "pages": 2,
    "size": 2
  }
}
```

---

Get taxonomy.

    GET WEB_SERVICE_URL/taxonomies/{taxonomy_id}

HTTP Status Code | Details
---- | ----
200 | Got the taxonomy
500 | An error occured on the server side
400 | Missing the taxonomy id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "name": "My taxonomy",
    "id": "{taxonomy_id}",
    "tree": []
  }
}
```

---

Get the list of terms of a taxonomy.

    GET WEB_SERVICE_URL/taxonomies/{taxonomy_id}/terms

HTTP Status Code | Details
---- | ----
200 | Got the taxonomy's terms
500 | An error occured on the server side
400 | Missing the taxonomy id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "terms": [
    {
      "id" : "1445433239636",
      "title": "Term 1",
      "items": [
        {
          "id" : "1445433239637",
          "items": [],
          "title": "Sub term 1"
        }
      ]
    },
    {
      "title": "Term 2",
      "id" : "1333443134453",
      "items": []
    }
  ]
}
```

---

Add a taxonomy.

    PUT WEB_SERVICE_URL/taxonomies

HTTP Status Code | Details
---- | ----
200 | The taxonomy has been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "name": "My taxonomy",
    "id": "41U3sYipg",
    "tree": []
  }
}
```
---

Update a taxonomy.

    POST WEB_SERVICE_URL/taxonomies/{taxonomy_id}

HTTP Status Code | Details
---- | ----
200 | The taxonomy has been updated
500 | An error occured on the server side
400 | Missing the taxonomy id or body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

---

Delete a taxonomy.

    DELETE WEB_SERVICE_URL/taxonomies/{taxonomy_id}

HTTP Status Code | Details
---- | ----
200 | The taxonomy has been deleted
500 | An error occured on the server side
400 | Missing the taxonomy id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

## Groups

Get groups.

    GET WEB_SERVICE_URL/groups

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on both groups' name and description
sortBy | String | No | name | To sort groups by either **name** or **description**
sortOrder | String | No | desc | Sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | - | To limit the number of groups per page. If not specified get all groups

HTTP Status Code | Details
---- | ----
200 | Got the list of groups (even if the list is empty)
500 | An error occured on the server side
400 | Wrong list of parameters
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "Nk0fPIulZ",
      "name": "Group name",
      "description": "Group description"
    },
    {
      "id": "VJfQDIul-",
      "name": "Group name",
      "description": "Group description"
    }
  ],
  "pagination": {
    "limit": 1,
    "page": 1,
    "pages": 2,
    "size": 2
  }
}
```

---

Get information about a group.

    GET WEB_SERVICE_URL/groups/{group_id}

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
group_id | String | Yes | - | The id of the group to fetch

HTTP Status Code | Details
---- | ----
200 | Got the group
500 | An error occured on the server side
400 | Missing the id of the group
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "{group_id}",
    "name": "Group name",
    "description": "Group description"
  }
}
```

---

Add a group.

    PUT WEB_SERVICE_URL/groups

HTTP Status Code | Details
---- | ----
200 | The group has been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "41U3sYipg",
    "name": "Group name",
    "description": "Group description"
  }
}
```

---

Update a group.

    POST WEB_SERVICE_URL/groups/{group_id}

HTTP Status Code | Details
---- | ----
200 | The group has been updated
500 | An error occured on the server side
400 | Missing the group id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

---

Delete a group.

    DELETE WEB_SERVICE_URL/groups/{group_id}

HTTP Status Code | Details
---- | ----
200 | The group has been deleted
500 | An error occured on the server side
400 | Missing the group id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

## Roles

Get roles.

    GET WEB_SERVICE_URL/roles

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on roles' name
sortOrder | String | No | desc | Sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | - | To limit the number of roles per page. If not specified get all roles

HTTP Status Code | Details
---- | ----
200 | Got the list of roles (even if the list is empty)
500 | An error occured on the server side
400 | Wrong list of parameters
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "4J5KIL_lb",
      "name": "Role name",
      "permissions" : [...]
    }
  ],
  "pagination": {
    "limit": 1,
    "page": 1,
    "pages": 2,
    "size": 2
  }
}
```

---

Get information about a role.

    GET WEB_SERVICE_URL/roles/{role_id}

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
role_id | String | Yes | - | The id of the role to fetch

HTTP Status Code | Details
---- | ----
200 | Got the role
500 | An error occured on the server side
400 | Missing the id of the role
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "{role_id}",
    "name": "Role name",
    "permissions" : [...]
  }
}
```

---

Add a role.

    PUT WEB_SERVICE_URL/roles

HTTP Status Code | Details
---- | ----
200 | The role has been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "41U3sYipg",
    "name": "Role name",
    "permissions" : [...]
  }
}
```

---

Update a role.

    POST WEB_SERVICE_URL/roles/{role_id}

HTTP Status Code | Details
---- | ----
200 | The role has been updated
500 | An error occured on the server side
400 | Missing the role id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

---

Delete a role.

    DELETE WEB_SERVICE_URL/roles/{role_id}

HTTP Status Code | Details
---- | ----
200 | The role has been deleted
500 | An error occured on the server side
400 | Missing the role id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

## Users

Get users.

    GET WEB_SERVICE_URL/users

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on users' name
sortOrder | String | No | desc | Sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | - | To limit the number of users per page. If not specified get all users

HTTP Status Code | Details
---- | ----
200 | Got the list of users (even if the list is empty)
500 | An error occured on the server side
400 | Wrong list of parameters
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "42",
      "name": "User name",
      "password": "38d03dd58cd1bb6b4fdc59c3d03601461118c166b48baf787b96d5589ff0758d",
      "email" : "user.mail@company.com"
    }
  ],
  "pagination": {
    "limit": 1,
    "page": 1,
    "pages": 2,
    "size": 2
  }
}
```

---

Get information about a user.

    GET WEB_SERVICE_URL/users/{user_id}

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
user_id | String | Yes | - | The id of the user to fetch

HTTP Status Code | Details
---- | ----
200 | Got the user
500 | An error occured on the server side
400 | Missing the id of the user
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "{user_id}",
    "name": "User name",
    "password": "38d03dd58cd1bb6b4fdc59c3d03601461118c166b48baf787b96d5589ff0758d",
    "email" : "user.mail@company.com"
  }
}
```

---

Add a user.

    PUT WEB_SERVICE_URL/users

HTTP Status Code | Details
---- | ----
200 | The user has been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "41U3sYipg",
    "name": "User name",
    "password": "38d03dd58cd1bb6b4fdc59c3d03601461118c166b48baf787b96d5589ff0758d",
    "email" : "user.mail@company.com"
  }
}
```

---

Update a user.

    POST WEB_SERVICE_URL/users/{user_id}

HTTP Status Code | Details
---- | ----
200 | The user has been updated
500 | An error occured on the server side
400 | Missing the user id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

---

Delete a user.

    DELETE WEB_SERVICE_URL/users/{user_id}

HTTP Status Code | Details
---- | ----
200 | The user has been deleted
500 | An error occured on the server side
400 | Missing the user id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

## Applications

Get applications.

    GET WEB_SERVICE_URL/applications

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on applications' name
sortOrder | String | No | desc | Sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | - | To limit the number of applications per page. If not specified get all applications

HTTP Status Code | Details
---- | ----
200 | Got the list of applications (even if the list is empty)
500 | An error occured on the server side
400 | Wrong list of parameters
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "4J6CUL_gZ",
      "name": "Application name",
      "scopes": [...],
      "secret" : "179a905785d4258bba255ffb812a25f2225f7d4c"
    }
  ],
  "pagination": {
    "limit": 1,
    "page": 1,
    "pages": 2,
    "size": 2
  }
}
```

---

Get information about an application.

    GET WEB_SERVICE_URL/applications/{application_id}

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
application_id | String | Yes | - | The id of the application to fetch

HTTP Status Code | Details
---- | ----
200 | Got the application
500 | An error occured on the server side
400 | Missing the id of the application
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "{application_id}",
    "name": "Application name",
    "scopes": [...],
    "secret" : "179a905785d4258bba255ffb812a25f2225f7d4c"
  }
}
```

---

Add an application.

    PUT WEB_SERVICE_URL/applications

HTTP Status Code | Details
---- | ----
200 | The application has been added
500 | An error occured on the server side
400 | Missing the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "41U3sYipg",
    "name": "Application name",
    "scopes": [...],
    "secret" : "179a905785d4258bba255ffb812a25f2225f7d4c"
  }
}
```

---

Update an application.

    POST WEB_SERVICE_URL/applications/{application_id}

HTTP Status Code | Details
---- | ----
200 | The application has been updated
500 | An error occured on the server side
400 | Missing the application id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

---

Delete an application.

    DELETE WEB_SERVICE_URL/applications/{application_id}

HTTP Status Code | Details
---- | ----
200 | The application has been deleted
500 | An error occured on the server side
400 | Missing the application id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "error": null,
  "status": "ok"
}
```

# Client libraries

## PHP client

A [PHP client](https://github.com/veo-labs/openveo-rest-php-client) is also available on Github to help interface with OpenVeo Web Service.

## NodeJS client

A [NodeJS client](https://github.com/veo-labs/openveo-rest-nodejs-client) is also available on Github to help interface with OpenVeo Web Service.