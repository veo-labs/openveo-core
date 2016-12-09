# HTTP server

Based on [Express framework](https://www.npmjs.com/package/express), OpenVeo creates an HTTP server with a list of routes.
Routes are mounted on **/** while plugins routes are mounted on **/PLUGIN_NAME** with PLUGIN_NAME the name of the plugin.
There are three categories of routes :

- Public routes : Routes accessible to anyone who has access to the url
- Private routes : Routes accessible only to users authenticated to the back end
- Web Service routes : Routes accessible only to users authenticated to the Web Service

# Back end

OpenVeo core offers a back end as an AngularJS single page application accessible on **/be**. Without plugins, the back end has only limited features (users, roles, web service, profile page). And without plugins no front end is created. This is an important point. There is no generic front end, each plugin can define its own front pages on **/PLUGIN_NAME** base path.

# Web Service

OpenVeo core can create a [Web Service](../web-service.md) (using the option **-ws** when starting the server) mechanism based on oauth2 authentication.

Through the back end you can create a new Web Service application with its associated list of scopes. Each new Web Service application will have an associated client id and client secret to authenticate to the Web Service. Thus you can create as many applications as you want with different scopes for each one.

# Plugins

OpenVeo core loads all plugins found in **node_modules/@openveo/** when starting the server. Each plugin can :

- Create its own back end pages
- Create public and private routes
- Create Web Service routes