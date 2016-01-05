'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Left menu without role page access', function() {
  var page;

  before(function() {
    page = new MenuPage();
    page.logAs(datas.users.coreGuest);
    page.load();
  });

  after(function() {
    page.logout();
  });

  it('should not display link to roles page', function() {
    assert.isRejected(page.clickMenu('Roles'));
  });

  it('should not display link to users page', function() {
    assert.isRejected(page.clickMenu('Users'));
  });

  it('should not display link to applications page', function() {
    assert.isRejected(page.clickMenu('Applications'));
  });

});
