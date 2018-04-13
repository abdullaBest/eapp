angular.module('regidiumApp')
    .factory('config', function() {
        return {
            wsServer_local : 'ws://localhost:3000',
            wsServer_dev   : 'ws://operator.dev.regidium.com',
            wsServer       : 'wss://operator.regidium.com'
        };
    });
