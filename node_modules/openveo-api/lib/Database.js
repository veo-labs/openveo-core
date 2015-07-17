"use strict"

/**
 * Defines a Database. This Class must not be used directly,
 * instead use one of the sub classes.
 * 
 * @example
 *     var openVeoAPI = require("openveo-api");
 *     function MyDatabase(databaseConf){
 *       Database.call(this, databaseConf);
 *     }
 *     
 *     module.exports = MyDatabase;
 *     util.inherits(MyDatabase, openVeoAPI.Database);
 *
 * @module database
 */

/**
 * Saves database configuration.
 *
 * @example
 *     var databaseConf = {
 *       "type" : "mongodb",
 *       "host" : "localhost",
 *       "port" : 27017,
 *       "database" : "openveo",
 *       "username" : "openveo",
 *       "password" : "***"
 *     };
 *
 * @class Database
 * @constructor
 * @param {Object} databaseConf A database configuration object
 */
function Database(databaseConf){
  this.conf = databaseConf;
  
  if(!this.conf)
    throw new Error("No database configuration");
}

module.exports = Database;

/**
 * Gets an instance of a Database using the given 
 * database configuration.
 *
 * @example
 *     var databaseConf = {
 *       "type" : "mongodb",
 *       "host" : "localhost",
 *       "port" : 27017,
 *       "database" : "openveo",
 *       "username" : "openveo",
 *       "password" : "***"
 *     };
 *
 * @method getDatabase
 * @param {Object} databaseConf A database configuration object
 * @return {Database} A Database instance
 */
Database.getDatabase = function(databaseConf){
  
  if(databaseConf && databaseConf.type){
    
    switch(databaseConf.type){
        
      case "mongodb":
        var MongoDatabase = process.requireAPI("lib/database/mongodb/MongoDatabase.js");
        return new MongoDatabase(databaseConf);
      break;
        
      default: 
        throw new Error("Unknown database type");
    }
    
  }
  
};

/**
 * Establishes connection to the database.
 *
 * @method connect
 * @async
 * @param {Function} callback The function to call when connection 
 * to the database is done
 *   - **Error** The error if an error occurred, null otherwise 
 */
Database.prototype.connect = function(callback){throw new Error("connect method not implemented for this database");}

/**
 * Inserts a document into a collection.
 *
 * @method insert
 * @async
 * @param {String} collection The collection to work on
 * @param {Objet} data The document to insert into the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise 
 */
Database.prototype.insert = function(collection, data, callback){throw new Error("insert method not implemented for this database");}

/**
 * Removes a document from a collection.
 *
 * @method remove
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria The remove criteria
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.remove = function(collection, criteria, callback){throw new Error("remove method not implemented for this database");}

/**
 * Updates a document.
 *
 * @method update
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria The update criteria
 * @param {Object} data Data to update
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise 
 */
Database.prototype.update = function(collection, criteria, data, callback){throw new Error("update method not implemented for this database");}

/**
 * Gets a list of documents.
 *
 * @method get
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria An object of criterias
 * @param {Object} projection Fields to return using 
 * projection operators
 * @param {Number} limit An optional limit number of items to retrieve
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise 
 *   - **Array** The retrieved data
 */
Database.prototype.get = function(collection, criteria, projection, limit, callback){throw new Error("get method not implemented for this database");}