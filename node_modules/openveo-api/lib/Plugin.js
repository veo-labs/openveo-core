"use scrict"

/**
 * Defines a Plugin. This Class must not be used directly,
 * instead use one of the sub classes.
 * 
 * @example
 *     var openVeoAPI = require("openveo-api");
 *     function MyPlugin(){
 *     
 *       // Creates admin and front new routers
 *       this.router = express.Router();
 *       this.adminRouter = express.Router();
 *       this.webServiceRouter = express.Router();
 *       
 *       // Define routes directly here or in the configuration file
 *       
 *     }
 *     
 *     module.exports = MyPlugin;
 *     util.inherits(MyPlugin, openVeoAPI.Plugin);
 *
 * @module plugin
 */

/**
 * Each plugin which wants to be loded must inherit from this
 * object and provide the following properties. 
 *
 * @class Plugin
 * @constructor
 */
function Plugin(){}

module.exports = Plugin;

/**
 * The plugin public express router.
 *
 * @property router
 * @default null
 * @type Router
 */
Plugin.prototype.router = null;

/**
 * The plugin admin express router which will require an authentication.
 *
 * @property adminRouter
 * @default null
 * @type Router
 */
Plugin.prototype.adminRouter = null;


/**
 * The plugin web service express router which will require a web service authentication.
 *
 * @property webServiceRouter
 * @default null
 * @type Router
 */
Plugin.prototype.webServiceRouter = null;

/**
 * A function which will be called when plugin is successully loaded.
 * This won't be called by the Web Service.
 *
 * @method start
 */
Plugin.prototype.start = null;