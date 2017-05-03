# Download OpenVeo

Actually OpenVeo can be downloaded directly from [github](https://github.com/veo-labs/openveo-core):

- Select the tag you want to download (**from version >=4.0.0**)
- Then download the associated archive
- Deploy the archive on your server

# Installation

From OpenVeo root directory:

    npm install --production

**Nb :** You will be prompted for some configuration. Don't worry if you made an error, you can edit configuration anytime using [advanced configuration](advanced-configuration.md).

# Launch the application

OpenVeo is now installed. Launch it:

    node server.js

# Verify that OpenVeo is working

OpenVeo does not have any public pages. Consequently navigating to `http://localhost:PORT` will lead you to a 404 error page (it's a good sign if it does). To check that OpenVeo is working, try to log to the back end.

# Log to the back end

You can now access the back end at `http://localhost:PORT/be/login` (replace *PORT* by the port specified in **~/.openveo/core/serverConf.json**) using the super admin email and password.
