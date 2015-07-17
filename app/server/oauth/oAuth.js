"use strict"

/** 
 * @module core-oauth
 */

// Module dependencies
var oAuthLib = require("oauth20-provider");
var client = process.require("app/server/oauth/client.js");
var accessToken = process.require("app/server/oauth/accessToken.js");

var oAuth = new oAuthLib();
oAuth.model.client.getId = client.getId;
oAuth.model.client.fetchById = client.fetchById;
oAuth.model.client.checkSecret = client.checkSecret;
oAuth.model.client.checkGrantType = client.checkGrantType;
oAuth.model.client.checkScope = client.checkScope;

oAuth.model.accessToken.create = accessToken.create;
oAuth.model.accessToken.fetchByToken = accessToken.fetchByToken;
oAuth.model.accessToken.checkTTL = accessToken.checkTTL;
oAuth.model.accessToken.ttl = accessToken.ttl;

module.exports = oAuth;