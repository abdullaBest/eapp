angular.module('regidiumApp')
    .controller('PayInvoiceCtrl', function($scope, customer, $stateParams, moment) {

        $scope.bill = {};
        $scope.date = moment().format('LL');
        $scope.type = $stateParams.type;
        $scope.billaccount = {};

        // if ($stateParams.type === 'entity') {
            customer.getInfo().then(function(data) {
                $scope.billaccount = data.billaccount;
            });
        // }
        

        customer.getBill($stateParams.billid).success(function(data) {
            if (data) {
                $scope.bill = data;
            }
            $scope.date = moment(data.dtime).format('LL');
        });



    });
