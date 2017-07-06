# 4.1.0 /

## BUG FIXES

- Remove failing process.api.getCoreApi().getPlugins() function. You should use process.api.getPlugins() instead.
- Fix super admin id and anonymous id from OpenVeoSettings which were Numbers instead of Strings.
- Fix profile page for super admin user, it was possible to edit the name of the super administrator even if it wasn't saved in server side. It is now impossible to edit the name of the super administrator.

## NEW FEATURES

- Expose anonymous and super admin id to back end client
- Execute functional tests on Travis
- Execute unit tests on Travis
- Some of the permissions in group "Other permissions" have been moved to other groups. "Access applications page" permission has been moved to "Web Service applications" group. "Access users page" permission has been moved to "Users" group. "Access roles page" permission has been moved to "Roles" group. "Access groups page" permission has been moved to "Groups" group. Also note that "Web Service" group has been renamed into "Web Service applications".
- Expose functions to start / stop OpenVeo within functional tests. Use process.protractorConf.startOpenVeo() and process.protractorConf.stopOpenVeo() to start / stop OpenVeo server respecting Protractor's flow.
- Cover more functional tests on back end home page and left menu
- Add a Protractor "coreCommon" suite to tests generic features common to plugins and core. Each plugin should execute this suite with their functional tests

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
