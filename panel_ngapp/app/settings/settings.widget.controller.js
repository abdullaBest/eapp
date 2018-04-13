'use strict';

angular.module('regidiumApp')
    .controller('SettingsWidgetCtrl', function($scope, customer, notify) {
        $('.error-text').hide();
        $scope.customer = customer.customer;
        $scope.settings = undefined;
        $scope.sites = null;
        $scope.widgetInstalled = false;
        $scope.position = 'default';
        $scope.noChange = true;

        var firstSettingsInit = false;
        var firstSitesInit = false;

        customer.getInfo().then(function(data) {
            $scope.settings = data.settings;
            $scope.sites = data.sites;
            $scope.settings.font = 'default';
            $scope.settings.lang = 'default';
            customer.isWidgetInstaled().then(function(data) {
                if (data.data.installed == true) {
                    $scope.widgetInstalled = true;
                }
            });
        });

        $scope.$watch('settings', function(value, old) {
            if (!value) return;
            if(!firstSettingsInit) {
                firstSettingsInit = true;
                return;
            }
            if (!angular.equals(value, old)) {
                $scope.noChange = false;
            }
        }, true);

        $scope.$watch('sites', function (value, old) {
            if(!value) return;
            if(!firstSitesInit) {
                firstSitesInit = true;
                return;
            }
            if (!angular.equals(value, old)) {
                $scope.noChange = false;
            }
        }, true);

        $scope.save = function() {
            customer.saveSites($scope.sites);
            customer.saveSettings($scope.settings);
            notify.changeSettings($scope.settings);
            $scope.noChange = true;
        };

        $scope.fonts = { 'default': 'Выберите шрифт', 'Open Sans': 'Open Sans', 'Roboto Condenced': 'Roboto', 'PT Sans': 'PT Sans' };
        $scope.lang = {
            'default': 'Выберите язык',
            'RU': 'Русский'
                // 'DE': 'Немецкий',
                // 'EN': 'Английский' 
        };
        $scope.position = {
            'default': 'Выберите расположения',
            'left': 'Внизу слева ',
            'right': 'Внизу справа'
                // 'center': 'Внизу в центре'
        };

        $scope.translate = function(value) {
            return value + '%';
        };

        function isCorrectColor(color) {
            var patternHex = /^#([A-Fa-f0-9]{6})$/,
                patternRgb = /(^rgb\((\d+),\s*(\d+),s*(\d+)\)$)/;
            if (color.match(patternHex)) {
                return true;
            } else {
                return false;
            }
        }

        $scope.regExSite = /(http(s)?:\/\/)?(www[\.])?([\w])+[\.]([\w]){2,4}$/;
        $scope.newSite = "";

        $scope.$watch('newSite', function(newValue, oldValue) {
            if (newValue == null) return;
            $('.error-text').hide();
        });

        $scope.addSite = function() {
            if ($scope.regExSite.test($scope.newSite)) {

                var index = _.pluck($scope.sites, 'url').indexOf($scope.newSite);
                if (index == -1) {
                    $scope.sites.push({
                        url: $scope.newSite
                    });
                    $('.site').val('');
                } else {
                    $('.error-text').show();
                }
            } else {
                $('.error-text').show();
            }
        };

        $scope.delete = function(site) {
            _.remove($scope.sites, site);
            customer.saveSites($scope.sites);
        };

        $scope.getCode = function() {
            $('#installCodeModal').modal('show');
        };

        $scope.testOptions = {
            min: 0,
            max: 100,
            step: 1,
            value: 100,
            precision: 2,
            orientation: 'horizontal', // vertical
            handle: 'round', //'square', 'triangle' or 'custom'
            tooltip: 'show', //'hide','always'
            tooltipseparator: ':',
            tooltipsplit: false,
            enabled: true,
            naturalarrowkeys: false,
            range: false,
            ngDisabled: false,
            reversed: false
        };



    });
