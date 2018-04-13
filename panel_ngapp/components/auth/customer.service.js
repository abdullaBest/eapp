'use strict';

angular.module('regidiumApp')
    .factory('Customer', function ($resource) {
        return $resource('/api/customer/:id/:controller', {
                id: '@_id'
            },
            {});
    });
