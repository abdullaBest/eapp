'use strict';

Object.values = function (obj) {
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
};

angular.module('regidiumApp', [
        'ngCookies',
        'ngAnimate',
        'ngResource',
        'ngSanitize',
        'ui.router',
        'angular-click-outside',
        'utils.autofocus',
        'ngClipboard',
        'ui.router.title',
        'angularMoment',
        'angular-loading-bar',
        'ui.bootstrap',
        'yaMap',
        'ui.bootstrap-slider',
        'angular-duration-format',
        'monospaced.elastic',
        'angularFileUpload',
        'LocalStorageModule'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, localStorageServiceProvider) {

        localStorageServiceProvider.setPrefix('regidium');

        $stateProvider
            .state('app', {
                url: '',
                templateUrl: 'app/layout.html'
            });

        $urlRouterProvider.otherwise('/');
        
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        
        $httpProvider.interceptors.push('authInterceptor');

    })
    .config(['$httpProvider', function ($httpProvider) {
        //$httpProvider.interceptors.push('noCacheInterceptor');
        $httpProvider.defaults.headers.common['Pragma'] = 'no-cache';
    }])
    // .factory('noCacheInterceptor', function () {
    //         return {
    //             request: function (config) {
    //                 if(config.method === 'GET'){
    //                     var separator = config.url.indexOf('?') === -1 ? '?' : '&';
    //                     config.url = config.url+separator+'noCache=' + new Date().getTime();
    //                 }
    //                 return config;
    //            }
    //        };
    // })
    .factory('authInterceptor', function ($rootScope, $q, $cookies, $location) {
        return {
            
            // Add authorization token to headers
            request: function (config) {
                // если это приложени на electron
                if (window.IPC!==undefined){
                    if (config.url.indexOf('/api/')===0){
                        config.url = 'https://my.regidium.com'+config.url;
                    }else{
                        if (config.url[0]==='/'){
                            config.url.slice(1);
                        }   
                        config.url =  __dirname + '/'+config.url;
                    }
                }
                config.headers = config.headers || {};
//                if ($cookies.get('token')) {
//                    config.headers.Authorization = 'Bearer ' + $cookies.get('token');
//                }
                var token = localStorage.getItem('regidium-token');

                if (token!==null && token!=='') {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },

            // Intercept 401s and redirect you to login
           /* responseError: function (response) {
                if (response.status === 401) {
                    $location.path('/login');
                    if (!response.data.message) {
                        location.reload(); // reinitialize app
                    }
                    // remove any stale tokens
                    $cookies.remove('token');
                    return $q.reject(response);
                } else {
                    return $q.reject(response);
                }
            }
            */
        };
    })
    .run(function ($rootScope, Net, Auth ) {
      
        Net.init();
        Auth.init();
/*
        // Redirect to login if route requires auth and you're not logged in
        $rootScope.$on('$stateChangeStart', function (event, next) {
            Auth.isLoggedInAsync(function (loggedIn) {
                if (next.authenticate && !loggedIn) {
                    $location.path('/login');
                }
            });

            //cfpLoadingBar.start();
        });
        
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //cfpLoadingBar.complete();
        });
*/
    });