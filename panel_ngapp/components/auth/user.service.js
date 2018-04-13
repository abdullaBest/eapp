'use strict';

angular.module('regidiumApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      update: { method:'PUT' },
      remindPassword: {
        method: 'GET',
        params: {
          controller:'remind'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
	  
  });
