"use strict"

window.assert = chai.assert;

describe("StorageApp", function(){
  var storage, provider;
  
  beforeEach(module("ov.storage", function(storageProvider){
    provider = storageProvider;
  }));
  
  beforeEach(inject(function(_storage_){
    storage = _storage_;
  }));
  
  it("Should be able to store a key/value pair using set", function(){
    storage.set("key", "value");
    assert.equal(storage.get("key"), "value");
  });

  it("Should be able to store a key/value pair using add", function(){
    storage.add("key2", "value2");
    assert.equal(storage.get("key2"), "value2");
  });  
  
  it("Should be able to remove a key/value pair", function(){
    storage.remove("key");
    storage.remove("key2");
    assert.isUndefined(storage.get("key"));
    assert.isUndefined(storage.get("key2"));
  });
  
  it("Should be able to parameter a custom prefix for the key", function(){
    provider.prefix = "vo-";
    storage.add("key", "value");
    assert.equal(window["sessionStorage"]["vo-key"], "value");
    storage.remove("key");
  });  
  
  it("Should be able to parameter the storage type to \"localStorage\"", function(){
    provider.prefix = "ov-";
    provider.type = "localStorage";
    storage.add("key", "value");
    assert.equal(window["localStorage"]["ov-key"], "value");
    storage.remove("key");
  });  
  
  it("Should be able to parameter the storage type to \"sessionStorage\"", function(){
    provider.prefix = "ov-";
    provider.type = "sessionStorage";
    storage.add("key", "value");
    assert.equal(window["sessionStorage"]["ov-key"], "value");
    storage.remove("key");
  });    
  
});