'use strict';

angular.module('regidiumApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.webusers', {
                url: '/',
                templateUrl: 'app/webusers/webusers.html',
                controller: 'WebusersCtrl',
                resolve: { $title: function() { return 'Посетители на сайте'; } },
                authenticate: true
            });
    });
