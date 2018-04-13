'use strict';

angular.module('regidiumApp')
  .config(function ($stateProvider) {
    $stateProvider
        .state('app.reports_chats', {
        url: '/reports',
        templateUrl: '/app/reports/reports.html',
        controller: 'ReportsСhatsCtrl',
        resolve: { $title: function() { return 'Проведенныe чаты'; } },
        authenticate: true
      })
      .state('app.reports_autoactions', {
        url: '/reports/autoactions',
        templateUrl: '/app/reports/reports.autoactions.html',
        controller: 'ReportsAutoactionsCtrl',
        resolve: { $title: function() { return 'Автоматические действия'; } },
        authenticate: true
      })
      // .state('app.reports_dialog', {
      //   url: '/reports/dialog',
      //   templateUrl: 'app/reports/reports.dialog.html',
      //   controller: 'ReportsAutoactionsCtrl',
      //   resolve: { $title: function() { return 'Вовлечение в диалог'; } },
      //   authenticate: true
      // })
      .state('app.reports_operators', {
        url: '/reports/operators',
        templateUrl: '/app/reports/reports.operator_work.html',
        controller: 'ReportsOperatorsCtrl',
        resolve: { $title: function() { return 'Работа операторов'; } },
        authenticate: true
      })
      .state('app.reports_user_data', {
        url: '/reports/user_data',
        templateUrl: '/app/reports/reports.user_data.html',
        controller: 'ReportsLeadsCtrl',
        resolve: { $title: function() { return 'Сбор контактов'; } },
        authenticate: true
      });
  });
