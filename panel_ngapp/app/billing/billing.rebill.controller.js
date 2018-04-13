angular.module('regidiumApp')
    .factory('billData', function () {
        return {
            bill: {}
        }
    })
    .controller('BillingRebillCtrl', function ($scope, customer, $location, moment, $http, operators, billData) {

        var money = 0;

        $scope.endCurrent = Date.now();
        $scope.operatorPrice = 350;
        $scope.promo = null;
        $scope.rebill = false;
        $scope.addedOperators = operators.operators;

        $scope.operators = 0;
        $scope.summ = 0;
        $scope.month = 0;
        $scope.discount = 1;
        $scope.discountSumm = 0;
        $scope.additionMoney = 0;
        $scope.finalCurrency = 0;
        $scope.autoSwitch = 'true';
        $scope.period = '1';
        $scope.oldSumm = 0;
        $scope.promoDiscount = 0;

        $scope.$watch('discount', function () {
            $scope.discountPerc = Math.round((1 - $scope.discount) * 100);
        });

        $scope.periodNames = ['', '1 месяц', '3 месяца (скидка 15%)', '6 месяцев (скидка 17%)', '12 месяцев (скидка 20%)'];


        customer.getActiveBill().then(function (data) {
            $scope.currentBill = data;
            $scope.operators = $scope.currentBill.operators || $scope.addedOperators.length;
            if ($scope.currentBill.period > 0) {
                $scope.endCurrent = Date.parse($scope.currentBill.end);
                $scope.endDate = moment($scope.endCurrent).add($scope.month, 'months').hours(23).minutes(59).seconds(59).milliseconds(999).valueOf();
            }
        });

        $scope.$watch('month', function () {
            $scope.endDate = moment($scope.endCurrent).add($scope.month, 'months').hours(23).minutes(59).seconds(59).milliseconds(999).valueOf();
        });

        $scope.$watch('promocode', function () {
            $http.get('/api/payments/promo?code=' + $scope.promocode).success(function (data) {
                $scope.promo = data;
            }).error(function () {
                $scope.promo = null;
            })
        });

        $scope.$watchGroup(['period', 'rebill', 'promo', 'operators', 'autoSwitch'], function (newValue, oldValue, scope) {

            if ($scope.autoSwitch === 'true') {

                $scope.periods = {
                    '0': '',
                    '1': '1 месяц',
                    '2': '3 месяца (скидка 15%)',
                    '3': '6 месяцев (скидка 17%)',
                    '4': '12 месяцев (скидка 20%)'
                };

                switch (parseInt($scope.period)) {
                    case '0':
                        break;
                    case 1:
                        $scope.month = 1;
                        $scope.discount = 1;
                        $scope.discountSumm = 0;
                        break;
                    case 2:
                        $scope.month = 3;
                        $scope.discount = 0.85;
                        break;
                    case 3:
                        $scope.month = 6;
                        $scope.discount = 0.83;
                        break;
                    case 4:
                        $scope.month = 12;
                        $scope.discount = 0.8;
                        break;
                }

                $scope.summ = Math.ceil(($scope.operatorPrice * $scope.month * $scope.discount * $scope.operators) - money);

                if ($scope.promo) {
                    $scope.oldSumm = $scope.summ;
                    switch ($scope.promo.type) {
                        case 1:
                            $scope.summ = Math.ceil($scope.summ * (1 - $scope.promo.value / 100));
                            $scope.promoDiscount = $scope.oldSumm - $scope.summ;
                            break;
                        case 2:
                            $scope.summ = $scope.summ - $scope.promo.value;
                            $scope.promoDiscount = $scope.oldSumm - $scope.summ;
                            break;
                    }
                }

                if ($scope.summ < 0) $scope.summ = 0;

                $scope.finalCurrency = $scope.summ;
                if ($scope.discount !== 1) {
                    $scope.discountSumm = Math.ceil(($scope.operatorPrice * $scope.month * $scope.operators)) - $scope.finalCurrency;
                } else {
                    $scope.discountSumm = 0;
                }

            } else {

                if ($scope.currentBill === undefined) {
                    return;
                }
                $scope.periods = {};
                $scope.periods[parseInt($scope.currentBill.period)] = $scope.periodNames[parseInt($scope.currentBill.period)];
                $scope.period = $scope.currentBill.period;

                var period = $scope.currentBill.period;

                switch (parseInt(period)) {
                    case 1:
                        $scope.months = 1;
                        $scope.discount = 1;
                        break;
                    case 2:
                        $scope.months = 3;
                        $scope.discount = 0.85;
                        break;
                    case 3:
                        $scope.months = 6;
                        $scope.discount = 0.83;
                        break;
                    case 4:
                        $scope.months = 12;
                        $scope.discount = 0.8;
                        break;
                }

                var needOperators = ($scope.currentBill.price * $scope.months * $scope.discount * ($scope.currentBill.operators + ($scope.operators - $scope.currentBill.operators)));
                var lastOperators = ($scope.currentBill.price * $scope.months * $scope.discount * $scope.currentBill.operators);
                $scope.additionMoney = Math.floor((needOperators - lastOperators) * ((Date.parse($scope.currentBill.end) - Date.now()) / (Date.parse($scope.currentBill.end) - Date.parse($scope.currentBill.start))));

                if ($scope.additionMoney < 0) $scope.additionMoney = 0;


                if ($scope.promo) {
                    $scope.oldSumm = $scope.additionMoney;
                    switch ($scope.promo.type) {
                        case 1:
                            $scope.summ = Math.ceil($scope.summ * (1 - $scope.promo.value / 100));
                            $scope.promoDiscount = $scope.oldSumm - $scope.summ;
                            break;
                        case 2:
                            $scope.summ = $scope.summ - $scope.promo.value;
                            $scope.promoDiscount = $scope.oldSumm - $scope.summ;
                            break;
                    }
                }

                if ($scope.discount !== 1) {
                    $scope.discountSumm = Math.ceil(($scope.operatorPrice * $scope.month * ($scope.operators - $scope.currentBill.operators))) - $scope.finalCurrency;
                } else {
                    $scope.discountSumm = 0;
                }

                $scope.finalCurrency = $scope.additionMoney - $scope.promoDiscount;

            }
        });

        $scope.pay = function () {
            var billInfo = {};
            if ($scope.finalCurrency === 0 && !$scope.promo) return false;
            operators.getOperator().then(function (user) {
                if ($scope.autoSwitch === 'true') {
                    customer.createBill(user.name, $scope.month, $scope.period, $scope.operators, $scope.rebill, $scope.promo, $scope.billType, $scope.id).success(function (data) {

                        billInfo = {
                            billid: data.numb,
                            billsum: data.summ
                        };
                        localStorage.setItem('bill', JSON.stringify(billInfo));
                        if (data.success) {
                            $location.path('/billing/paysuccess');
                        } else {
                            $location.path('/billing/pay/' + data.numb);
                        }
                    });
                } else {
                    if ($scope.additionMoney === 0) return false;
                    var newoperators = $scope.operators - $scope.currentBill.operators;
                    billInfo = {
                        billid: $scope.currentBill.numb,
                        billsum: $scope.finalCurrency
                    };
                    localStorage.setItem('bill', JSON.stringify(billInfo));
                    $scope.billType = 'extend';
                    $scope.id = $scope.currentBill._id;
                    $scope.rebill = true;
                    customer.createBill(user.name, $scope.month, $scope.period, newoperators, $scope.rebill, $scope.promo, $scope.billType, $scope.id).success(function (data) {
                        if (data.success) {
                            $location.path('/billing/paysuccess');
                        } else {
                            $location.path('/billing/pay/' + data.numb);
                        }
                    });
                }

            });
        };

    });
