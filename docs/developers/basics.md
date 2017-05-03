# HTTP server

Based on [Express framework](https://www.npmjs.com/package/express), OpenVeo creates an HTTP server with a list of routes.
Core routes are mounted on **/** while plugins' routes are mounted on **/PLUGIN_NAME** with PLUGIN_NAME the name of the plugin.
There are three categories of routes:

- Public routes: Routes accessible to anyone who has access to the url
- Private routes: Routes accessible only to users authenticated to the back end
- Web Service routes: Routes accessible only to users authenticated to the Web Service

# Socket server

Based on [socket.io](http://socket.io), OpenVeo creates a socket server with a list of namespaces. Core namespaces are mounted on **/NAMESPACE_NAME** while plugins' namespaces are mounted on **/PLUGIN_NAME/NAMESPACE_NAME** with PLUGIN_NAME the name ot the plugin and NAMESPACE_NAME the name of the namespace described in plugin's configuration file (see [how to write a plugin](plugins.md) for more details). There are two categories of namespaces:

- Public namespaces: Namespaces accessible to anyone
- Private namespaces: Namespaces accessible only to users authenticated to the back end

# Back end

OpenVeo core offers a back end as an AngularJS single page application accessible on **/be**. Without plugins, the back end has only limited features (users, roles, web service, profile page). And without plugins no front end is created. This is an important point. There is no generic front end, each plugin can define its own front pages on **/PLUGIN_NAME** base path.

# Web Service

OpenVeo core can create a [Web Service](../web-service.md) (using the option **-ws** when starting the process) mechanism based on oauth2 authentication.

Through the back end you can create an application with its associated list of scopes. Each new application will have an associated client id and client secret to authenticate to the Web Service. Thus you can create as many applications as you want with different scopes for each one.

# Plugins

OpenVeo core loads all plugins found in **node_modules/@openveo/** (plugins maintained by the OpenVeo team) or **node_modules/openveo-*** (community plugins) when starting the process. Each plugin can:

- Create its own back end pages
- Create public and private routes
- Create Web Service routes
- Create socket namespaces

# API

Each plugin (including the core) can expose an API to other plugins. See the [API documentation](api.md) to find out how to expose APIs.
