'use strict';

angular.module('regidiumApp')
    .controller('ReportsAutoactionsCtrl', function($scope, $http, moment, customer) {

        $scope.chartsDisabled = false;

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
            show: true,
            from: '',
            to: ''
        };

        $scope.periods = {
            'default': '',
            'today': 'Сегодня',
            'week': 'Неделя',
            'month': 'Месяц',
            'custom': 'Произвольный период'
        };
        $scope.period = 'today';
        $scope.graphData = [];
        $scope.timeFormat = 'DD.MM.YYYY';

        $scope.$watch('customPeriod', function() {

            if ($scope.customPeriod.from != '' && $scope.customPeriod.to != '' && $scope.customPeriod.show) {

                $scope.loading = true;
                $http.get('/api/stats/activeactions?period=custom&from=' + $scope.customPeriod.from + '&to=' + $scope.customPeriod.to).success(function(data) {
                    $scope.graphData = data;
                    $scope.loading = false;
                });

            }
        }, true);

        $scope.$watch('period', function() {

            if ($scope.period == 'custom') {
                $scope.customPeriod.show = true;
            } else {
                $scope.customPeriod.show = false;
                $scope.loading = true;
                $http.get('/api/stats/activeactions?period=' + $scope.period).success(function(data) {
                    $scope.graphData = data;
                    $scope.loading = false;
                });

            }
        });
    });
