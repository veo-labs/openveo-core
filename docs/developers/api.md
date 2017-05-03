# Core server side API (Node.js)

OpenVeo core is the base of OpenVeo but it is also a plugin. Like every OpenVeo plugin it can expose APIs to other plugins. The [OpenVeo Core API](/api/server) helps you write your OpenVeo plugins.

You can use process.api to get the OpenVeo Core API:

```js
var coreApi = process.api.getCoreApi();
```

or the API of a particular plugin:

```js
var myPluginApi = process.api.getApi('my-plugin');
```

# Backend client side API (AngularJS)

OpenVeo core [backend API](/api/client-back-end) exposes an API to plugins to help you write your plugin's back end pages (AngularJS). See [back end AngularJS](back-end.md) for more information.
