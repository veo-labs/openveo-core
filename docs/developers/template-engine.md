OpenVeo uses [Mustache](https://github.com/janl/mustache.js) as the template engine. You have to declare a directory containing your template files before using a mustache template file. You can do it in conf.js file (see [plugin's documentation](https://github.com/veo-labs/openveo-plugin-generator) for more information about conf.js file).

Then you can call the template using [render express function](http://expressjs.com/en/4x/api.html#app.render) in your controller's actions.
