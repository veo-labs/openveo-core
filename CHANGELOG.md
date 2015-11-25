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