"use scrict"

/** 
 * @module api-providers
 */

var Database = process.requireAPI("lib/Database.js");

/**
 * Defines an EntityProvider. An EntityProvider provides basic CRUD 
 * database operations on entities. You can extends this Class to deal 
 * with more advanced entities.
 *
 * All entities providers must be instance of EntityProvider.
 *
 * @class EntityProvider
 * @constructor
 * @param {Database} database The database to interact with
 * @param {String} collection The collection name 
 */
function EntityProvider(database, collection){
  this.init(database, collection);
}

module.exports = EntityProvider;

/**
 * Initializes an EntityProvider.
 *
 * @method init
 * @param {Database} database The database to interact with
 * @param {String} collection The collection name
 */
EntityProvider.prototype.init = function(database, collection){
  this.database = database;
  this.collection = collection;
  
  if(!this.database || !this.collection)
    throw new Error("An EntityProvider needs a database and a collection");
  
  if(!(this.database instanceof Database))
    throw new Error("Database must be an of type Database");
  
};

/**
 * Gets an entity.
 *
 * @method getOne
 * @async
 * @param {String} id The entity id 
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityProvider.prototype.getOne = function(id, callback){
  this.database.get(this.collection, {id : id}, { "_id" : 0 }, 1, function(error, entities){
    if(entities && entities.length)
      callback(error, entities[0]);
    else
      callback(error);
  });
};

/**
 * Gets an entity filter by custom filter.
 *
 * @method getOne
 * @async
 * @param {Object} A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityProvider.prototype.getByFilter = function(filter, callback){
  this.database.get(this.collection, filter, null, 1, function(error, entities){
    if(entities && entities.length)
      callback(error, entities[0]);
    else
      callback(error);
  });
};

/**
 * * 
 * @param {type} options
 * 
 * sort is a collection of key to sort with the order value (-1 : desc, 1 asc)
 * example ( {"name":-1, age:"1"}  specifies a descending sort by the name field and then an ascending sort by the age field
 * 
 * filter is a collection of filter
 * example {"name": {$regex : ".*sam.*}, "age": {$lt:20}} specifies all document witch the name field contains "sam" aged less than 20
 * 
 * @param {type} filter
 * @param {type} count
 * @param {type} page
 * @param {type} sort
 * @param {type} callback
 * @returns {undefined}
 */
EntityProvider.prototype.getPaginatedFilteredEntities = function(filter, count, page, sort, callback){
  this.database.search(this.collection, filter, null, count, page, sort, callback );
}


/**
 * Gets a list of entities.
 *
 * @method get
 * @async
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The list of entities
 */
EntityProvider.prototype.get = function(callback){
  this.database.get(this.collection, null, { "_id" : 0 }, -1, callback);
};

/**
 * Adds a new entity.
 *
 * @method add
 * @async
 * @param {Object} data Data to store into the collection
 * @param {Function} callback The function to call when it's done 
 *   - **Error** The error if an error occurred, null otherwise
 */
EntityProvider.prototype.add = function(data, callback){
  this.database.insert(this.collection, data, callback || function(error){

    // TODO Log the error if any

  });
};

/**
 * Updates an entity.
 *
 * If the entity is locked, it won't be updated.
 *
 * @method update
 * @async
 * @param {String} id The id of the entity to update
 * @param {Object} data Entity data
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
EntityProvider.prototype.update = function(id, data, callback){
  this.database.update(this.collection, {id : id, locked : { $ne : true }}, data, callback || function(error){

    // TODO Log the error if any

  });
};

/**
 * Removes an entity.
 *
 * If the entity is locked, it won't be removed.
 *
 * @method remove
 * @async
 * @param {String} id The id of the entity to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed items
 */
EntityProvider.prototype.remove = function(id, callback){
  this.database.remove(this.collection, {id : {$in : id}, locked : { $ne : true }}, callback || function(error){

    // TODO Log the error if any

  });
};