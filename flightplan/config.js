'use strict';

module.exports = {
  gitCoreRepository: 'git@gitlab.com:veo-labs/openveo-core.git',
  gitPublishRepository: 'git@gitlab.com:veo-labs/openveo-publish.git',
  destinationDirectory: {
    'preproduction': '/home/vagrant/livraison/',
    'production': '/home/vodalys/livraison/'
  },
  briefing: {
    destinations: {
      'preproduction': {
        host: '192.168.57.71',
        username: 'vagrant',
        agent: process.env.SSH_AUTH_SOCK,
        webRoot: '/home/vagrant/livraison',
        sudoUser: 'node'
      },
      'production': {
        host: '37.59.110.10',
        username: 'root',
        agent: process.env.SSH_AUTH_SOCK,
        webRoot: '/home/vodalys/livraison',
        sudoUser: 'node'
      }
    }
  }
};
