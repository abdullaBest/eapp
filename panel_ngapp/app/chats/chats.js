'use strict';

angular.module('regidiumApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.chats', {
        url: '/dialogs',
        templateUrl: 'app/chats/dialogs.html',
        controller: 'ChatsCtrl',
        resolve: { $title: function() { return 'Активные диалоги'; } },
        authenticate: true
      });
  });
