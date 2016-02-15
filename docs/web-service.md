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

# Auhtenticate to the Web Service

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

No endpoints are exposed by the core.

# Client libraries

## PHP client

A [PHP client](https://github.com/veo-labs/openveo-rest-php-client) is also available on Github to help interface with OpenVeo Web Service.