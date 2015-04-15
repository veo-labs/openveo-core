# 0.0.2 / 2015-04-15
This version mainly includes corrections to be able to launch the application from outside its root directory or errors relative to Linux 
platforms.

- Correct JavaScript error when starting the OpenVeo server on Linux relative to defaultController.js
- Correct issues while launching the OpenVeo server from outside its root directory
- Remove forever module

# 0.0.1 / 2015-04-13
First version of the OpenVeo project including the following features :

- An HTTP Server with a basic front and backends
- Connection to a MongoDB database to be used by plugins
- A plugin manager to load plugins while starting the application
- Internationalization