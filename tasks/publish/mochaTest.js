module.exports = {
  
  // Publish plugin unit tests
  publish: {
    options: {
      reporter: "spec"
    },
    src: ["node_modules/openveo-publish/tests/server/*.js"]
  }
  
};