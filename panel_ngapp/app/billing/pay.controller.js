angular.module('regidiumApp')
    .controller('PayCtrl', function ($scope, customer, Tarif, $stateParams, $location, $http, billData) {

        var elems = $('body > div.modal');
        $scope.currentModalWindow = null;

        if (elems.length) {
            for (var index = 0; index < elems.length; index++) {
                if ($(elems[index]).attr('id') == 'payerInfo')
                    $(elems[index]).remove();
            }
        }
        $scope.currentModalWindow = angular.element('#payerInfo');
        $scope.currentModalWindow.appendTo('body');

        $scope.bill = {};
        $scope.currentCustomer = null;
        $scope.billaccount = null;
        $scope.wordMonth = 'месяц';
        $scope.wordOperator = 'оператора';
        $scope.placeHolderName = '';
        $scope.placeHolderAdress = '';



        $scope.yc = {
            'FCC': 'AC',
            'FYM': 'PC',
            'FSBOL': 'SB',
            'FABOL': 'AB',
            'UCC': 'AC'
        };


        $scope.payType = 'FCC';

        var accountFormFieldsList = {
            'U': ['Название организации', 'ИНН', 'Юр. адрес'],
            'F': ['ФИО', false, 'Адрес регистрации']
        };

        $scope.accountFormFields = accountFormFieldsList.U;


        customer.getInfo().then(function (data) {
            $scope.billaccount = data.billaccount;
        });

        customer.getBill($stateParams.billid).then(function (response) {
            var period = parseInt(response.data.period);
            if (response.data) {
                $scope.bill = response.data;
                switch (period) {
                    case 1:
                        $scope.bill.months = 1;
                        break;
                    case 2:
                        $scope.bill.months = 3;
                        break;
                    case 3:
                        $scope.bill.months = 6;
                        break;
                    case 4:
                        $scope.bill.months = 12;
                        break;
                }
                $scope.wordMonth = plur($scope.bill.months, 'месяц', 'месяца', 'месяцов');
                $scope.wordOperator = plur($scope.bill.operators, 'оператор', 'оператора', 'операторов');
            }
        });

        $scope.openModal = function () {
            $($scope.currentModalWindow).modal('show');
        };

        $scope.closeModal = function () {
            $($scope.currentModalWindow).modal('hide').remove('.modal-backdrop');
        };

        $scope.openConfirmModal = function (type) {
            $("#warningModal").appendTo('body').modal('show');
            $scope.pay__type = type;
            switch (type) {
                case "FCC":
                    $scope.payMethod = "Банковская карта";
                    break;
                case "WAR":
                    $scope.payMethod = "Яндекс.Деньги";
                    break;
                case "QUE":
                    $scope.payMethod = "Сбербанк.Онлайн";
                    break;
                case "FABOL":
                    $scope.payMethod = "Альфа-клик";
                    break;
                case "FINV":
                    $scope.payMethod = "Банковская квитанция";
                    break;
                case "UINV":
                    $scope.payMethod = "Распечатать счет";
                    break;
                case "UCC":
                    $scope.payMethod = "Банковская карта";
                    break;
            }
        };

        $scope.closeConfirmModal = function () {
            $("#warningModal").modal('hide').remove('.modal-backdrop');
        };

        $scope.pay = function (type) {
            console.log(type);
            $scope.payType = type;
            $scope.openModal();

            if (type === 'UINV' || type === 'UCC') {
                $scope.placeHolderName = 'Название компании';
                $scope.placeHolderAdress = 'Юридический адресс';
            } else {
                $scope.placeHolderName = 'ФИО';
                $scope.placeHolderAdress = 'Адресс';
            }


                $scope.accountFormFields = accountFormFieldsList[type[0]];
        };

        $scope.saveBillAccount = function () {
            $scope.payres = {
                billid: $scope.bill._id,
                paytype: $scope.payType,
                billnumb: $scope.bill.numb,
                accountFormFields: $scope.accountFormFields,
                billaccount: $scope.billaccount,
                operators: $scope.bill.operators
            };
            localStorage.setItem('payres', JSON.stringify($scope.payres));

            customer.updateCustomerBillAcc($scope.billaccount).success(function (data) {
                console.log($scope.payType);
                if ($scope.payType === 'FINV' || $scope.payType === 'UINV') {
                    switch ($scope.payType) {
                        case 'UINV':
                            $location.path('/billing/pay/' + $scope.bill.numb + '/invoice/entity');
                            break;
                        case 'FINV':
                            $location.path('/billing/pay/' + $scope.bill.numb + '/invoice/individual');
                    }
                } else {
                    $('#kassa_payment').submit();
                }
                $scope.closeModal();
            });
        };

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
