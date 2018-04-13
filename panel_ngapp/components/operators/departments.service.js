'use strict';

angular.module('regidiumApp')
    .factory('Departments', function ($resource) {
        return $resource('/api/departments/:id/:controller', {
                id: '@_id'
            },
            {
                update: { method:'PUT' }
            });
    });
