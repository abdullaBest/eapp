'use strict';

angular.module('regidiumApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl',
        resolve: { $title: function() { return 'Вход в панель онлайн консультанта Регидиум'; } }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl',
        resolve: { $title: function() { return 'Регистрация нового аккаунта Регидиум'; } }
      })
      .state('remind', {
        url: '/remind',
        templateUrl: 'app/account/remind/remind.html',
        controller: 'RemindCtrl',
        resolve: { $title: function() { return ' Восстановление доступа к панеле Регидиум'; } }
      });
  });
