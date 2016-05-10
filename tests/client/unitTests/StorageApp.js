'use strict';

window.assert = chai.assert;

// StorageApp.js
describe('StorageApp', function() {
  var storage,
    provider;

  // Load module storage
  beforeEach(module('ov.storage', function(storageProvider) {
    provider = storageProvider;
  }));

  // Dependencies injections
  beforeEach(inject(function(_storage_) {
    storage = _storage_;
  }));

  it('should be able to store a key/value pair using set', function() {
    storage.set('key', 'value');
    assert.equal(storage.get('key'), 'value');
  });

  it('should be able to store a key/value pair using add', function() {
    storage.add('key2', 'value2');
    assert.equal(storage.get('key2'), 'value2');
  });

  it('should be able to remove a key/value pair', function() {
    storage.remove('key');
    storage.remove('key2');
    assert.isUndefined(storage.get('key'), 'Unexpected key');
    assert.isUndefined(storage.get('key2'), 'Unexpected key2');
  });

  it('should be able to parameter a custom prefix for the key', function() {
    provider.prefix = 'vo-';
    storage.add('key', 'value');
    assert.equal(window['localStorage']['vo-key'], 'value');
  });

  it('should be able to parameter the storage type to "localStorage"', function() {
    provider.prefix = 'ov-';
    provider.type = 'localStorage';
    storage.add('key', 'value');
    assert.equal(window['localStorage']['ov-key'], 'value');
  });

  it('should be able to parameter the storage type to "localStorage"', function() {
    provider.prefix = 'ov-';
    provider.type = 'localStorage';
    storage.add('key', 'value');
    assert.equal(window['localStorage']['ov-key'], 'value');
  });

});
