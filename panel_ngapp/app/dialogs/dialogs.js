'use strict';

angular.module('regidiumApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.dialogs_dialogs', {
        url: '/journal',
        templateUrl: 'app/dialogs/journal.html',
        controller: 'DialogsCtrl',
        resolve: { $title: function() { return 'Журнал общения'; } },
        authenticate: true
      })
      .state('app.dialogs', {
        url: '/journal/:operatorid/:webuserid/:start/:end',
        templateUrl: 'app/dialogs/dialog.html',
        controller: 'DialogCtrl',
        resolve: { $title: function() { return 'История переписки'; } },
        authenticate: true
      });
  });
