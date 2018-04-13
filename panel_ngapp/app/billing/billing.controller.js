angular.module('regidiumApp')
    .run(
        ['$rootScope', 'amMoment',
            function ($rootScope, amMoment) {
                amMoment.changeLocale('ru');
            }
        ]
    )
    .controller('BillingCtrl', function($scope, customer, moment) {

        customer.getActiveBill().then(function(data) {
            $scope.bill = data;
            $scope.period = data.period;
            $scope.daysleft = moment(data.end).diff(moment(), 'days');
            $scope.hoursleft = parseInt((moment(data.end).diff(moment(), 'days', 'hours') - $scope.daysleft) * 24);
            $scope.days = ($scope.daysleft > 0)?$scope.daysleft:0;

            if ($scope.hoursleft > 0) {
                $scope.hourword = plur($scope.hoursleft, 'час', 'часа', 'часов');
            }
        });

        function plur(number, one, two, five) {
            number = Math.abs(number);
            number %= 100;
            if (number >= 5 && number <= 20) {
                return five;
            }
            number %= 10;
            if (number === 1) {
                return one;
            }
            if (number >= 2 && number <= 4) {
                return two;
            }
            return five;
        }
    });
