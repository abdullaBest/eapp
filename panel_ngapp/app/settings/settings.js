angular.module('regidiumApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.settings_widget', {
        url: '/settings/widget',
        templateUrl: '/app/settings/settings.widget.html',
        controller: 'SettingsWidgetCtrl',
        resolve: { $title: function() { return 'Виджет'; }, $url: function () { return '/settings/widget' } },
        authenticate: true
      })
      .state('app.settings_notification', {
        url: '/settings/notification',
        templateUrl: '/app/settings/settings.notification.html',
        controller: 'SettingsNotificationCtrl',
        resolve: { $title: function() { return 'Оповещения'; }, $url: function () { return '/settings/notification' } },
        authenticate: true
      })
      .state('app.settings_chats', {
        url: '/settings',
        templateUrl: '/app/settings/settings.html',
        controller: 'SettingsChatsCtrl',
        resolve: { $title: function() { return 'Общение'; }, $url: function () { return '/settings/chats' } },
        authenticate: true
      })
      .state('app.settings_autoactions', {
        url: '/settings/autoactions',
        templateUrl: '/app/settings/settings.autoactions.html',
        controller: 'SettingsAutoactionsCtrl',
        resolve: { $title: function() { return 'Автоматические действия'; }, $url: function () { return '/settings/autoactions' } },
        authenticate: true
      })
      .state('app.settings_visitors', {
        url: '/settings/user_data',
        templateUrl: '/app/settings/settings.user_data.html',
        controller: 'SettingsVisitorsCtrl',
        resolve: { $title: function() { return 'Данные посетителя'; }, $url: function () { return '/settings/visitors' } },
        authenticate: true
      });
  });
