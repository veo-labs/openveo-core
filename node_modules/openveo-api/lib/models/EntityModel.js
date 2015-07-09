"use scrict"

/** 
 * @module api-models
 */

/**
 * Defines an EntityModel. An EntityModel provides basic CRUD 
 * operations on entities. You can extends this Class to deal 
 * with more advanced entities.
 *
 * All entities models must be instance of EntityModel.
 *
 * @class EntityModel
 * @constructor
 */
function EntityModel(){}

module.exports = EntityModel;

/**
 * Initializes an EntityModel.
 *
 * @method init
 * @param {EntityProvider} provider The entity provider
 */
EntityModel.prototype.init = function(provider){
  this.provider = provider;
  
  if(!this.provider)
    throw new Error("An EntityModel needs a provider");
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
EntityModel.prototype.getOne = function(id, callback){
  this.provider.getOne(id, callback);
};

/**
 * Gets a list of entities.
 *
 * @method get
 * @async
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The list of entities
 */
EntityModel.prototype.get = function(callback){
  this.provider.get(callback);
};
/**
 * Gets a list of filtered entities 
 * @param {type} callback
 * @returns {undefined}
 */
EntityModel.prototype.getByFilter = function(filter, callback){
  this.provider.getByFilter(filter, callback);
};

/**
 * Gets a paginated list of filtered entities
 * @param {type} filter
 * @param {type} count
 * @param {type} page
 * @param {type} sort
 * @param {type} callback
 * @returns {undefined}
 */
EntityModel.prototype.getPaginatedFilteredEntities = function(filter, count, page, sort, callback){
  // TODO change filter format to not directly do a DB call
  this.provider.getPaginatedFilteredEntities(filter, count, page, sort, callback);
};



/**
 * Adds a new entity.
 *
 * @method add
 * @async
 * @param {Object} data Data to store into the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The added entity 
 */
EntityModel.prototype.add = function(data, callback){
  data.id = Date.now() + '';
  this.provider.add(data, function(error){
    if(callback)
      callback(error, data);
  });
};

/**
 * Updates an entity.
 *
 * @method update
 * @async
 * @param {String} id The id of the entity to update
 * @param {Object} data Entity data
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
EntityModel.prototype.update = function(id, data, callback){
  this.provider.update(id, data, callback);
};

/**
 * Removes an entity.
 *
 * @method remove
 * @async
 * @param {String} id The id of the entity to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed items
 */
EntityModel.prototype.remove = function(id, callback){
  this.provider.remove(id, callback);
};