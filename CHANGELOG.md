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