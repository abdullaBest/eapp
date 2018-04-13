'use strict';

angular.module('regidiumApp')
    .controller('LeaveMessCtrl', function($scope, $location, $http) {

        $scope.leaveMessage = function () {

            var block = $('.block-leave-question'),
                form = $('.js-leave-question-form'),
                _this = $('.js-leave-question-btn');

            if (!_this.hasClass('js-status-active')) {
                block.append('<div class="layer-popup" style="top: 0px"></div>');
                _this.addClass('js-status-active');
                _this.css('z-index', '1001');
                form.addClass('layer-open');
                form.css('z-index', '1001');
            } else {
                $scope.closeIt();
            }
        };


        $scope.closeIt = function () {
            var form = $('.js-leave-question-form'),
                _this = $('.js-leave-question-btn');

            if ($('.layer-popup')) {
                $('.layer-popup').remove();
                _this.removeClass('js-status-active');
                form.removeClass('layer-open');
            }
        };


        $scope.msgSended = false;

        $scope.message = {
            text: ''
        };

        $scope.send = function () {
            //SEND EMAIL
            $http.post('/api/users/support', $scope.message).success(function () {
                $scope.msgSended = true;
                $scope.message = {
                    text: ''
                };
            });
            $('.layer-popup').remove();
            $('.js-leave-question-form').removeClass('layer-open');
            $('.js-leave-question-btn').removeClass('js-status-active');
        };

        setTimeout(function () {
            $("[data-toggle='tooltip']").tooltip();
        }, 0);  
    });
