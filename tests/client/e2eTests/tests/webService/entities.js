'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoApi = require('@openveo/api');
var openVeoTest = require('@openveo/test');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var entities = process.require('tests/client/e2eTests/build/entities.json').entities;
var check = openVeoTest.util.check;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Web service', function() {
  var page;
  var client;
  var clientWithoutPermission;
  var helper;

  before(function() {
    var unAuthorizedApplication = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGuest.name
    );
    clientWithoutPermission = new OpenVeoClient(
      process.protractorConf.webServiceUrl,
      unAuthorizedApplication.id,
      unAuthorizedApplication.secret
    );

    page = new HomePage();
    page.logAsAdmin();
    return page.load();
  });

  // Logout when its done
  after(function() {
    return page.logout();
  });

  entities.forEach(function(entity) {

    describe(entity.name, function() {
      var defaultEntities;

      before(function() {
        var Provider = require(entity.provider);
        var Helper = require(entity.helper);
        var application = process.protractorConf.getWebServiceApplication(entity.application);

        client = new OpenVeoClient(process.protractorConf.webServiceUrl, application.id, application.secret);
        helper = new Helper(new Provider(process.api.getCoreApi().getDatabase()));

        return helper.getEntities().then(function(entities) {
          defaultEntities = entities;
        });
      });

      // Remove all entities after each test
      afterEach(function() {
        return helper.removeAllEntities(defaultEntities);
      });

      describe('put ' + entity.webServicePath, function() {

        it('should be able to add ' + entity.name, function(done) {
          var entityToAdd = helper.getAddExample();

          client.put(entity.webServicePath, [entityToAdd]).then(function(results) {
            var entity = results.entities[0];
            var isSameEntity = openVeoApi.util.isContained(helper.getValidationExample(entityToAdd), entity);

            check(function() {
              assert.equal(results.total, 1, 'Wrong total');
              assert.ok(isSameEntity, 'Unexpected entity');
            }, done);
          }).catch(function(error) {
            check(function() {
              assert.ok(false, 'Unexpected error : ' + error.message);
            }, done);
          });
        });

        it('should not be able to add ' + entity.name + ' without permission', function(done) {
          var entityToAdd = helper.getAddExample();

          clientWithoutPermission.put(entity.webServicePath, entityToAdd).then(function(results) {
            check(function() {
              assert.ok(false, 'Applications without permission should not be able to add ' + entity.name);
            }, done);
          }).catch(function(error) {
            check(function() {
              assert.isDefined(false, error.httpCode, 403, 'Expected end point to be protected');
            }, done);
          });
        });

      });

      describe('delete ' + entity.webServicePath, function() {

        it('should be able to delete ' + entity.name, function(done) {
          var entitiesToAdd = [helper.getAddExample()];

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            client.delete(entity.webServicePath + '/' + addedEntities[0].id).then(function(results) {
              check(function() {
                assert.equal(results.total, entitiesToAdd.length, 'Wrong total');
                assert.equal(results.httpCode, 200, 'Unexpected HTTP code');
              }, done, true);

              client.get(entity.webServicePath + '/' + addedEntities[0].id).then(function() {
                check(function() {
                  assert.ok(false, 'Unexpected resource ' + addedEntities[0].id);
                }, done);
              }).catch(function(error) {
                check(function() {
                  assert.equal(error.httpCode, 404, 'Expected resource to be deleted');
                }, done);
              });
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });
        });

        it('should not be able to delete ' + entity.name + ' without permission', function(done) {
          var entitiesToAdd = [helper.getAddExample()];

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            clientWithoutPermission.delete(entity.webServicePath + '/' + addedEntities[0].id).then(function(results) {
              check(function() {
                assert.ok(false, 'Applications without permission should not be able to delete ' + entity.name);
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.isDefined(error.httpCode, 403, 'Expected end point to be protected');
              }, done);
            });
          });
        });

      });

      describe('get ' + entity.webServicePath + '/:id', function() {

        it('should be able to get an entity of type "' + entity.name + '" by its id', function(done) {
          var entitiesToAdd = [helper.getAddExample()];

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            client.get(entity.webServicePath + '/' + addedEntities[0].id).then(function(results) {
              var entity = results.entity;
              check(function() {
                assert.equal(entity.id, addedEntities[0].id);
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });
        });

        it('should not return any entity of type "' + entity.name + '" if it does not exist', function(done) {
          client.get(entity.webServicePath + '/unknown').then(function(results) {
            check(function() {
              assert.ok(false, 'Unexpected results');
            }, done);
          }).catch(function(error) {
            check(function() {
              assert.equal(error.httpCode, 404, 'Expected not found');
            }, done);
          });
        });

        it('should not be able to get an entity of type "' + entity.name + '" without permission', function(done) {
          var entitiesToAdd = [helper.getAddExample()];

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            clientWithoutPermission.get(entity.webServicePath + '/' + addedEntities[0].id).then(function(results) {
              check(function() {
                assert.ok(false, 'Application without permission should not be able to get ' + entity.name);
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.isDefined(error.httpCode, 403, 'Expected end point to be protected');
              }, done);
            });
          });
        });

      });

      describe('post ' + entity.webServicePath + '/:id', function() {

        it('should be able to update ' + entity.name, function(done) {
          var entitiesToAdd = [helper.getAddExample()];
          var newEntityValues = helper.getUpdateExample();

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            client.post(entity.webServicePath + '/' + addedEntities[0].id, newEntityValues).then(function(results) {
              check(function() {
                assert.equal(results.total, 1, 'Wrong total');
                assert.equal(results.httpCode, 200, 'Unexpected HTTP code');
              }, done, true);

              client.get(entity.webServicePath + '/' + addedEntities[0].id).then(function(results) {
                var entity = results.entity;
                var isSameEntity = openVeoApi.util.isContained(helper.getValidationExample(newEntityValues), entity);

                check(function() {
                  assert.ok(isSameEntity, 'Expected entity to be updated');
                }, done);
              }).catch(function(error) {
                check(function() {
                  assert.ok(false, 'Unexpected error : ' + error.message);
                }, done);
              });
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });
        });

        it('should not be able to update ' + entity.name + ' without permission', function(done) {
          var entitiesToAdd = [helper.getAddExample()];
          var newEntityValues = helper.getUpdateExample();

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            clientWithoutPermission.post(entity.webServicePath + '/' + addedEntities[0].id,
            newEntityValues).then(function(results) {
              check(function() {
                assert.ok(false, 'Applications without permission should not be able to update groups');
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.isDefined(error.httpCode, 403, 'Expected end point to be protected');
              }, done);
            });
          });
        });

      });

      describe('get ' + entity.webServicePath, function() {

        it('should be able to get the first page of ' + entity.name, function(done) {
          var entitiesToAdd = [helper.getAddExample()];

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            client.get(entity.webServicePath).then(function(results) {
              var entities = results.entities;
              check(function() {
                assert.equal(entities.length, Math.min(entitiesToAdd.length + defaultEntities.length, 10));
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });
        });

        it('should not be able to get ' + entity.name + ' without permissions', function(done) {
          clientWithoutPermission.get(entity.webServicePath).then(function(results) {
            check(function() {
              assert.ok(false, 'Application without permission should not be able to get ' + entity.name);
            }, done);
          }).catch(function(error) {
            check(function() {
              assert.isDefined(error.httpCode, 403, 'Expected end point to be protected');
            }, done);
          });
        });

        it('should be able to search ' + entity.name + ' by text', function(done) {
          if (!helper.textSearchProperties.length)
            return done();

          var entitiesToAdd = [helper.getAddExample(), helper.getAddExample()];
          var searchQueries = [];

          entitiesToAdd.forEach(function(entityToAdd) {
            helper.textSearchProperties.forEach(function(searchProperty) {
              entityToAdd[searchProperty] = 'Test search ' + searchProperty + ' ' + entityToAdd.id;
              searchQueries.push(entityToAdd[searchProperty]);
            });
          });

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            var promises = [];

            searchQueries.forEach(function(searchQuery) {
              promises.push(client.get(entity.webServicePath + '?query=' +
                                       encodeURIComponent(searchQuery)));
            });

            Promise.all(promises).then(function(results) {
              check(function() {
                results.forEach(function(result) {
                  var entities = result.entities;
                  assert.equal(entities.length, 1, 'Wrong number of results');
                });
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });
        });

        // Sort
        describe('sort', function() {
          var addedEntities;
          var allEntities;

          beforeEach(function() {
            var entitiesToAdd = [helper.getAddExample(), helper.getAddExample()];
            var index = 0;

            entitiesToAdd.forEach(function(entityToAdd) {
              helper.sortProperties.forEach(function(sortProperty) {
                if (sortProperty.type === 'string')
                  entityToAdd[sortProperty.name] = String.fromCharCode(97 + index);
                else if (sortProperty.type === 'number')
                  entityToAdd[sortProperty.name] = index;
                else if (sortProperty.type === 'date') {
                  var anotherDay = new Date();
                  anotherDay.setDate(new Date().getDate() + index);
                  entityToAdd[sortProperty.name] = anotherDay.getTime();
                }
              });
              index++;
            });

            helper.addEntities(entitiesToAdd).then(function(entities) {
              addedEntities = entities;
              allEntities = addedEntities.concat(defaultEntities);
            });
            return page.refresh();
          });

          it('should be able to sort ' + entity.name, function(done) {
            var promises = [];

            helper.sortProperties.forEach(function(sortProperty) {
              promises.push(client.get(entity.webServicePath + '?sortBy=' + sortProperty.name).then(function(results) {
                var entities = results.entities;

                // Should be in descending order
                var allEntitiesSorted = allEntities.sort(function(a, b) {
                  return (a[sortProperty.name] < b[sortProperty.name]) ? 1 : -1;
                });

                // Test if the order is respected
                check(function() {
                  for (var i = 0; i < entities.length; i++)
                    assert.equal(allEntitiesSorted[i].id, entities[i].id);
                }, done, true);

                return client.get(entity.webServicePath + '?sortOrder=asc&sortBy=' + sortProperty.name);
              }).then(function(results) {
                var entities = results.entities;

                // Should be in ascending order
                var allEntitiesSorted = allEntities.sort(function(a, b) {
                  return (a[sortProperty.name] < b[sortProperty.name]) ? -1 : 1;
                });

                // Test if the order is respected
                check(function() {
                  for (var i = 0; i < entities.length; i++)
                    assert.equal(allEntitiesSorted[i].id, entities[i].id);
                }, done, true);
              }));
            });

            Promise.all(promises).then(function() {
              done();
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });

        });

        // Pagination
        describe('pagination', function() {
          var addedEntities;
          var allEntities;

          beforeEach(function() {
            var entitiesToAdd = [helper.getAddExample(), helper.getAddExample()];

            helper.addEntities(entitiesToAdd).then(function(entities) {
              addedEntities = entities;
              allEntities = addedEntities.concat(defaultEntities);
            });

            return page.refresh();
          });

          it('should be able to paginate results', function(done) {
            client.get(entity.webServicePath + '?page=1&limit=1').then(function(results) {
              var entities = results.entities;
              var pagination = results.pagination;
              check(function() {
                assert.equal(entities.length, 1, 'Wrong number of results');
                assert.equal(pagination.limit, 1, 'Wrong limit');
                assert.equal(pagination.page, 1, 'Wrong page');
                assert.equal(pagination.pages, allEntities.length, 'Wrong pages');
                assert.equal(pagination.size, allEntities.length, 'Wrong size');
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });

          it('should choose first page if no page is precised', function(done) {
            client.get(entity.webServicePath + '?limit=1').then(function(results) {
              var entities = results.entities;
              var pagination = results.pagination;
              check(function() {
                assert.equal(entities.length, 1, 'Wrong number of results');
                assert.equal(pagination.limit, 1, 'Wrong limit');
                assert.equal(pagination.page, 0, 'Wrong page');
                assert.equal(pagination.pages, allEntities.length, 'Wrong pages');
                assert.equal(pagination.size, allEntities.length, 'Wrong size');
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });

          it('should not return any entity if the specified page is outside the pagination', function(done) {
            var pageNumber = 100000;

            client.get(entity.webServicePath + '?limit=1&page=' + pageNumber).then(function(results) {
              var entities = results.entities;
              var pagination = results.pagination;
              check(function() {
                assert.equal(entities.length, 0, 'Wrong number of results');
                assert.equal(pagination.limit, 1, 'Wrong limit');
                assert.equal(pagination.page, pageNumber, 'Wrong page');
                assert.equal(pagination.pages, allEntities.length, 'Wrong pages');
                assert.equal(pagination.size, allEntities.length, 'Wrong size');
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });

        });

        it('should be able to exclude fields from response', function(done) {
          var entitiesToAdd = [helper.getAddExample()];
          var fieldsToExclude = [Object.keys(entitiesToAdd[0])[0]];
          var fieldsToExcludeQuery = '';

          fieldsToExclude.forEach(function(fieldToExclude) {
            if (fieldsToExcludeQuery) fieldsToExcludeQuery += '&';
            fieldsToExcludeQuery += 'exclude[]=' + fieldToExclude;
          });

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            client.get(entity.webServicePath + '?' + fieldsToExcludeQuery).then(function(results) {
              var entities = results.entities;
              check(function() {
                fieldsToExclude.forEach(function(fieldToExclude) {
                  assert.notProperty(entities[0], fieldToExclude);
                });
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });
        });

        it('should be able to include only certain fields from response', function(done) {
          var entitiesToAdd = [helper.getAddExample()];
          var fieldsToInclude = [Object.keys(entitiesToAdd[0])[0]];
          var fieldsToIncludeQuery = '';

          fieldsToInclude.forEach(function(fieldToInclude) {
            if (fieldsToIncludeQuery) fieldsToIncludeQuery += '&';
            fieldsToIncludeQuery += 'include[]=' + fieldToInclude;
          });

          helper.addEntities(entitiesToAdd).then(function(addedEntities) {
            client.get(entity.webServicePath + '?' + fieldsToIncludeQuery).then(function(results) {
              var entities = results.entities;
              check(function() {
                fieldsToInclude.forEach(function(fieldToInclude) {
                  assert.property(entities[0], fieldToInclude);
                });
                assert.equal(Object.keys(entities[0]).length, fieldsToInclude.length, 'Wrong fields');
              }, done);
            }).catch(function(error) {
              check(function() {
                assert.ok(false, 'Unexpected error : ' + error.message);
              }, done);
            });
          });
        });

      });

    });


  });

});
