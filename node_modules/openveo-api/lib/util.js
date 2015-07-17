"use strict"

/**
 * Provides functions to executes JavaScript operations.
 *
 * @module util
 * @class util
 * @main util
 */

/**
 * Merges, recursively, all properties of object2 in object1.
 *
 * This will not create copies of objects.
 *
 * @method merge
 * @param {Object} object1 A JavaScript final object
 * @param {Object} object2 A second JavaScript object to merge into 
 * the first one
 * @return {Object} object1
 */
module.exports.merge = function(object1, object2){
  for(var property in object2){

    try{
      
      // Object property is an object
      // Recusively merge its properties
      if(typeof object2[property] === "object"){
        object1[property] = object1[property] || {};
        object1[property] = this.merge(object1[property], object2[property]);
      }
      else
         object1[property] = object2[property];
      
    }
    catch(e){

      // Property does not exist in object1, create it
      object1[property] = object2[property];
      
    }
    
  }
  
  return object1;
};