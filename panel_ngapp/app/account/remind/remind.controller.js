'use strict';

angular.module('regidiumApp')
  .controller('RemindCtrl', function ($scope, Auth, $location) {

        $scope.email = $location.$$search.login?$location.$$search.login:'';
        $scope.errors = {};
        $scope.sended = false;

      $scope.year = new Date().getFullYear();

        $scope.remind = function(form) {
            $scope.submitted = true;
            $('.auth-form-restoring').find(".error-notification").hide();
            if(form.$valid) {
              Auth.remindPassword($scope.email)
                  .then( function() {
                      $scope.sended = true;
                    })
                  .catch( function(err) {
                      console.log(err);
                      $scope.errors.other = err.data.error;
                      $('.auth-form-restoring').find(".error-notification").show().animate({bottom:"-50px",opacity:1},100);
                  });


            } else {
                $('.auth-form-restoring').find(".error-notification").show().animate({bottom:"-50px",opacity:1},100);
            }
        };

        $('.auth-page-wrap').mousemove(function(e) {
          var x = -(e.pageX + this.offsetLeft) / 100;
          var y = -(e.pageY + this.offsetTop) / 100;
          $(this).css('background-position', x + 'px ' + y + 'px');
        });

      setTimeout(function () {
          $("[data-toggle='tooltip']").tooltip()
      }, 0);
  });
