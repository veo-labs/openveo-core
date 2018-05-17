# 5.1.0 / YYYY-MM-DD

## NEW FEATURES

- Add a new AngularJS directive ov-date-time-picker which is a form element designed to specify both date and time. It uses Bootstrap date picker and time picker
- Add several formly types relative to the new date time picker directive: dateTimePicker, editableDateTimePicker and horizontalDateTimePicker

# 5.0.0 / 2018-05-04

## BREAKING CHANGES

- Image processing configuration has changed. To clarify and facilitate further development on image processing, configuration has changed. It is now possible to specify a cache directory by images folder, also quality can be specified by style. Please have a look at the [documentation](https://github.com/veo-labs/openveo-plugin-generator) to find out the new way of configuring image processing
- Controller / Model / Provider / Database system has been revised into a Controller / Provider / Storage system with the following important consequences:
  - Back office **entityService.addEntity** has been renamed into **entityService.addEntities** and is now capable of adding multiple entities
  - Back office **entityService.removeEntity** has been renamed into **entityService.removeEntities**
  - Back office **entityService.getAllEntities** has been renamed added to get all pages of entities (should be used wisely)
  - Web service endpoint PUT /applications now expects an array of applications instead of a single application
  - Web service endpoint PUT /applications now returns a property **entities** with the list of added applications and **total** the number of inserted applications
  - Web service endpoint POST /applications/:id now returns property **total** with value **1** if everything went fine
  - Web service endpoint DELETE /applications/:id now returns property **total** with the number of deleted applications
  - Web service endpoint PUT /groups now expects an array of groups instead of a single group
  - Web service endpoint PUT /groups now returns a property **entities** with the list of added groups and **total** the number of inserted groups
  - Web service endpoint POST /groups/:id now returns property **total** with value **1** if everything went fine
  - Web service endpoint DELETE /groups/:id now returns property **total** with the number of deleted groups
  - Web service endpoint PUT /roles now expects an array of roles instead of a single role
  - Web service endpoint PUT /roles now returns a property **entities** with the list of added roles and **total** the number of inserted roles
  - Web service endpoint POST /roles/:id now returns property **total** with value **1** if everything went fine
  - Web service endpoint DELETE /roles/:id now returns property **total** with the number of deleted roles
  - Web service endpoint GET /settings is no longer capable of getting settings by ids, use /settings/:id instead
  - Web service endpoint GET /settings now accepts **sortOrder** parameter to order settings by id (either **asc** or **desc**)
  - Web service endpoint PUT /settings now expects an array of settings instead of a single setting
  - Web service endpoint PUT /settings now returns a property **entities** with the list of added settings and **total** the number of inserted settings
  - Web service endpoint POST /settings/:id now returns property **total** with value **1** if everything went fine
  - Web service endpoint DELETE /settings/:id now returns property **total** with the number of deleted settings
  - Web service endpoint PUT /taxonomies now expects an array of taxonomies instead of a single taxonomy
  - Web service endpoint PUT /taxonomies now returns a property **entities** with the list of added taxonomies and **total** the number of inserted taxonomies
  - Web service endpoint POST /taxonomies/:id now returns property **total** with value **1** if everything went fine
  - Web service endpoint DELETE /taxonomies/:id now returns property **total** with the number of deleted taxonomies
  - Web service endpoint PUT /users now expects an array of users instead of a single user
  - Web service endpoint PUT /users now returns a property **entities** with the list of added users and **total** the number of inserted users
  - Web service endpoint POST /users/:id now returns property **total** with value **1** if everything went fine
  - Web service endpoint DELETE /users/:id now returns property **total** with the number of deleted users
  - The following error codes have been removed: 12, 13, 517, 518, 779, 780 and 781
  - Core API now longer exposes clientModel, groupModel, roleModel, taxonomyModel and userModel but clientProvider, groupProvider, roleProvider, taxonomyProvider and userProvider
- Drop support for NodeJS &lt; 8.9.4 and NPM &lt; 5.6.0

## NEW FEATURES

- Web service endpoint GET /applications now accepts **include** and **exclude** parameters to filter returned applications fields
- Web service endpoint GET /groups now accepts **include** and **exclude** parameters to filter returned groups fields
- Web service endpoint GET /roles now accepts **include** and **exclude** parameters to filter returned roles fields
- Web service endpoint GET /taxonomies now accepts **include** and **exclude** parameters to filter returned taxonomies fields
- Web service endpoint GET /users now accepts **include** and **exclude** parameters to filter returned users fields
- Hook **groups.added** is now executed when groups have been added
- Hook **group.updated** is now executed when a group has been updated
- Hook **groups.deleted** is now executed when groups have been deleted
- Core API now exposes the **settingProvider**
- $scope.hasPermission has been added to the back office client to test if a user possesses a permission
- Authenticated Web service requests have now an associated user which possesses all internal permissions
- Add NPM npm-shrinkwrap.json file

## BUG FIXES

- Remove duplicate error alert in dataTable edit form when submission fails
- Fix image processing which wasn't working since version 4.0.0. Requesting an image using image styles weren't working, the original file was always delivered instead of the resized one. Image processing now expects the **style** parameter instead of the **thumb** parameter. For example to request an image *my-image.jpg* and apply the style "my-style" you may now use my-image.jpg?**style**=my-style instead of my-image.jpg?**thumb**=my-style
- Fix OpenVeo upgrade with an empty database when upgrading from a version prior to version 2.0.0
- Fix error in formly when defining a field hidden by the "hideExpression" property, submitting the form with the field hidden was throwing a JavaScript error

## DEPENDENCIES

- **gm** has been moved to OpenVeo API
- **imagemagick** has been moved to OpenVeo API

# 4.2.0 / 2017-10-19

## NEW FEATURES

- Add a new formly type "section" to display a level 3 title (h3) inside a formly form
- Add a new formly type "simple" to display a simple text next to a form label
- Improve directive ov-tags and its corresponding formly type "tags". ov-tags now accepts a placeholder and a list of predefined values. If predefined values are set only those values can be added using the auto-complete
- Add a directive ov-match and its corresponding formly type "match" to associate a value with a list of values. It is made of two fields: an input field holding a simple value and a tags field (using directive ov-tags) holding a list of values. Depending on its configuration several associations can be added
- Add hook ROLES_DELETED when removing roles
- Add hook USERS_DELETED when removing users
- Add support for CAS and LDAP. OpenVeo can now authenticates users using external services (CAS and LDAP). See documentation on how to configure OpenVeo to be able to authenticate through those external services

## BUG FIXES

- Fix back end menu items positions. Items without sub items were organized between them and items with sub items were organized between them. There is now no distinction made between items without sub items and items with sub items
- Automatically remove role from users when a role is deleted
- Fix error in install script when not answering a question about the super administrator account

# 4.1.0 / 2017-09-12

## BUG FIXES

- Remove failing process.api.getCoreApi().getPlugins() function. You should use process.api.getPlugins() instead.
- Fix super admin id and anonymous id from OpenVeoSettings which were Numbers instead of Strings.
- Fix profile page for super admin user, it was possible to edit the name of the super administrator even if it wasn't saved in server side. It is now impossible to edit the name of the super administrator.
- Fix functional tests errors on roles page and users page ("Search should be case insensitive")
- Fix Web Service functional tests

## NEW FEATURES

- Expose anonymous and super admin id to back end client
- Execute functional tests on Travis
- Execute unit tests on Travis
- Some of the permissions in group "Other permissions" have been moved to other groups. "Access applications page" permission has been moved to "Web Service applications" group. "Access users page" permission has been moved to "Users" group. "Access roles page" permission has been moved to "Roles" group. "Access groups page" permission has been moved to "Groups" group. Also note that "Web Service" group has been renamed into "Web Service applications".
- Expose functions to start / stop / restart OpenVeo within functional tests. Use process.protractorConf.startOpenVeo(), process.protractorConf.stopOpenVeo() and process.protractorConf.restartOpenVeo() to start / stop / restart OpenVeo server respecting Protractor's flow.
- Cover more functional tests on back end home page and left menu
- Add a Protractor "coreCommon" suite to tests generic features common to plugins and core. Each plugin should execute this suite with their functional tests
- Cover more functional tests on back end profile page
- Cover more functional tests on back end Web Service page
- Cover more functional tests on back end Roles page
- Cover more functional tests on back end Users page
- Cover more functional tests on back end Groups page
- Add button on back end add forms are now disabled while saving
- Expose instances of Models through the Core API. It is now possible to manipulate taxonomies, Web Service clients, groups, roles and users through the Core API
- Add new Angular Formly types "ovFile" and "horizontalFile" to add files. Actually it gives you the possibility to add a file with a progress bar (without preview)

## DEPENDENCIES

- **karma-phantomjs-launcher** has been removed
- **chai** has been upgraded from 3.5.0 to **4.0.2**
- **chai-as-promised** has been upgraded from 6.0.0 to **7.1.1**

# 4.0.0 / 2017-05-04

## BREAKING CHANGES

- ov.tableForm AngularJS module now requires that datatable filters precise the name of the corresponding parameter in the server side getEntitiesAction. See documentation for further information.
- Drop support for Node.js &lt;7.4.0
- Drop support for NPM &lt;4.0.5
- OpenVeo now requires the configuration of a CDN. There is actually no common CDN to store users' files but there will be in a next version. All files are not stored in a common CDN but still need to be delivered by an HTTP server. That's the point of this configuration. See documentation for how to set CDN url.
- Web Service server doesn't deliver images anymore
- Usage of Web Service end points */taxonomies*, */groups*, */roles*, */users* and */applications* has change. *page* parameter now starts at 0 instead of 1.
- OpenVeo anonymous id is no longer configurable. **Do not remove it from conf.json file until you restart OpenVeo server**.

## NEW FEATURES

- OpenVeo now embeds a **socket server** based on socket.io. Launching OpenVeo main process will now automatically launch a socket server listening on the port specified in configuration. Plugins can now implement their own socket namespaces and handle messages. See documentation for further information.
- **Search engines** for applications, groups, roles and users have been improved. Multiple search fields for groups have been replaced by a unique field. Search is now case insensitive and search is made on the whole string not just strings starting with the query. The query string is taken as the whole when searching meaning that special characters aren't interpreted and thus will be searched as is.
- Add **detection for plugins** not in @openveo scope and starting by **openveo-**. Community plugins can now be implemented freely.
- Add an API mechanism to let plugins expose their own APIs to other plugins.
- Expose APIs for Plugins. See documentation for more details.

## BUG FIXES

- Fix bug when launching end to end tests without MongoDB replicaset
- Fix process starting error when having files other than JavaScript files (extension .js) in migrations directory
- Fix deprecation warning on compass (_mq.scss file) when installing

## DEPENDENCIES

- **body-parser** has been updated from 1.15.1 to **1.15.2**
- **consolidate** has been updated from 0.14.1 to **0.14.5**
- **cookie-parser** has been updated from 1.4.1 to **1.4.3**
- **express** has been updated from 4.13.4 to **4.14.0**
- **express-session** has been updated from 1.13.0 to **1.14.2**
- **gm** has been updated from 1.22.0 to **1.23.0**
- **mustache** has been updated from 2.2.1 to **2.3.0**
- **nopt** has been updated from 3.0.6 to **4.0.1**
- **oauth20-provider** has been updated from 0.5.1 to **0.6.0**
- **semver** has been updated from 5.1.0 to **5.3.0**
- **serve-favicon** has been updated from 2.3.0 to **2.3.2**
- **grunt** has been updated from 0.4.5 to **1.0.1**
- **grunt-contrib-uglify** has been updated from 1.0.1 to **2.0.0**
- **grunt-eslint** has been updated from 18.1.0 to **19.0.0**
- **grunt-exec** has been updated from 0.4.6 to **1.0.0**
- **grunt-gh-pages** has been updated from 1.1.0 to **2.0.0**
- **grunt-karma** has been updated from 1.0.0 to **2.0.0**
- **grunt-mkdocs** has been updated from 0.1.3 to **0.2.0**
- **grunt-mocha-test** has been updated from 0.12.7 to **0.13.2**
- **grunt-protractor-runner** has been updated from 4.0.0 to **5.0.0**
- **karma** has been updated from 0.13.22 to **1.3.0**
- **karma-chrome-launcher** has been updated from 1.0.1 to **2.0.0**
- **karma-mocha** has been updated from 1.0.1 to **1.3.0**
- **karma-phantomjs-launcher** has been updated from 1.0.0 to **1.0.2**
- **mocha** has been updated from 2.4.5 to **3.2.0**
- **nodemon** has been updated from 1.9.2 to **1.11.0**
- **pre-commit** has been updated from 1.1.2 to **1.2.2**
- **glob** has been removed
- **grunt-remove** has been removed
- **grunt-rename** has been removed
- **grunt-extend-config** has been removed
- **grunt-init** has been removed
- **generator-openveo-plugin** is now directly included in development dependencies

# 3.0.0 / 2017-01-03

- Update async module from version 1.2.0 to 2.1.4
- Update protractor and chai-as-promised dependencies
- Correct issue when creating a Web Service token for a client
- Debug UI issues

# 2.0.4 / 2016-09-15

- Debug touch due to deprecated use of angular-touch on Angularjs 1.5.x. Use of fastclick instead.

# 2.0.3 / 2016-09-09

- Add the possibility to use variable values within translations
- Store the session secret in the applicationStorage on server start

# 2.0.2 / 2016-07-07

- Update Node and NPM dependencies
- Modify menu close effect to improve navigation

# 2.0.1 / 2016-06-10

- Add Util service module in Front-End
- Update documentation to link OpenVeo generator plugin
- SECURITY DEBUG: Do not let conf set SuperAdminId

# 2.0.0 / 2016-05-30

- Update Form to delete xeditable dependencies
- Create index for core search entities
- Add Webservices for entities
- Update entities to call new API Model (Content or Entities)
- Add Groups to content entities (with CRUD permissions)
- Add Owner to content entities (with owner CRUD permissions)
- Use Controller API interface
- Use Taxonomy Model from API to manage all taxonomies
- Aggregation of migration script and execution
- Avoid collision between core and plug-in for entities, database table or image filter.
- Update dependencies

# 1.2.1 / 2016-02-19

- Freeze project's dependencies due to incompatibilities with AngularJS version 1.4.9

# 1.2.0 / 2016-02-19

- Correct cache issues on static resources
- Update AngularJS from version 1.4.3 to 1.4.7
- Update angular-formly from version 7.1.2 to 7.3.7
- Update angular-formly-templates-bootstrap from version 6.1.0 to 6.1.7
- Update api-check from version 7.5.0 to 7.5.5
- Update angular-sanitize from version 1.4.6 to 1.4.7
- Update checklist-model from version 0.6.0 to 0.8.0
- Update angular-bootstrap from version 0.13.4 to 0.14.3
- Restore the possibility to set the number of displayed items per page for pages with lists
- Correct security issue when a user was associated to a role without permissions
- Correct bug when searching in lists, sometimes the previous search results were displayed
- Remove cache on GET requests
- Return to login page when directly calling /be/logout
- Correct blank page on login page happening sometimes (when user session has expired)
- Select the general checkbox, on lists, when all lines of the page are selected

# 1.1.1 / 2015-11-25

- Update dependency versions to authorize all minor versions of @openveo/test and @openveo/api
- Authorize all nodejs versions from 0.10.0 to 4.2.2

# 1.1.0 / 2015-11-24

- Freeze project's dependencies
- Forbid locked users to edit their password
- Make back end compatible with mobile and tablet
- Add action button on mobile to edit lists of entities
- Remove all displayed alerts on logout
- Correct opening animation on action button

# 1.0.0 / 2015-10-26

First stable version of OpenVeo core CMS. It embeds an HTTP server based on Express framework (Express) and a plugin loader mechanism.

The core of the system (i.e. without any plugin) offers a simple connection form to the administration interface.

This interface gives access to a limited set of default features:

- Users management
- Permissions and roles management
- Web service management
- A profile page
- Each plugin brings zero to many additive administration pages and zero to many additive public pages.
