angular.module('regidiumApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.operators_list', {
                url: '/operators',
                templateUrl: 'app/operators/operators.html',
                controller: 'OperatorsCtrl',
                resolve: { $title: function() { return 'Операторы'; } },
                authenticate: true
            })
            .state('app.operators_departments', {
                url: '/departments',
                templateUrl: 'app/operators/departments.html',
                controller: 'DepartmentsCtrl',
                resolve: { $title: function() { return 'Группы'; } },
                authenticate: true
            });
    });
