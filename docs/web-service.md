# Introduction

OpenVeo offers a Web Service which must be started as a different process and needs some extra configuration.

# Configure the Web Service

Open **~openveo/core/serverConf.json**

```json
{
  "ws" : {
    "port" : PORT // Replace PORT by the HTTP server port to use (e.g. 3002)
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
    "maxFileSize" : 104857600, // Maximum log file size (in Bytes)
    "maxFiles" : 2 // Maximum number of files archived
  }
}
```

# Launch the Web Service

If you want to interact with OpenVeo through the Web Service, you need to start it.
To start the OpenVeo Web Service, just use the **-ws** option:

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

All requests to the Web Service must be authenticated using the HTTP header:

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
query | String | No | - | To search on taxonomy names
useSmartSearch | Number | No | 1 | **1** to use a more advanced search mechanism, **0** to use a simple search based on a regular expression
sortBy | String | No | name | The field to use to sort taxonomies. Only **name** is available right now
sortOrder | String | No | desc | The sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | 10 | The limit the number of taxonomies per page
include | Array | No | - | The list of fields to include from returned taxonomies
exclude | Array | No | - | The list of fields to exclude from returned taxonomies. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the list of taxonomies
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
          "id": "1445433239636",
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
          "id": "3239636144543",
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

Get a taxonomy.

    GET WEB_SERVICE_URL/taxonomies/{taxonomy_id}

With **{taxonomy_id}** the id of the taxonomy to retrieve.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
include | Array | No | - | The list of fields to include from returned taxonomy
exclude | Array | No | - | The list of fields to exclude from returned taxonomy. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the taxonomy
500 | An error occured on the server side
400 | Missing the taxonomy id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point
404 | Taxonomy not found

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
200 | Got the taxonomy terms
500 | An error occured on the server side
400 | Missing the taxonomy id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "terms": [
    {
      "id": "1445433239636",
      "title": "Term 1",
      "items": [
        {
          "id": "1445433239637",
          "items": [],
          "title": "Sub term 1"
        }
      ]
    },
    {
      "title": "Term 2",
      "id": "1333443134453",
      "items": []
    }
  ]
}
```

---

Add taxonomies.

    PUT WEB_SERVICE_URL/taxonomies

Expects an Array of objects containing:

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | Yes | - | The taxonomy name
tree | Array | No | - | The list of terms for the taxonomy

HTTP Status Code | Details
---- | ----
200 | The taxonomies have been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "name": "My taxonomy",
      "id": "41U3sYipg",
      "tree": []
    },
    ...
  ],
  "total": 42
}
```
---

Update a taxonomy.

    POST WEB_SERVICE_URL/taxonomies/{taxonomy_id}

With **{taxonomy_id}** the id of the taxonomy to update.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | No | - | The taxonomy name
tree | Array | No | - | The list of terms for this taxonomy

HTTP Status Code | Details
---- | ----
200 | The taxonomy has been updated
500 | An error occured on the server side
400 | Missing the taxonomy id or body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 1
}
```

---

Delete taxonomies.

    DELETE WEB_SERVICE_URL/taxonomies/{taxonomy_id}

With **{taxonomy_id}** a comma separated list of taxonomy ids to delete.

HTTP Status Code | Details
---- | ----
200 | The taxonomies have been deleted
500 | An error occured on the server side
400 | Missing the taxonomy ids
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 42
}
```

## Groups

Get groups.

    GET WEB_SERVICE_URL/groups

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on both group names and descriptions
useSmartSearch | Number | No | 1 | **1** to use a more advanced search mechanism, **0** to use a simple search based on a regular expression
sortBy | String | No | name | The field to use to sort groups (either **name** or **description**)
sortOrder | String | No | desc | The sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | 10 | The limit the number of groups per page
include | Array | No | - | The list of fields to include from returned groups
exclude | Array | No | - | The list of fields to exclude from returned groups. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the list of groups
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

Get a group.

    GET WEB_SERVICE_URL/groups/{group_id}

With **{group_id}** the id of the group to retrieve.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
include | Array | No | - | The list of fields to include from returned group
exclude | Array | No | - | The list of fields to exclude from returned group. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the group
500 | An error occured on the server side
400 | Missing the id of the group
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point
404 | Group not found

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

Add groups.

    PUT WEB_SERVICE_URL/groups

Expects an Array of objects containing:

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | Yes | - | The group name
description | String | Yes | - | The group description

HTTP Status Code | Details
---- | ----
200 | The groups have been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "41U3sYipg",
      "name": "Group name",
      "description": "Group description"
    },
    ...
  ],
  "total": 42
}
```

---

Update a group.

    POST WEB_SERVICE_URL/groups/{group_id}

With **{group_id}** the id of the group to update.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | No | - | The group name
description | String | No | - | The group description

HTTP Status Code | Details
---- | ----
200 | The group has been updated
500 | An error occured on the server side
400 | Missing the group id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 1
}
```

---

Delete groups.

    DELETE WEB_SERVICE_URL/groups/{group_id}

With **{group_id}** a comma separated list of group ids to delete.

HTTP Status Code | Details
---- | ----
200 | The groups have been deleted
500 | An error occured on the server side
400 | Missing the group ids
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 42
}
```

## Roles

Get roles.

    GET WEB_SERVICE_URL/roles

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on role names
useSmartSearch | Number | No | 1 | **1** to use a more advanced search mechanism, **0** to use a simple search based on a regular expression
sortBy | String | No | name | The field to use to sort results, only **name** is available right now
sortOrder | String | No | desc | The sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | 10 | The limit the number of roles per page
include | Array | No | - | The list of fields to include from returned roles
exclude | Array | No | - | The list of fields to exclude from returned roles. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the list of roles
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

Get a role.

    GET WEB_SERVICE_URL/roles/{role_id}

With **{role_id}** the id of the role to retrieve.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
include | Array | No | - | The list of fields to include from returned role
exclude | Array | No | - | The list of fields to exclude from returned role. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the role
500 | An error occured on the server side
400 | Missing the id of the role
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point
404 | Role not found

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

Add roles.

    PUT WEB_SERVICE_URL/roles

Expects an Array of objects containing:

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | Yes | - | The role name
permissions | Array | Yes | - | The role permssions

HTTP Status Code | Details
---- | ----
200 | The roles have been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "41U3sYipg",
      "name": "Role name",
      "permissions" : [...]
    },
    ...
  ],
  "total": 42
}
```

---

Update a role.

    POST WEB_SERVICE_URL/roles/{role_id}

With **{role_id}** the id of the role to update.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | No | - | The role name
permissions | Array | No | - | The role permssions

HTTP Status Code | Details
---- | ----
200 | The role has been updated
500 | An error occured on the server side
400 | Missing the role id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 1
}
```

---

Delete roles.

    DELETE WEB_SERVICE_URL/roles/{role_id}

With **{role_id}** a comma separated list of role ids to delete.

HTTP Status Code | Details
---- | ----
200 | The roles have been deleted
500 | An error occured on the server side
400 | Missing the role ids
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 42
}
```

## Users

Get users.

    GET WEB_SERVICE_URL/users

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on user names
useSmartSearch | Number | No | 1 | **1** to use a more advanced search mechanism, **0** to use a simple search based on a regular expression
origin | String | No | all | The users origin (either **cas**, **ldap**, **local** or **all**)
sortBy | String | No | name | The field to use to sort users. Only **name** is available right now
sortOrder | String | No | desc | The sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | 10 | The limit the number of users per page
include | Array | No | - | The list of fields to include from returned users
exclude | Array | No | - | The list of fields to exclude from returned users. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the list of users
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
      "email": "user.mail@company.com",
      "origin": "local",
      "locked": false,
      "roles": ["role1"]
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

Get a user.

    GET WEB_SERVICE_URL/users/{user_id}

With **{user_id}** the id of the user to retrieve.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
include | Array | No | - | The list of fields to include from returned user
exclude | Array | No | - | The list of fields to exclude from returned user. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the user
500 | An error occured on the server side
400 | Missing the id of the user
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point
404 | User not found

```json
{
  "entity": {
    "id": "{user_id}",
    "name": "User name",
    "password": "38d03dd58cd1bb6b4fdc59c3d03601461118c166b48baf787b96d5589ff0758d",
    "email": "user.mail@company.com",
    "origin": "local",
    "locked": false,
    "roles": ["role1"]
  }
}
```

---

Add users.

    PUT WEB_SERVICE_URL/users

Expects an Array of objects containing:

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | Yes | - | The user name
email | String | Yes | - | The user email
password | String | Yes | - | The user password
passwordValidate | String | Yes | - | The user password validation
roles | Array | No | - | To user roles
locked | Boolean | No | - | To lock the user from edition

HTTP Status Code | Details
---- | ----
200 | The users have been added
500 | An error occured on the server side
400 | Missing body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "41U3sYipg",
      "name": "User name",
      "password": "38d03dd58cd1bb6b4fdc59c3d03601461118c166b48baf787b96d5589ff0758d",
      "email": "user.mail@company.com",
      "origin": "local",
      "locked": false,
      "roles": ["role1"]
    },
    ...
  ],
  "total": 42
}
```

---

Update a user.

    POST WEB_SERVICE_URL/users/{user_id}

With **{user_id}** the id of the user to update.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | No | - | The user name
email | String | No | - | The user email
password | String | No | - | The user password
passwordValidate | String | No | - | The user password validation
roles | Array | No | - | To user roles

HTTP Status Code | Details
---- | ----
200 | The user has been updated
500 | An error occured on the server side
400 | Missing the user id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 1
}
```

---

Delete users.

    DELETE WEB_SERVICE_URL/users/{user_id}

With **{user_id}** a comma separated list of user ids to delete.

HTTP Status Code | Details
---- | ----
200 | The users have been deleted
500 | An error occured on the server side
400 | Missing the user ids
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 42
}
```

## Applications

Get applications.

    GET WEB_SERVICE_URL/applications

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
query | String | No | - | To search on application names
useSmartSearch | Number | No | 1 | **1** to use a more advanced search mechanism, **0** to use a simple search based on a regular expression
sortBy | String | No | name | The field to use to sort applications. Only **name** is available right now
sortOrder | String | No | desc | The sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | 10 | The limit the number of applications per page
include | Array | No | - | The list of fields to include from returned applications
exclude | Array | No | - | The list of fields to exclude from returned applications. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the list of applications
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

Get an application.

    GET WEB_SERVICE_URL/applications/{application_id}

With **{application_id}** the id of the application to retrieve.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
include | Array | No | - | The list of fields to include from returned application
exclude | Array | No | - | The list of fields to exclude from returned application. Ignored if include is also specified

HTTP Status Code | Details
---- | ----
200 | Got the application
500 | An error occured on the server side
400 | Missing the id of the application
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point
404 | Application not found

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

Add applications.

    PUT WEB_SERVICE_URL/applications

Expects an Array of objects containing:

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | Yes | - | The application name
scopes | Array | No | - | The application scopes

HTTP Status Code | Details
---- | ----
200 | The applications have been added
500 | An error occured on the server side
400 | Missing the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "41U3sYipg",
      "name": "Application name",
      "scopes": [...],
      "secret": "179a905785d4258bba255ffb812a25f2225f7d4c"
    },
    ...
  ],
  "total": 42
}
```

---

Update an application.

    POST WEB_SERVICE_URL/applications/{application_id}

With **{application_id}** the id of the application to update.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
name | String | No | - | The application name
scopes | Array | No | - | The application scopes

HTTP Status Code | Details
---- | ----
200 | The application has been updated
500 | An error occured on the server side
400 | Missing the application id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 1
}
```

---

Delete applications.

    DELETE WEB_SERVICE_URL/applications/{application_id}

With **{application_id}** a comma separated list of application ids to delete.

HTTP Status Code | Details
---- | ----
200 | The applications have been deleted
500 | An error occured on the server side
400 | Missing the application ids
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 42
}
```

## Settings

Get settings.

    GET WEB_SERVICE_URL/settings

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
sortOrder | String | No | desc | The sort order (either **asc** or **desc**)
page | Number | No | 0 | The expected page
limit | Number | No | 10 | The limit the number of settings per page

HTTP Status Code | Details
---- | ----
200 | Got the list of settings
500 | An error occured on the server side
400 | Wrong list of parameters
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "my-setting",
      "value": "Mixed value"
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

Get a setting.

    GET WEB_SERVICE_URL/settings/{setting_id}

With **{setting_id}** the id of the setting to retrieve.

HTTP Status Code | Details
---- | ----
200 | Got the setting
500 | An error occured on the server side
400 | Missing the id of the setting
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entity": {
    "id": "my-setting",
    "value": "Mixed value"
  }
}
```

---

Add settings.

If a setting already exists it will be updated.

    PUT WEB_SERVICE_URL/settings

Expects an Array of objects containing:

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
id | String | Yes | - | The setting id
value | Mixed | Yes | - | The setting value

HTTP Status Code | Details
---- | ----
200 | The settings have been added
500 | An error occured on the server side
400 | Missing setting ids in body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "entities": [
    {
      "id": "my-setting",
      "value": "Mixed value"
    },
    ...
  ],
  "total": 42
}
```

---

Update a setting.

    POST WEB_SERVICE_URL/settings/{setting_id}

With **{setting_id}** the id of the setting to update.

Name | Type | Required | Default | Details
---- | ---- | ---- | ---- | ----
value | Mixed | No | - | The setting value

HTTP Status Code | Details
---- | ----
200 | The setting has been updated
500 | An error occured on the server side
400 | Missing the setting id or the body
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 1
}
```

---

Delete settings.

    DELETE WEB_SERVICE_URL/settings/{setting_id}

With **{setting_id}** a comma separated list of setting ids to delete.

HTTP Status Code | Details
---- | ----
200 | The settings have been deleted
500 | An error occured on the server side
400 | Missing the setting id
401 | Authentication to the web service failed
403 | Authorization forbidden for this end point

```json
{
  "total": 42
}
```

# Client libraries

## PHP client

A [PHP client](https://github.com/veo-labs/openveo-rest-php-client) is also available on Github to help interface with OpenVeo Web Service.

## NodeJS client

A [NodeJS client](https://github.com/veo-labs/openveo-rest-nodejs-client) is also available on Github to help interface with OpenVeo Web Service.
