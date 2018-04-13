angular.module('regidiumApp')
    .controller('PayResCtrl', function ($scope, $location, $http, customer, moment, $rootScope) {
        $scope.payRes = JSON.parse(localStorage.getItem('payres'));
        $scope.billInfo = JSON.parse(localStorage.getItem('bill'));
        $scope.num = $location.search()['orderNumber'];
        $scope.summ = $location.search()['orderSumAmount'];
        $scope.url = (_.last($location.url().split('/'))).split('?')[0];

        customer.getBill($scope.billInfo.billid).then(function (data) {
            $scope.bill = data.data;
        });

        $scope.updateCustomer = function () {
            customer.updateCustomerInfo($scope.payRes.billaccount);
        };
        if ($scope.payRes) $scope.updateCustomer();


        customer.getActiveBill().then(function (data) {
            $rootScope.$broadcast('updateNavbar', data);
            $rootScope.$broadcast('updatePaymentInfo', data);
        });

    });
