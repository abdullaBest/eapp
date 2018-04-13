angular.module('regidiumApp')
    .controller('SettingsVisitorsCtrl', function($scope, customer, notify) {

        $scope.settings = {
            visitor_title: 'Давайте дружить?!',
            visitor_text: 'Представьтесь, чтобы мы могли ответить и продублировать переписку на почту',
            req_info: 'never',
            req_info_event: 'after_first_message'
        };
        $scope.noChange = true;

        var firstSettingsInit = false;

        customer.getInfo().then(function(data) {
            for (var key in data.settings) {
                $scope.settings[key] = data.settings[key];
            }

            $scope.variants = {
                'default': '',
                'always': 'Всегда',
                'never': 'Никогда'
            };

            $scope.variantList = {
                list: {
                    'default': '',
                    'after_first_message': 'После первого сообщения',
                    'after_double_message': 'После повторного сообщения'
                },
                show: false
            };

            $scope.$watch('settings.req_info', function() {
                if ($scope.settings.req_info == 'always' || $scope.settings.req_info == 'no_operators') {
                    $scope.variantList.show = true;
                } else {
                    $scope.variantList.show = false;
                }
            });

            $scope.$watch('settings', function(newValue, oldValue) {
                if(newValue == null) return;

                if(!firstSettingsInit) {
                    firstSettingsInit = true;
                    return;
                }

                if (!angular.equals(newValue, oldValue)) {
                    $scope.noChange = false;
                }
            }, true);

            $scope.save = function() {
                customer.saveSettings($scope.settings);
                notify.changeSettings($scope.settings);
                $scope.noChange = true;
            };
        });

        setTimeout(function() {
            $("[data-toggle='tooltip']").tooltip()

        }, 0);
    });
