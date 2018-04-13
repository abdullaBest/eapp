angular.module('regidiumApp')
    .controller('installAppNotifyCtrl', function ($scope) {
        if (localStorage.getItem("notification") == "closed") {
            angular.element('.alert-page-notification').remove();
        } else {
            angular.element('.alert-page-notification').addClass('in');
        }
    
        $scope.deleteNotify = function (e) {
            e.preventDefault();
            localStorage.setItem("notification", "closed");
            angular.element('.alert-page-notification').remove();
        };
    });