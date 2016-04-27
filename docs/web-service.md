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

You can create a new application with a client id and a client secret through the back end (`http://localhost:PORT/be/applications`).

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
curl_setopt($curlHandle, CURLOPT_URL, '{OPENVEO_URL}/publish/videos');
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
sortBy | String | No | name | To sort taxonomies by **name**
sortOrder | String | No | desc | Sort order (either **asc** or **desc**)
page | Number | No | 1 | The expected page
limit | Number | No | - | To limit the number of taxonomies per page. If not specified get all taxonomies

HTTP Status Code | Details
---- | ----
500 | An error occured on the server side
200 | Got the list of taxonomies (even if the list is empty)

```json
{
  "taxonomies": [
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
500 | An error occured on the server side
200 | Got the taxonomy

```json
{
  "taxonomy": {
    "name": "{taxonomy_id}",
    "id": "41U3sYipg",
    "tree": []
  }
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
page | Number | No | 1 | The expected page
limit | Number | No | - | To limit the number of groups per page. If not specified get all groups

HTTP Status Code | Details
---- | ----
500 | An error occured on the server side
200 | Got the list of groups (even if the list is empty)

```json
{
  "groups": [
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
500 | An error occured on the server side
400 | The id of the group is missing
200 | Got the group

```json
{
  "group": {
    "id": "Nk0fPIulZ",
    "name": "Group name",
    "description": "Group description"
  }
}
```

# Client libraries

## PHP client

A [PHP client](https://github.com/veo-labs/openveo-rest-php-client) is also available on Github to help interface with OpenVeo Web Service.

## NodeJS client

A [NodeJS client](https://github.com/veo-labs/openveo-rest-nodejs-client) is also available on Github to help interface with OpenVeo Web Service.