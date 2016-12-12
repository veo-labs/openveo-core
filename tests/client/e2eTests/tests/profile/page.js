'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var ProfilePage = process.require('tests/client/e2eTests/pages/ProfilePage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Profile page', function() {
  var page;

  // Prepare page
  before(function() {
    page = new ProfilePage();
    page.logAs(datas.users.coreAdmin);
    return page.load();
  });

  // Logout after tests
  after(function() {
    return page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    return page.refresh();
  });

  it('should display page title', function() {
    return assert.eventually.ok(page.pageTitleElement.isPresent());
  });

  it('should display page description', function() {
    return assert.eventually.ok(page.pageDescriptionElement.isPresent());
  });

  it('should display user name, email and roles', function() {
    assert.eventually.equal(page.userNameElement.getText(), page.getUser().name);
    assert.eventually.equal(page.userEmailElement.getText(), page.getUser().email);

    page.userRolesElement.getText().then(function(text) {
      var roles = text.split(', ');
      assert.includeMembers(roles, [datas.roles.coreAdmin.name, datas.roles.coreGuest.name]);
    });

    return assert.eventually.ok(page.editUserElement.isPresent());
  });

  it('should display form to change password', function() {
    assert.eventually.ok(page.passwordElement.isPresent(), 'Password field is not present');
    assert.eventually.ok(page.confirmPasswordElement.isPresent(), 'Password confirmation field is not present');
    assert.eventually.ok(page.submitPasswordElement.isPresent(), 'Submit button is not present');
    return assert.eventually.ok(page.cancelPasswordElement.isPresent(), 'Cancel button is not present');
  });

  it('should be able to change user name', function() {
    var newAdminName = 'test changing user name';
    page.setNameAndSave(newAdminName);
    assert.eventually.equal(page.userNameElement.getText(), newAdminName);
    return page.setNameAndSave(page.getUser().name);
  });

  it('should not be able to save user without a name', function() {
    return assert.isRejected(page.setNameAndSave());
  });

  it('should be able to cancel user edition', function() {
    page.activateEdition();
    page.setName('test cancelling edition');
    page.cancelEdition();
    return assert.eventually.equal(page.userNameElement.getText(), page.getUser().name);
  });

  it('should be able to change user password', function() {
    var newPassword = 'test-changing-password';
    var oldPassword = page.getUser().password;

    page.changePassword(newPassword);
    page.logAs({
      name: page.getUser().name,
      email: page.getUser().email,
      password: newPassword
    });
    page.load();
    return page.changePassword(oldPassword);
  });

  it('should not be able to save password if the two fields are not equal', function() {
    page.setPassword('test-password-confirmation');
    page.setConfirmPassword('test-password-confirmation-different');
    return assert.eventually.notOk(page.submitPasswordElement.isEnabled());
  });

  it('should clear password form when hitting cancel', function() {
    page.setPassword('test-cancelling-password-edition');
    page.setConfirmPassword('test-cancelling-password-edition');
    page.cancelPasswordElement.click();
    assert.eventually.equal(page.passwordElement.getText(), '');
    return assert.eventually.equal(page.confirmPasswordElement.getText(), '');
  });

  it('should not display formular to change password if locked', function() {
    page.logAsAdmin();
    page.load();
    assert.eventually.notOk(page.passwordElement.isDisplayed(), 'Password field is present');
    assert.eventually.notOk(page.confirmPasswordElement.isDisplayed(), 'Password confirmation field is present');
    assert.eventually.notOk(page.submitPasswordElement.isDisplayed(), 'Submit button is present');
    return assert.eventually.notOk(page.cancelPasswordElement.isDisplayed(), 'Cancel button is present');
  });

});
