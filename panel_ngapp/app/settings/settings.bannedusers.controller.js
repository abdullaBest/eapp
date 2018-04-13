angular.module('regidiumApp')
    .controller('SettingsBannedusersCtrl', function($scope, webusers) {

        $scope.users = [];

        webusers.getBlocked().then(function(response) {
            $scope.users = response.data;

            $scope.unblock = function(id) {
                webusers.unblock(id);
                _.remove($scope.users, {
                    _id: id
                });
            };
        });
    });
