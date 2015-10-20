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
$scope.addFormContainer.onSubmit = function(model) {

  // Return Angularjs promises with its own success or error callback
  // Code to save the formular
  // Generic error or success callback are already chained and executed by the form container
  // in order to display the right message to user and update the form
  return promise;
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

For the example, assume that you need to display a collection of **book** entity.
```JSON
{
  "isbn": "50",
  "name": "Journey to the Center of the Earth",
  "description" : "The story begins in May 1863, in the Lidenbrock house in Hamburg, Germany, with Professor Lidenbrock"
}
```

- Initialize tableContainer Object:
```javascript
// Create tableContainer Object used by DataTable controller
$scope.tableContainer = {};

// Initialize the entity type to enable DataTable controller to retrieve the right entity
$scope.tableContainer.entityType = 'book';
```

- Initialize search filters

```javascript
$scope.tableContainer.filterBy = [
  {
    key: 'name',  // properties to filter on
    value: '',    // initial value
    label: 'Label of the name search filter'
  }
];
```
Filters default type is text. Filter type can be set by adding **type** properties to filter object.
```javascript
{
  key: 'author',
  type: 'select',
  options : selectOptions,
  value: '',
  label: 'Label of the author search filter',
  filterWithChildren: true  // default:false; if true table filter will select with the selectId AND additionnal id set in the "children" key of the selected options
},
{
  key: 'date',
  type: 'date',
  value: '',
  label : 'Label of the date search filter'
}
```
Where **selectOptions** need to be describe in this format:
```JSON
[
  {
    "value": 'id',
    "name": 'title',
    "children" : 'id1,id2,id3'
  },
  ...
]
```

- Initialize DataTable headers
```javascript
// Each column need to display a property,
// Automatically, a sort filter is enable on each column except 'Action' column
$scope.tableContainer.header = [{
  key: 'name',                      // property co display and sort in column    
  name: 'Label of the name column',
  class: ['col-xs-12 col-sm-11']    // css class to add on header cell
},
{
  key: 'action',                    
  name: 'Label for action button' ,
  class: [' hidden-xs col-sm-1'],
}];
```
Header object 'action' is **REQUIRED** and not bind any sort filter.

Headers default type is text. Filter type can be set by adding **type** properties to filter object.
Default **date** (timestamp) and **text** value are enabled. 
But you can add any type if you make your own custom cell rendrer (see after)
```javascript
{
  key: 'date', 
  name: 'Label of the date column',
  type: 'date'
},
{
  key: 'author', 
  name: 'Label of the author column',
  type: 'author'
}
```
- Add a custom cell template renderer according to column key and row value
```javascript
//Usefull to add HTML value, or filtered value
//if not defined, can print date and text
//if defined, add custom cells renderer to date and text 
$scope.tableContainer.cellTheme = '/path/to/cells/template.html';
```
For example (assuming that **entities** is the header type to render, an **row[entities.key]**, the value to display)
```HTML
<span ng-if="entities.type && entities.type == 'type1' && row[entities.key]">{{row[entities.key] | filterType1}}</span>
<span ng-if="entities.type && entities.type == 'type2'" ng-bind-html="row[entities.key] | filterType2"></span>
```
** *BE CAREFUL ABOUT PERFORMANCES WHEN USING YOUR OWN FILTERS* **

- Initialize action enable on each row
```javascript
$scope.tableContainer.actions = [{
  label: 'Label of action',

  // Enable a Popup confirmation before action execution, default: false if not defined
  warningPopup: true,

  // Condition to enable the action in the dropdown button action
  condition: function(row) {      
    return $scope.rights.delete && !row.locked && !row.saving;
  },

  // Function to execute when the action is executed by button
  callback: function(row, reload) {
    // row is the book object on which the action is executed
    action(row.id);
    // call reload if dataTable need to be reloaded
    reload();
  },

  // Function to execute when the action is executed by select checkbox action
  // If not defined, this action can't be seen in checkbox actions
  global: function(selected, reload) {
    // selected is the list of selected entity id when global action is executed
    // exemple: [12345,12346,12347,12348,12349]
    actions(selected, reload);
  }
}];
```

- Initialize initial sort
```javascript
$scope.tableContainer.init = {
  sortBy: 'name',  // initial sort key, default: first header column key if not defined
  sortOrder: 'dsc' // initial sort order, default: 'asc' if not defined
};
```

- Display checkbox global selection
```javascript
//default true if not defined;
$scope.tableContainer.showSelectAll = true;
```

### Datatable dependency: edit a row

DataTable is dependent of an edit form. This form specify what information user can access and/or modify.
All properties described in the **[Add a new form](#add-a-new-form)** section can be used to describe the form.
Main differencies are that the form need to be initialized by the open row (the model is not exposed), and that form fields MUST be extend with an **[angular-xeditable](http://vitalets.github.io/angular-xeditable/)** field

- Initialize editFormContainer object
```javascript
// Create a scope property "editFormContainer"
$scope.addFormContainer = {};

// Create a property "model" on "editFormContainer", this is were formly will
// stores form results
// This is the model of the form
$scope.editFormContainer.model = {};

// Initialize the entity type to retrieve before the row is updated 
// to always update the latest value in database.
$scope.editFormContainer.entityType = 'book';

// Add formular submit function
$scope.editFormContainer.onSubmit = function(model) {
    return promises;
};

// Define if a row can be toggled or not
$scope.editFormContainer.conditionToggleDetail = function(row) {
  return row.state !== 0;
};
// Define if a row can be edit or not
$scope.editFormContainer.conditionEditDetail = function(row) {
  return !row.locked;
};
```
- Set Fields 
```javascript
// Describe fields just like in formly documentation, extends with openveo xeditable type
// editableInput, editableChecklist, editableChecklist
$scope.editFormContainer.fields = {
  // the key to be used in the model values
  key: 'name',
  type: 'horizontalExtendInput', //editableInput wrapped with horizontal layout
  templateOptions: {
    label: 'label for name input',
    required: true
  }
};
```
- Set Fields dynamically
```javascript
// Function call when the form is displayed
// Usefull to add fields dynamically according to the open row, 
// or retrieve information relative to the row
$scope.editFormContainer.init = function(row) {
  if(row.state == SHOW.PROPERTY){
    var newField = {
      key: 'property',
      type: 'horizontalExtendInput',
      model: row.property,
      templateOptions: {
        label: 'Label of the new property field'
      }
    };
    $scope.editFormContainer.fields.push(newField);
  }
}
```
### Fields type
In order to enhance forms, you can add your own fields type by specified them in the **formlyConfig** Object in **app.run**:
```javascript
// This type allready in Openveo can right an text in a well componant
formlyConfig.setType({
  name: 'emptyrow',
  template: '<div class="well well-sm">{{to.message}}</div>',
  wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
});

// to use it :

$scope.editFormContainer.fields = [
{
  noFormControl: true,
  type: 'emptyrow',
  templateOptions: {
    label: 'label of the not editable row',
    message: 'not editable value to display'
  }
}]
```
Xeditable fields that already exist are : editableInput, editableChecklist, editableChecklist, emptyrow

Other xeditable extend fields can be added but, to be used in an edit form, need to be wrapped in the **formlyConfig** Object:
```javascript
    formlyConfig.setType({
      name: 'horizontalExtendFieldType',
      extends: 'editableFieldType',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
```

