# What's OpenVeo ?

OpenVeo is a [Node.js](http://nodejs.org/) and [AngularJS](https://angularjs.org/) CMS. It embeds an HTTP server based on Express framework ([Express](https://www.npmjs.com/package/express)), a Socket server based on [socket.io](http://socket.io/) framework and a plugin loader mechanism.

The core of the system (i.e. without any plugin) offers a simple connection form to the administration interface.

This interface gives access to a limited set of default features:

-  Users management
-  Permissions, roles and groups management
-  Web service management
-  A profile page

Each plugin brings zero to many additive administration pages and zero to many additive public pages.

## Authentication

OpenVeo supports the following SSO (Single Sign On) providers:

- [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol)
- [CAS](https://www.apereo.org/projects/cas)

## Compatibility

OpenVeo is tested on the following operating systems:

- Ubuntu 16.04

OpenVeo is tested on the following browsers:

- Google Chrome
- Mozilla Firefox

![Ubuntu](images/operating-systems/ubuntu.gif)

![Firefox](images/browsers/firefox.gif)
![Google Chrome](images/browsers/chrome.gif)

## Screenshots

### Login page
![Login page](images/screenshots/login.jpg)

### Back end home page
![Back end home page](images/screenshots/back-end-home.jpg)

### Back end roles management page
![Back end roles page](images/screenshots/back-end-roles.jpg)

### Back end users management page
![Back end users page](images/screenshots/back-end-users.jpg)

### Back end groups management page
![Back end groups page](images/screenshots/back-end-groups.jpg)

### Back end applications management page
![Back end applications page](images/screenshots/back-end-applications.jpg)

### Back end settings page
![Back end settings page](images/screenshots/back-end-settings.jpg)
