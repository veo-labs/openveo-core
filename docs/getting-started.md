# Installation

    npm install @openveo/core

**Nb :** You will be prompted for some configuration. Don't worry if you made an error, you can edit configuration anytime using [advanced configuration](advanced-configuration.md).

# Create a back end user

OpenVeo CMS requires a super admin to access the back end. This user has full access to all the features of the back end and can't be removed. You can create it using the following command :

    node install.js

# Launch the application

OpenVeo is now installed. Launch it :

    node server.js

# Log to the back end

You can now access the back end at `http://localhost:PORT/be/login` (replace *PORT* by the port specified in **~/.openveo/core/serverConf.json**) using the super admin email and password.
