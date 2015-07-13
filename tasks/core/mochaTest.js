module.exports = {
  
  // Core unit tests
  core: {
    options: {
      reporter: "spec"
    },
    src: ["tests/server/*.js"]
  },
  
  // API unit tests
  api: {
    options: {
      reporter: "spec"
    },
    src: ["node_modules/openveo-api/tests/server/*.js"]
  }
  
};