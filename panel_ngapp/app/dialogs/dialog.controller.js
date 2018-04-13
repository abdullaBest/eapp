angular.module('regidiumApp')
    .controller('DialogCtrl', function ($scope, $http, $stateParams, operators) {



        /* INIT */

        var dialogData = JSON.parse(localStorage.getItem('dialogData'));
        var url = '/api/chats/conversations/' + [$stateParams.operatorid, $stateParams.webuserid, $stateParams.start, $stateParams.end].join('/');
        

        $scope.msg_number = dialogData.msgNum;
        $scope.webuser = dialogData.webuser;
        $scope.operators = operators.operators;
        $scope.operator = {};
        $scope.messages = [];


        $http.get(url).then(function(response) {
            $scope.operator = _.find($scope.operators, { _id: $stateParams.operatorid });
            $scope.messages = response.data;
        });

        /* ############ */



        /* PUBLIC METHODS */

        $scope.loadMoreMessages = function () {
            $http.get(url + '/more' + '/?messages=' + $scope.messages.length).then(function (response) {
                if(response.data.length) {
                    $scope.messages.push.apply($scope.messages, response.data);
                }
            });
        };

        /* ############ */
    });