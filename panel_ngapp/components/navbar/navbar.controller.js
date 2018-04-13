'use strict';

angular.module('regidiumApp')
    .controller('NavbarCtrl', function ($scope, $location, Auth, operators, customer, moment, chats) {

        $scope.$on('updateNavbar', function (data) {
            customer.getActiveBill().success(function (response) {
                $scope.currentBill = response;
                $scope.licenseEndDate = response.end;
            });
        });

        $scope.unreaded = chats.unreaded;
        $scope.isCollapsed = true;
        $scope.currentUser = {};
        $scope.licenseEndDate = 0;
        $scope.messagePanelShow = false;
        $scope.operators = operators.operators;
        $scope.showBtns = {
            siteCode: true,
            appBtn: true
        };

        $scope.showBtns.siteCode = localStorage.getItem('siteCode') === 'show';
        $scope.showBtns.appBtn = localStorage.getItem('appBtn') === 'show';


        $scope.$watch('operators', function (newValue, oldValue) {
            if (newValue === null) return false;
            $scope.operatorsNum = newValue.length;
        }, true);


        operators.getOperator().then(function (user) {
            $scope.currentUser = user;
        });

        customer.getActiveBill().success(function (data) {
            $scope.currentBill = data;
            $scope.licenseEndDate = data.end;
        });

        // customer.getLastPayedBill().success(function (data) {
        // $scope.licenseEndDate = data.end;
        // });

        $('#dropdownTopMenu').on('blur',function(){
            $scope.closeUserMenu();
            $('#dropdownTopMenu').attr('aria-expanded',!$scope.isCollapsed);
        })

        $scope.logout = function () {
            Auth.logout();
        };

        $scope.isActive = function (route) {
            return route === $location.path();
        };

        $scope.isBilling = function () {
            return location.href.split('/')[3] === 'billing';
        };
        $scope.isWidget = function () {
            return location.href.split('/')[4] === 'widget';
        };

        $scope.closeNot = function () {
            $('.notification').css('opacity', '0');
        };

        $scope.presence = function (state) {
            operators.setPresence(state);
            $scope.currentUser.online = state;
        };

        var mb = $('#dropdownTopMenu');
        $scope.openUserMenu = function () {
            $('.dropdown-menu-profile').css({
                opacity: 1,
                display: 'block'
            }, 300);
            $scope.isCollapsed = false;
        };

        $scope.closeUserMenu = function () {
            $('.dropdown-menu-profile').css({
                opacity: 0,
                display: 'none'
            }, 300);
            $scope.isCollapsed = true;
        };

        $scope.toggleUserMenu = function ($event) {
            // $event.stopPropagation();
            if ($scope.isCollapsed) {
                $scope.openUserMenu();
            } else {
                $scope.closeUserMenu();
            }
            $('#dropdownTopMenu').attr('aria-expanded',!$scope.isCollapsed);
        };

        $scope.getModalOpened = function (modal) {
            $(modal).modal('toggle');
        };

        $scope.hideElement = function (e, element) {
            e.stopPropagation();
            if (element === '.code') {
                localStorage.setItem('siteCode', 'hide');
            } else {
                localStorage.setItem('appBtn', 'hide');
            }
            $(element).hide();
        };


        setTimeout(function () {
            if ($('.__with-info')[0]) {
                $('.js-watch-height').css('height', 'calc(100vh - 171px)');
                $('.list-group-operators').css('max-height', 'calc(100vh - 171px)');
            }
            $('[data-toggle="tooltip"]').tooltip();
        }, 0);
    });
