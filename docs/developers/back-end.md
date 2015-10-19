# Introduction

OpenVeo back end is an [AngularJS](https://angularjs.org/) single page application served on **/be**.

The back end relies on a couple of libraries :

- **angular-route** to perform single page application routing
- **angular-animate** for CSS animations
- **angular-cookies** for cookie management
- **angular-i18n** for AngularJS default translations
- **angular-touch** to manage gesture
- **[angular-bootstrap](https://angular-ui.github.io/bootstrap/)** for basic user interface components
- **[angular-formly](http://angular-formly.com/)** to build formulars from a JavaScript literal object
- **[angular-ui-tree](http://angular-ui-tree.github.io/angular-ui-tree)** to build an UI tree (not directly used by openveo-core)
- **[angular-xeditable](http://vitalets.github.io/angular-xeditable/)** to be able to edit entities in place
- **[ng-jsonpath](https://github.com/noherczeg/ng-jsonpath)** to search on a JSON object (not directly used by openveo-core)
- **[ng-tasty](http://zizzamia.com/ng-tasty/)** to present entities in a dynamic paginated table

# Structure

## Main module

The main AngularJS module of the back end is named **ov** and is applied to the HTML root element.

```html
<html ng-app="ov" ng-controller="MainController" ng-strict-di>

  <head>
    <base href="/be/">
  </head>

  ...
  <div ng-view></div>
  ...
</html>
```

It has dependencies on all AngularJS libraries and all AngularJS modules described by OpenVeo plugins. It also defines all core routes :

- **/be/login** to access the login page
- **/be** to access the back end home page
- **/be/applications** to access Web service applications page
- **/be/users** to access users page
- **/be/profile** to access user's profile page
- **/be/roles** to access roles page

**Nb:** Available services / filters defined in **ov** module are described in the API.

## Alert module (**ov.alert**)

Offers a service to control alerts for the whole application. Alerts are used to display a message to the user.

**Nb:** Available services defined in **ov.alert** module are described in the API.

## Authentication module (**ov.authentication**)

Offers a service to authenticate / logout or manipulate authenticated user informations. User information are stored locally using the ov.storage module.

**Nb:** Available services / filters defined in **ov.authentication** module are described in the API.

## Entity module (**ov.entity**)

Offers a service to manage (CRUD) OpenVeo entities described in [conf.json](/developers/conf).

**Nb:** Available services defined in **ov.entity** module are described in the API.

## I18n module (**ov.i18n**)

Defines a service to control back end internationalization and a **translate** filter to help translate ids from a dictionary.

**Nb:** Available services / filters defined in **ov.i18n** module are described in the API.

## Storage module (**ov.storage**)

Offers a service to manipulate the local storage.

**Nb:** Available services defined in **ov.storage** module are described in the API.

## TableForm module (**ov.tableForm**)

Offers a turnkey solution to build formulars and tasty tables.

Formulars are the same as described in [angular-formly](http://angular-formly.com/).

Datatables are a little different from the original [ng-tasty](http://zizzamia.com/ng-tasty/) datable as actions can be assigned to a row and information about the row can be edited in place. Datatables needs an associated entity to work.

### Add a new form

Formulars are massively based on [angular-formly](http://angular-formly.com/).
To add a new formular, you have to place the generic formular partial in your HTML code and describe the expected form in your controller.

Include formular partial in your HTML.

```html
<ng-include src="'views/elements/form.html'"></ng-include>
```

Describes the formular in your controller.

```javascript

// List of books
$scope.books = [{
  "isbn": "50",
  "name": "Journey to the Center of the Earth"
}];

// Create a scope property "addFormContainer"
$scope.addFormContainer = {};

// Create a property "model" on "addFormContainer", this is were formly will
// stores form results
// This is the model of the form
$scope.addFormContainer.model = {};

// Describe fields just like in formly documentation
$scope.addFormContainer.fields = [
  {
    key: 'name',
    type: 'horizontalInput',
    templateOptions: {
      label: 'Label of the name field',
      required: true,
      description: 'Description of the name field'
    }
  },
  {
    key: 'books',
    type: 'horizontalCheckList',
    templateOptions: {
      label: 'Books',
      required: false,
      options: $scope.books,
      valueProp: 'isbn',
      labelProp: 'name',
      description: 'List of books'
    },
    expressionProperties: {
      'templateOptions.disabled': '!model.name' // disabled when book name is blank
    }
  }
];

// Add formular submit function
$scope.addFormContainer.onSubmit = function(model, successCb) {

  // Code to save the formular
  ...

  // Call successCb when everything is done to reset form fields
  // and display a success message
  successCb();
};
```

### Add a new datatable

Tables are massively based on [ng-tasty](http://zizzamia.com/ng-tasty/).
To add a new datatable, you have to place the generic datatable partial in your HTML code and describe the datatable expected behavior in your controller.

Include datatable partial in your HTML.

```html
<ng-include src="'views/elements/dataTable.html'"></ng-include>
```

Describes the datatable in your controller.

TODO