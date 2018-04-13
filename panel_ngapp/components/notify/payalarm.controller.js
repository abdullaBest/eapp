'use strict';

angular.module('regidiumApp')
    .controller('PayAlarmCtrl', function($scope, $location, $http, customer, $element, moment) {

        $scope.$on('updatePaymentInfo', function (data) {
            $scope.getPaymentInfo();
        });

        var DAYS_BEFORE_END = 3;

        $scope.payAlarm = {
            show: false,
            text: '',
            notifyFloat: false
        };
        $scope.currentBill = null;

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

        $scope.getPaymentInfo = function () {
            customer.getActiveBill().success(function(data) {
                $scope.currentBill = data;
                //период зкончился
                var daysleft = moment($scope.currentBill.end).diff(moment(), 'days');

                if (daysleft <= 0) {
                    $scope.payAlarm.show = true;
                    angular.element('.page__content').addClass('__with-info');
                    if ($scope.currentBill.period === 0) {
                        $scope.payAlarm.text = 'Закончился демо-период. У вас отключен ряд важных функций, подключите функции и увеличьте количество диалогов.';
                    } else {
                        $scope.payAlarm.text = 'Закончился оплаченный период. У вас отключен ряд важных функций, подключите функции и увеличьте количество диалогов.';
                    }
                } else if (daysleft <= DAYS_BEFORE_END) {
                    $scope.payAlarm.show = true;
                    angular.element('.page__content').addClass('__with-info');
                    if ($scope.currentBill.period === 0) {
                        $scope.payAlarm.text = 'Через ' + daysleft + ' ' + plur(daysleft, 'день', 'дня', 'дней') + ' закончится демо-период. Отключатся важные функции. Продлите работу сервиса.';
                    } else {
                        $scope.payAlarm.text = 'Через ' + daysleft + ' ' + plur(daysleft, 'день', 'дня', 'дней') + ' закончится оплаченный период. Отключатся важные функции. Продлите работу сервиса';
                    }
                } else {
                    if(angular.element('.page__content').hasClass('__with-info')) angular.element('.page__content').removeClass('__with-info');
                    $scope.payAlarm = {
                        show: false,
                        text: '',
                        notifyFloat: false
                    };
                }
            });
        };

        $scope.getPaymentInfo();
        // $scope.checkPayStatus();

        $(document).on('scroll', function() {
            var e = $(this);
            $scope.$apply(function() {
                $scope.payAlarm.notifyFloat = e.scrollTop() > 1;
            });

        });

    });
