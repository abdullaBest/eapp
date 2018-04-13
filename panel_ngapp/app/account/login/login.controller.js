'use strict';

angular.module('regidiumApp')
  .controller('LoginCtrl', function($scope, Auth, $location, webusers, chats, operators, customer, errorTooltips) {
    $scope.user = {
        email   : $location.$$search.login?$location.$$search.login:'',
        password: '',
        remember: true
    };
    $scope.errors = {};

    window.onload = function () {
          if (localStorage.getItem('logout_warning')) {
              angular.element('.notification-modal').addClass('in');
              localStorage.removeItem('logout_warning');
              setTimeout(function () {
                  angular.element('.notification-modal').removeClass('in');
              }, 4000);
          }
    };

    $scope.year = new Date().getFullYear();

    $scope.login = function(form) {
      if (form.$valid) {
        $scope.submitted = true;
        Auth.onError = $scope.loginError;
        Auth.login({
            email   : $scope.user.email,
            password: $scope.user.password,
            remember: $scope.user.remember
          });
      } else {
          // $('.js-custom-validate').addClass('form-group-error');
      }
    };
    // сообщение при ошибке авторизации
    $scope.loginError = function(err){
        $scope.errors.other = err.t;
        $scope.errors.type  = err.c;
        if (err.c === 'undefined' ) {
            $(".error-notification").show().animate({
                bottom: "-50px",
                opacity: 1
            }, 100);
        }
        $scope.$apply();
    }

    $scope.$watch('form.email.$$rawModelValue', function(value, old) {
      errorTooltips.changeDataOriginalTitle(value, old, 'email', $scope.errors, $scope.form);
    });

    $scope.$watch('form.password.$$rawModelValue', function(value, old) {
      errorTooltips.changeDataOriginalTitle(value, old, 'password', $scope.errors, $scope.form);
    });

    $scope.$watch('errors', function(value, old) {
      if(value == undefined) return;
      $('.'+value.type).attr('data-original-title', value.other).tooltip('show');
      if(value.type !== 'undefined') {
        $(".error-notification").hide();
      }
    }, true);

    $('.auth-page-wrap').mousemove(function(e) {
      var x = -(e.pageX + this.offsetLeft) / 100;
      var y = -(e.pageY + this.offsetTop) / 100;
      $(this).css('background-position', x + 'px ' + y + 'px');
    });

      setTimeout(function () {
          $("[data-toggle='tooltip']").tooltip()
      }, 0);

  });
