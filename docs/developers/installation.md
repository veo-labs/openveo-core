# Clone project from git

    cd /WORKSPACE_PATH/
    git clone git@github.com:veo-labs/openveo-core.git

# Install project's dependencies

    cd /WORKSPACE_PATH/openveo-core
    npm install

# Create NPM links for openveo-api and openveo-test

In development environment OpenVeo plugins will be installed using [NPM links](https://docs.npmjs.com/cli/link) and will require @openveo/api and @openveo/test.

    # Create a link for @openveo/api
    cd /WORKSPACE_PATH/openveo-core/node_modules/@openveo/api
    npm link

    # Create a link for @openveo/test
    cd /WORKSPACE_PATH/openveo-core/node_modules/@openveo/test
    npm link
