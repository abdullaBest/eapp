'use strict';

angular.module('regidiumApp')
  .controller('SidebarCtrl', function ($scope, $location, chats, $http, operators) {
    var path = [];
    var menu = [];

    operators.getOperator().then(function (data) {
       $scope.isadmin = data.isadmin;
        $scope.visibleItems = [
            {
                title: 'Посетители',
                url: '/',
                notify: 0,
                itemClass: 'ico __visitors'
            },

            {
                title: 'Диалоги',
                url: '/dialogs',
                notify: chats.unreaded,
                itemClass: 'ico __chats'
            },
            {
                title: 'Отчеты',
                url: '/reports',
                notify: 0,
                itemClass: 'ico __reports'

            },
            {
                title: 'Операторы',
                url: '/operators',
                notify: 0,
                itemClass: 'ico __operators'
            },
            {
                title: 'Журнал',
                url: '/journal',
                notify: 0,
                itemClass: 'ico __dialogs'
            },
            {
                title: 'Настройка',
                url: $scope.isadmin?'/settings/widget':'/settings/notification',
                notify: 0,
                itemClass: 'ico __settings'
            }
        ];
    });



      $scope.isActive = function(route) {
       path = $location.path().split('/');
       menu = route.split('/');
       return menu[1] === path[1];
      };

  });
