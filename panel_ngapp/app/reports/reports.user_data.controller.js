'use strict';

angular.module('regidiumApp')
    .controller('ReportsLeadsCtrl', function ($scope, $http, customer) {

        customer.getActiveBill().then(function (data) {
            $scope.currentBill = data.data;
            $scope.getPaymentInfo = function () {
                var dayleft = moment($scope.currentBill.end).diff(moment(), 'days');

                return {
                    isDemo: $scope.currentBill.period === 0,
                    daysleft: dayleft,
                    isFreeMode: dayleft <= 0
                };
            };
        });


        $scope.loading = true;
        $scope.customPeriod = {
            show: false,
            from: '',
            to: ''
        };

        $scope.periods = {
            'default': '',
            'today': 'За сегодня',
            'week': 'За неделю',
            'month': 'За месяц',
            'custom': 'Произвольный период'
        };
        $scope.period = 'today';
        $scope.graphData = [];


        $scope.$watch('customPeriod', function () {

            if ($scope.customPeriod.from != '' && $scope.customPeriod.to != '' && $scope.customPeriod.show) {

                $scope.loading = true;
                $http.get('/api/stats/leads?period=custom&from=' + $scope.customPeriod.from + '&to=' + $scope.customPeriod.to).success(function (data) {
                    $scope.graphData = data;
                    $scope.loading = false;
                });

            }
        }, true);


        $scope.$watch('period', function () {

            if ($scope.period == 'custom') {
                $scope.customPeriod.show = true;
            } else {
                $scope.customPeriod.show = false;
                $scope.loading = true;
                $http.get('/api/stats/leads?period=' + $scope.period).success(function (data) {
                    $scope.graphData = data;
                    $scope.loading = false;
                });

            }
        });


    });
