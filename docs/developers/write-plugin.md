# Introduction

As OpenVeo server starts, all plugins found in **node_modules/@openveo/** will be loaded. Each plugin can add routes and add its own pages in the back end.

Let's pretend we want to create a plugin called **book** to manage a list of books.

# Create plugin's directory

The first thing we need is a plugin's directory, create a directory **book** under **node_modules/@openveo/** (**node_modules/@openveo/book**).

# Create plugin's main file

A plugin must have a class which extends **Plugin** class.

Create a file **BookPlugin.js** at the root of your plugin directory.

```javascript
'use strict';

// Module dependencies
var util = require('util');
var express = require('express');
var openVeoAPI = require('@openveo/api');

/**
 * Creates a BookPlugin.
 */
function BookPlugin() {

  // Creates a public router
  // It will be automatically mounted on /book/ by the core
  this.router = express.Router();

  // Creates a private router
  // All routes associated to the private router require a back end authentication
  // It will be automatically mounted on /be/book/ by the core
  this.privateRouter = express.Router();

  // Creates a Web Service router
  // All routes associated to the Web Service router will be part of the Web Service
  // It will be automatically mounter on /book/ by the core (but on another server)
  this.webServiceRouter = express.Router();

}

// Expose BookPlugin
module.exports = BookPlugin;

// Extends Plugin
util.inherits(BookPlugin, openVeoAPI.Plugin);

/**
 * Optional "start" method automatically called by core application
 * after plugin is loaded.
 */
BookPlugin.prototype.start = function() {
  console.log('Book plugin loaded');
};
```

If you don't want to expose public routes, private routes or Web Service routes, just remove the corresponding router.

# Create plugin's entry point

A plugin must have an entry point. Either the one described in your **package.json** file (if you have one) or an **index.js** file. This is the file loaded by the core.

Create a file **index.js** at the root of your plugin directory.

```javascript
'use strict';

// Module dependencies
var path = require('path');

// Set module root directory
process.rootBook = __dirname;

// Define a new method on process object to be able to require
// a module with a path relative to plugin's root directory
process.requireBook = function(filePath) {
  return require(path.join(process.requireBook, filePath));
};

// Expose the BookPlugin
module.exports = process.requireBook('app/server/BookPlugin.js');
```

As the plugin will be loaded by OpenVeo core, root of the OpenVeo application will be the root of OpenVeo core and not the root of your plugin. To avoid confusion and collision between the core and your plugin, define a property process.root**PLUGIN_NAME** to have a reference to the root of your plugin.

A best practice is to also add a require**PLUGIN_NAME** function to load your JavaScript files with paths relative to the root of your plugin.</br>
For example, if you want to load a file **dir/test.js** from file **dir/subDir/index.js** instead of writing :

```javascript
var test = require('../test.js');
```

You can write :

```javascript
var test = process.requireBook('dir/subDir/test.js');
```

Like that moving the file **index.js** won't break your code.

At this point you have a functional plugin, but it does nothing. When launching the server, the plugin is loaded by the core and message '*Book plugin loaded*' is displayed in the console.

# Create routes

To add features to our Book plugin we need to define routes.

Create a file **conf.json** at the root of your plugin directory. Take a look at [conf.json documentation](/developers/conf) for more details about **conf.json** file.

For our example, let's create a public route, a private route and a Web Service route.

```json
{
  "routes" : {
    "public" : {
      "get /:id" : "controllers/bookController.displayBookAction"
    },
    "private" : {
      "get /read/:id" : "controllers/bookController.readBookAction"
    },
    "ws": {
      "get /read/:id" : "controllers/bookController.readBookAction"
    }
  }
}
```

As a reminder :

- public routes will be mounted on **/book/**
- private routes will be mounted on **/be/book/**
- Web Service routes will be mounted on **/book/** (but on another server)

## Create the controller

3 routes have been defined in **conf.json** :

- **/book/:id** pointing to **controllers/bookController.js**, method **displayBookAction**
- **/book/read/:id** pointing to **controllers/bookController.js**, method **readBookAction**
- **/book/read/:id** pointing to **controllers/bookController.js**, method **readBookAction**

Create a file **controllers/bookController.js** with **displayBookAction** and **readBookAction** methods :

```javascript
'use strict';

// Module dependencies
var openVeoAPI = require('@openveo/api');

/**
 * Displays a book.
 */
module.exports.displayBookAction = function(request, response, next) {
  var bookId = request.params.id;

  // Retrieve books
  var books = {
    '1': {
      title: 'Journey to the center of the earth',
      summary: 'The story begins in May 1863, in the Lidenbrock house in Hamburg, Germany, with Professor Lidenbrock rushing home to peruse his latest purchase, an original runic manuscript of an Icelandic saga written by Snorri Sturluson ("Heimskringla"; the chronicle of the Norwegian kings who ruled over Iceland).'
    }
  };

  // Display template book.html using Mustache template
  response.render('book', books[bookId]);
};

/**
 * Reads book content and return it as a JSON object.
 */
module.exports.readBookAction = function(request, response, next) {
  var bookId = request.params.id;

  // Retrieve books
  var books = {
    '1': {
      content: 'Journey to the center of the earth'
    }
  };

  response.send({
    book: books[bookId].content
  });

};
```

You can now restart your server, connect to the back end (/be/login) and navigate to **/be/book/read/1** to read the book.

## Create a template

The public route **/book/:id** call the **displayBookAction** function on the **bookController**.<br/>
**displayBookAction** needs a template **book.html** to display information about the book.

Create a file **views/book.html** :

```html
<!DOCTYPE html>
<html>
  <body>
    <div>
      <h1>{{title}}</h1>
      <p>{{summary}}</p>
    </div>
  </body>
</html>
```

And add the **views** directory to the list of directories containing Mustache templates (in **conf.json** file) :

```json
{
  "viewsFolders" : [
    "views"
  ]
}
```

You can now restart your server and navigate to **/book/1** to have information about the book.

# Add directory of resources

You can add an **assets** directory at the root of your plugin, all files inside that directory will be served as they are. You can put here images, front JavaScript files, CSS files and so on. The core will mount this directory on **/book/**, thus to access image **assets/test.jpg** you have to call **/book/test.jpg**.

# Add page to the back end

Plugins can add pages to the back end menu.

## Configure page

As described in [conf.json documentation](/developers/conf#define-back-end-menu-items) you can add a page to the back end :

```json
{
  "backOffice": {
    "menu" : [
      {
        "label" : "Books",
        "subMenu" : [
          {
            "label" : "Configuration",
            "path" : "config"
          }
        ]
      }
    ]
  }
}
```

## Create AngularJS module

As OpenVeo back end is written in AngularJS, we must create an AngularJS module to add pages to the back end.

Create a file **assets/be/js/BookApp.js** :

```javascript
(function(angular) {

  'use strict';

  // Module name must respect the form ov.PLUGIN_DIRECTORY_NAME
  var app = angular.module("ov.book", []);

  /**
   * Configures the ov.book application by adding new routes.
   */
  app.config(['$routeProvider', function($routeProvider) {

    // Add route /book/config
    $routeProvider.when('/book/config', {
      templateUrl: '/book/be/views/config.html',
      controller: 'BookController',
      title: 'Book configuration'
    });

  }]);

  /**
   * Defines the book controller for the configuration page.
   */
  function BookController($scope) {

  }

  app.controller('BookController', BookController);
  BookController.$inject = ['$scope'];

})(angular);
```

Create the partial file **assets/be/views/config.html** :

```html
<p>Configuration template</p>
```

And add **BookApp.js** to the list of scripts to load with the back end (**in conf.json**) :

```json
{
  "backOffice": {
    "scriptFiles" : {
      "dev" : [
        "/book/be/js/BookApp.js"
      ]
    }
  }
}
```

## Translate your back end pages

You can translate your back end pages using the back end dictionary called **admin-back-office**. Core will search for an **i18n** directory to look for dictionaries.

Create an **i18n** directory with french and english dictionaries for the back end :

**i18n/admin-back-office-en.json** :

```json
{
  "BOOK" : {
    "CONFIGURATION" : "Configuration template"
  }
}
```

**i18n/admin-back-office-fr.json** :

```json
{
  "BOOK" : {
    "CONFIGURATION" : "Template de configuration"
  }
}
```

You can now translate your **config.html** file :

```html
<p>{{'BOOK.CONFIGURATION' | translate}}</p>
```

**Nb :** For more information on internationalization please refer to the [i18n documentation](/developers/i18n).