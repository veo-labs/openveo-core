# Introduction

A consequent part of the development of openveo-core (and plugins) is made in **conf.js** file at project root. **conf.js** is used to :

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

```js
module.exports = {
  routes: {
    public: {
      ...
    },
    private: {
      ...
    },
    ws: {
      ...
    }
  }
};
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

```js
module.exports = {
  routes: {
    public: {
      'get /test': 'adminExampleController.getTestAction',
      'post /test': 'adminExampleController.postTestAction',
      'put /test': 'adminExampleController.putTestAction',
      '/': 'exampleController.invalidAction',
      '/test': 'invalid action'
    }
  }
};
```

## Group routes

You can group actions by routes :

```js
module.exports = {
  routes: {
    public: {
      '*': [
        'adminExampleController.allFirstAction',
        'adminExampleController.allSecondAction'
      ]
    }
  }
};
```

## Route parameters

You can add parameters using colon character :

```js
module.exports = {
  routes: {
    public: {
      'DELETE /test/:id': 'adminExampleController.deleteTestAction'
    }
  }
};
```

# Create entities

Entities are elements subject to CRUD (**C**reate **R**ead **U**pdate **D**elete). OpenVeo core defines 5 entities :

- applications - Web Service client applications
- users - Back end users
- roles - Back end roles
- groups - Groups
- taxonomies - Taxonomies with associated terms

Each entity will automatically have 3 associated back end permissions : add, update and delete.

To create a new entity you need to create a new EntityController, EntityModel and EntityProvider. Let's say we want to create a new entity called **book**.

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
  openVeoAPI.EntityProvidercall(this, database, 'book-books');
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

var BookProvider = process.requireBook('app/server/providers/BookProvider.js');

/**
 * Creates a BookModel.
 */
function BookModel() {
  openVeoAPI.EntityModel.call(this, new BookProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = BookModel;
util.inherits(BookModel, openVeoAPI.EntityModel);
```

## Create entity controller

```javascript
'use strict';

var util = require('util');
var openVeoAPI = require('@openveo/api');
var BookModel = process.requireBook('app/server/models/BookModel.js');
var EntityController = openVeoAPI.controllers.EntityController;

/**
 * Creates a BookController.
 */
function BookController(database) {
  EntityController.call(this, BookModel);
}

module.exports = BookController;
util.inherits(BookController, EntityController);

```

## Declare entity

You can now declare your entity in **conf.js** :

```js
module.exports = {
  entities: {
    books: 'BookController'
  }
};
```

## Use the entity

Now that you entity **book** is created you can see the 3 new permissions in the back end (add, update and delete). You can also perform CRUD operations on your entity using the following routes :

- **get /book/books/:id** - Get a particular book
- **get /book/books** - Get all books
- **post /book/books/:id** - Update a particular book
- **put /book/books** - Add a new book
- **delete /book/books/:id** - Delete a book

# Define back end permissions

Each role can have n associated permissions. Permissions are described in **conf.js** :

```js
module.exports = {
  permissions: [
    ...
  ]
};
```

## Create a permission

Let's create new permissions "sell" and "buy" to sell / buy books.

```js
module.exports = {
  permissions: [
    {
      id: 'book-sell-book', // Permission id
      name: 'Sell', // Permission name
      description: 'Sell books', // Permission description
      paths: [ // List of paths associated to the permission
        'get /book/sell*'
      ]
    },
    {
      id: 'book-buy-book', // Permission id
      name: 'Buy', // Permission name
      description: 'Buy books', // Permission description
      paths: [ // List of paths associated to the permission
        'get /book/buy*'
      ]
    }
  ]
};
```

## Group permissions

You can group permissions to organize the list of permissions in the back end.

**Nb** : Actually OpenVeo only supports one sub level

```js
module.exports = {
  permissions: [
    {
      label: 'Books', // Group label
      permissions: [ // List of permission in the group
        {
          id: 'book-sell-book',
          name: 'Sell',
          description: 'Sell books',
          paths: [
            'get /book/sell*'
          ]
        },
        {
          id: 'book-buy-book',
          name: 'Buy',
          description: 'Buy books',
          paths: [
            'get /book/buy*'
          ]
        }
      ]
    }
  ]
};
```

## Use permissions

You can assign your permission to a role through the back end or manipulate the permission using [back end client](/developers/back-end) (AngularJS application).


# Define back end menu items

Back end menu items are described in **conf.js** :

```js
module.exports = {
  backOffice: {
    menu: [
      ...
    ]
  }
};
```

## Add a menu item

Let's create two new back end menu items.

```js
module.exports = {
  backOffice: {
    menu: [
      {
        label: 'Sell books', // Menu item name
        path: 'book/sell-books', // Menu item path
        permission: 'book-sell-book' // Menu item associated permission
      },
      {
        label: 'Buy books', // Menu item name
        path: 'book/buy-books', // Menu item path
        permission: 'book-buy-book' // Menu item associated permission
      }
    ]
  }
};
```

**weight** property helps order menu items, the larger the weight is, the better will be the item position.<br/>
**path** defines the AngularJS root path (see [back end client](/developers/back-end))<br/>
**permission** associates a permission to the menu item, if the connected user doesn't have that permission the item won't be displayed

## Group menu items

You can group menu items as sub menu items.

**Nb** : Actually OpenVeo only supports one sub level of menu items

```js
module.exports = {
  backOffice: {
    menu: [
      {
        weight: 100, // Position of the item in the menu
        label: 'Books', // Name of the menu item
        subMenu: [ // List of sub menu items
          {
            label: 'Sell books', // Menu item name
            path: 'book/sell-books', // Menu item path
            permission: 'book-sell-book' // Menu item associated permission
          },
          {
            label: 'Buy books', // Menu item name
            path: 'book/buy-books', // Menu item path
            permission: 'book-buy-book' // Menu item associated permission
          }
        ]
      }
    ]
  }
};
```

# Back end scripts

The list of JavaScript files to load for the AngularJS back end application are defined in **conf.js** :

```js
module.exports = {
  backOffice: {
    scriptLibFiles: { // List of back end JavaScript files to load first
      base: [ // List of scripts to load on both development and production environments
        ...
      ],
      dev: [ // List of scripts to load on development environment
        ...
      ],
      prod: [ // List of script to load on production environment
        ...
      ]
    },
    scriptFiles: { // List of back end JavaScript files to load next
      dev: [ // List of scripts to load on development environment
        ...
      ],
      prod: [ // List of script to load on production environment
        ...
      ]
    }
  }
};
```

# Back end CSS

The list of CSS files to load for the AngularJS back end application are defined in **conf.js** :

```js
module.exports = {
  backOffice: {
    cssFiles: [ // List of CSS to load
      ...
    ]
  }
};
```

# List of directories containing templates

OpenVeo uses [Mustache](https://github.com/janl/mustache.js) as the template engine. Mustache requires directories were to look for potential templates. The list of directories is defined in **conf.js** :

```js
module.exports = {
  viewsFolders: [ // List of directories holding mustache templates
    ...
  ]
};
```

# Define image styles

You can define image styles in **conf.js** :

```js
module.exports = {
  imageProcessing: {
    imagesFolders: ['example/images'], // List of folders concerned by this style
    cacheDir: 'example/.thumbs', // Path of the directory containing generated images
    quality: 50, // Compression level (from 0 to 100)
    imagesStyle: { // Style to apply
      'small': 200 // Width (in px) of the image to generate for small style
    }
  }
};
```

Default width is 10px if no image style is specified for the directory.<br/>
Default **cacheDir** is .thumbs directory at the root of the application.<br/>
Default quality is 90.

Then you can call the image with your custom style **small**

```html
<img src="book/example/images/image1.jpg?thumb=small"/>
```

# Define custom configuration

You can define a custom configuration object in **conf.js** :

```js
module.exports = {
  custom: {
    customProperty1: 'customValue1',
    customProperty2: 2
  }
};
```

**Nb :** Custom configuration won't be interpreted but can be retrieved later using OpenVeo API. You can use it to configure your plugin.

# Define Web Service scopes

You can define Web Service scopes in **conf.js** :

```js
module.exports = {
  webServiceScopes: [
    {
      id: 'book-scopeId',
      name: 'Scope name',
      description: 'Scope description',
      paths: [
        'get /book/book/sell/*',
        'get /book/book/books*'
      ]
    }
  ]
};
```

A scope is defined by an id, a name, a description and a list of authorized paths for a Web Service application who has access to this scope.<br/>
Routes like **/book/book/sell/25** or **/book/book/books** will be available for a Web Service application with the scope **book-scopeId** in the above example.