# Introduction

A consequent part of the development of openveo-core (and plugins) is made in **conf.json** file at project root. **conf.json** is used to :

- [Map routes on actions](#map-routes-on-actions)
- [Create entities](#create-entities)
- [Define back end permissions](#define-back-end-permissions)
- [Define back end menu items](#define-back-end-menu-items)
- [Load back end scripts](#back-end-scripts)
- [Load back end CSS](#back-end-css)
- [Set the list of directories containing templates](#list-of-directories-containing-templates)
- [Define image styles](#define-image-styles)
- [Define custom configuration](#define-custom-configuration)
- [Define Web Service scopes](#define-web-service-scopes)

# Map routes on actions

Routes are separated into three categories : public, private and Web Service routes.

```json
{
  "routes" : {
    "public" : {
      ...
    },
    "private" : {
      ...
    },
    "ws" : {
      ...
    }
  }
}
```

## Route descriptor

A route map an HTTP method and a path to an action (JavaScript function).

The route :

    "get /logout" : "app/server/controllers/authenticationController.logoutAction"

Can be interpreted as :

  > *A GET request on /logout will call the function logoutAction exposed by module app/server/controllers/authenticationController.js*

The route :

    "post /authenticate" : "app/server/controllers/authenticationController.authenticateAction"

Can be interpreted as :

  > *A POST request on /authenticate will call the function authenticateAction exposed by module app/server/controllers/authenticationController.js*

The route :

    "/login" : "app/server/controllers/defaultController.defaultAction"

Can be interpreted as :

  > *All requests on /login (GET, POST, DELETE, PUT) will call the function defaultAction exposed by module app/server/controllers/defaultController.js*

Example of valid routes :

```json
{
  "routes" : {
    "public" : {
      "get /test" : "adminExampleController.getTestAction",
      "post /test" : "adminExampleController.postTestAction",
      "put /test" : "adminExampleController.putTestAction",
      "/" : "exampleController.invalidAction",
      "/test" : "invalid action"
    }
  }
}
```

## Group routes

You can group actions by routes :

```json
{
  "routes" : {
    "public" : {
      "*" : [
        "adminExampleController.allFirstAction",
        "adminExampleController.allSecondAction"
      ]
    }
  }
}
```

## Route parameters

You can add parameters using colon character :

```json
{
  "routes" : {
    "public" : {
      "DELETE /test/:id" : "adminExampleController.deleteTestAction"
    }
  }
}
```

# Create entities

Entities are elements subject to CRUD (**C**reate **R**ead **U**pdate **D**elete). OpenVeo core defines 4 entities :

- application - Web Service client applications
- taxonomy - Taxonomies (not directly used by the core)
- user - Back end users
- role - Back end roles

Each entity will automatically have 3 associated back end permissions : create, update and delete.

To create a new entity you need to create a new EntityModel and a new EntityProvider. Let's say we want to create a new entity called **book**.

## Create entity provider

```javascript
'use strict';

var util = require('util');
var openVeoAPI = require('@openveo/api');

/**
 * Creates a BookProvider.
 */
function BookProvider(database) {

  // In BookProvider collection "books"
  openVeoAPI.EntityProvider.prototype.init.call(this, database, 'books');
}

// BookProvider must extend EntityProvider
module.exports = BookProvider;
util.inherits(BookProvider, openVeoAPI.EntityProvider);

```

## Create entity model

```javascript
'use strict';

// Module dependencies
var util = require('util');
var openVeoAPI = require('@openveo/api');

var BookProvider = process.require('BookProvider.js');

/**
 * Creates a BookModel.
 */
function BookModel() {
  openVeoAPI.EntityModel.prototype.init.call(this, new BookProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = BookModel;
util.inherits(BookModel, openVeoAPI.EntityModel);
```

## Declare entity

You can now declare your entity in **conf.json** :

```json
{
  "entities" : {
    "book" : "BookModel"
  }
}
```

## Use the entity

Now that you entity **book** is created you can see the 3 new permissions in the back end (create, update and delete). You can also perform CRUD operations on your entity using the following routes :

- **get /crud/book/:id** - Get a particular book
- **get /crud/book** - Get all books
- **post /crud/book/:id** - Update a particular book
- **put /crud/book** - Add a new book
- **delete /crud/book/:id** - Delete a book

# Define back end permissions

Each role can have n associated permissions. Permissions are described in **conf.json** :

```json
{
  "permissions" : [
    ...
  ]
}
```

## Create a permission

Let's create new permissions "sell" and "buy" to sell / buy books.

```json
{
  "permissions" : [
    {
      "id" : "sell-book", // Permission id
      "name" : "Sell", // Permission name
      "description" : "Sell books", // Permission description
      "paths" : [ // List of paths associated to the permission
        "get /sell*"
      ]
    },
    {
      "id" : "buy-book", // Permission id
      "name" : "Buy", // Permission name
      "description" : "Buy books", // Permission description
      "paths" : [ // List of paths associated to the permission
        "get /buy*"
      ]
    }
  ]
}
```

## Group permissions

You can group permissions to organize the list of permissions in the back end.

**Nb** : Actually OpenVeo only supports one sub level

```json
{
  "permissions" : [
    {
      "label": "Books", // Group label
      "permissions": [ // List of permission in the group
        {
          "id" : "sell-book",
          "name" : "Sell",
          "description" : "Sell books",
          "paths" : [
            "get /sell*"
          ]
        },
        {
          "id" : "buy-book",
          "name" : "Buy",
          "description" : "Buy books",
          "paths" : [
            "get /buy*"
          ]
        }
      ]
    }
  ]
}
```

## Use permissions

You can assign your permission to a role through the back end or manipulate the permission using [back end client](/developers/back-end) (AngularJS application).


# Define back end menu items

Back end menu items are described in **conf.json** :

```json
{
  "backOffice": {
    "menu" : [
      ...
    ]
  }
}
```

## Add a menu item

Let's create two new back end menu items.

```json
{
  "backOffice": {
    "menu" : [
      {
        "label" : "Sell books", // Menu item name
        "path" : "sell-books", // Menu item path
        "permission" : "sell-book" // Menu item associated permission
      },
      {
        "label" : "Buy books", // Menu item name
        "path" : "buy-books", // Menu item path
        "permission" : "buy-book" // Menu item associated permission
      }
    ]
  }
}
```

**weight** property helps order menu items, the larger the weight is, the better will be the item position.<br/>
**path** defines the AngularJS root path (see [back end client](/developers/back-end))<br/>
**permission** associates a permission to the menu item, if the connected user doesn't have that permission the item won't be displayed

## Group menu items

You can group menu items as sub menu items.

**Nb** : Actually OpenVeo only supports one sub level of menu items

```json
{
  "backOffice": {
    "menu" : [
      {
        "weight" : 100, // Position of the item in the menu
        "label" : "Books", // Name of the menu item
        "subMenu" : [ // List of sub menu items
          {
            "label" : "Sell books", // Menu item name
            "path" : "sell-books", // Menu item path
            "permission" : "sell-book" // Menu item associated permission
          },
          {
            "label" : "Buy books", // Menu item name
            "path" : "buy-books", // Menu item path
            "permission" : "buy-book" // Menu item associated permission
          }
        ]
      }
    ]
  }
}
```

# Back end scripts

The list of JavaScript files to load for the AngularJS back end application are defined in **conf.json** :

```json
{
  "backOffice": {
    "scriptLibFiles" : { // List of back end JavaScript files to load first
      "base" : [ // List of scripts to load on both development and production environments
        ...
      ],
      "dev" : [ // List of scripts to load on development environment
        ...
      ],
      "prod" : [ // List of script to load on production environment
        ...
      ]
    },
    "scriptFiles" : { // List of back end JavaScript files to load next
      "dev" : [ // List of scripts to load on development environment
        ...
      ],
      "prod" : [ // List of script to load on production environment
        ...
      ]
    }
  }
}
```

# Back end CSS

The list of CSS files to load for the AngularJS back end application are defined in **conf.json** :

```json
{
  "backOffice": {
    "cssFiles" : [ // List of CSS to load
      ...
    ]
  }
}
```

# List of directories containing templates

OpenVeo uses [Mustache](https://github.com/janl/mustache.js) as the template engine. Mustache requires directories were to look for potential templates. The list of directories is defined in **conf.json** :

```json
{
  "viewsFolders" : [ // List of directories holding mustache templates
    ...
  ]
}
```

# Define image styles

You can define image styles in **conf.json** :

```json
{
  "imageProcessing": {
    "imagesFolders": ["example/images"], // List of folders concerned by this style
    "cacheDir": "example/.thumbs", // Path of the directory containing generated images
    "quality": 50 // Compression level (from 0 to 100)
    "imagesStyle": { // Style to apply
      "small": 200 // Width (in px) of the image to generate for small style
    }
  }
}
```

Default width is 10px if no image style is specified for the directory.<br/>
Default **cacheDir** is .thumbs directory at the root of the application.<br/>
Default quality is 90.

Then you can call the image with your custom style **small**

```html
<img src="example/images/image1.jpg?thumb=small"/>
```

# Define custom configuration

You can define a custom configuration object in **conf.json** :

```json
{
  "custom": {
    "customProperty1" : "customValue1",
    "customProperty2" : 2
  }
}
```

**Nb :** Custom configuration won't be interpreted but can be retrieved later using OpenVeo API. You can use it to configure your plugin.


# Define Web Service scopes

You can define Web Service scopes in **conf.json** :

```json
{
  "webServiceScopes" : [
    {
      "id": "scopeId",
      "name" : "Scope name",
      "description" : "Scope description",
      "paths" : [
        "get /book/sell/*",
        "get /book/books*"
      ]
    }
  ]
}
```

A scope is defined by an id, a name, a description and a list of authorized paths for a Web Service application who has access to this scope.<br/>
Routes like **/book/sell/25** or **/book/books** will be available for a Web Service application with the scope **scopeId** in the above example.