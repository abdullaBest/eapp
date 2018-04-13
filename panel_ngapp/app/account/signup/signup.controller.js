'use strict';

angular.module('regidiumApp')
    .controller('SignupCtrl', function ($scope, Auth, $location, $urlRouter, customer, operators, chats, webusers, errorTooltips) {

        $scope.year = new Date().getFullYear();
        $scope.user_agreement = false;
        $scope.errors = {};

        $scope.user = {
            email   : $location.$$search.email,
            password: ''
        };
        $scope.errors = {};
        $scope.passwordSafe = false;

        $scope.generatePassword = function () {
            $scope.user.password = PassGenJS.getPassword({
                letters: 4,
                lettersUpper: 1,
                numbers: 1,
                symbols: 0
            });
        };
        $scope.license = false;
        $scope.inputType = 'password';

        $scope.$watch('user.password', function () {
            var p = PassGenJS.getScore($scope.user.password || '');
            $scope.passwordSafe = p.entropy > 39;
        });

        $scope.showHidePassword = function () {
            if ($scope.inputType === 'password') {
                $scope.inputType = 'text';
            } else {
                $scope.inputType = 'password';
            }
        };

        $scope.register = function (form) {

            $scope.submitted = true;
            if (form.$valid) {
                Auth.onError = $scope.regError;
                Auth.createCustomer(
                    $scope.user.name,
                    $scope.user.email,
                    $scope.user.password,
                    $scope.user.site
                );
            } else {
                if ($('.password').val().length < 6) {
                    $scope.errors.other = "Пароль должен быть не меньше 6 символов";
                    $scope.errors.type = 1;
                }
            }

        };
        // ошибка при регистрации
        $scope.regError = function(err){
            $scope.errors.other = err.t;
            $scope.errors.type  = err.c;
            $scope.$apply();
        }

        $scope.$watch('form.email.$$rawModelValue', function (value, old) {
            errorTooltips.changeDataOriginalTitle(value, old, 'email', $scope.errors, $scope.form);
        });

        $scope.$watch('form.password.$$rawModelValue', function (value, old) {
            errorTooltips.changeDataOriginalTitle(value, old, 'password', $scope.errors, $scope.form);
        });

        $scope.$watch('form.site.$$rawModelValue', function (value, old) {
            errorTooltips.changeDataOriginalTitle(value, old, 'site', $scope.errors, $scope.form);
        });

        $scope.$watch('form.name.$$rawModelValue', function (value, old) {
            errorTooltips.changeDataOriginalTitle(value, old, 'name', $scope.errors, $scope.form);
        });

        $scope.$watch('errors', function (value, old) {
            if (value == undefined) return;
            $('.'+value.type).attr('data-original-title', value.other).tooltip('show');
            if (value.type !== 'undefined') {
                $(".error-notification").hide();
            }
        }, true);

        $('.auth-page-wrap').mousemove(function (e) {
            var x = -(e.pageX + this.offsetLeft) / 100;
            var y = -(e.pageY + this.offsetTop) / 100;
            $(this).css('background-position', x + 'px ' + y + 'px');
        });

        setTimeout(function () {
            $("[data-toggle='tooltip']").tooltip()
        }, 0);
    });