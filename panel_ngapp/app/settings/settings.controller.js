    angular.module('regidiumApp')
        .controller('SettingsChatsCtrl', function($scope, operators, customer, notify) {



            /* PUBLIC FIELDS */

            $scope.settingsCustomer = null;
            $scope.emails = [];
            $scope.noChange = true;
            $scope.regexEmail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

            /* ############ */



            /* PRIVATE FIELDS */

            var firstSettingsInit = false;

            /* ############ */



            /* INIT */

            $('.error-text').hide();

            setTimeout(function() {
                operators.getOperator().then(function(currentUser) {
                    customer.getInfo().then(function(data) {
                        $scope.settingsCustomer = data.settings;
                        $scope.currentUser = currentUser;
                        $scope.settingsCustomer.notify_email = data.settings.notify_email || [];
                    });
                });
            }, 2000);

            for (var key in operators.operators) {
                var operator = operators.operators[key];
                $scope.emails[operator.email] = operator.name;
            }

            /* ############ */



            /* WATCHING */

            $scope.$watch('newEmail', function(newValue, oldValue) {
                if (newValue != null) $('.error-text').hide();
            });

            $scope.$watch('settingsCustomer', function(newValue, oldValue) {
                if (!newValue) return;

                if(!firstSettingsInit) {
                    firstSettingsInit = true;
                    return;
                }

                if (!angular.equals(newValue, oldValue)) {
                    $scope.noChange = false;
                }
            }, true);

            /* ############ */



            /* PUBLIC METHODS */

            $scope.addEmail = function() {
                if ($scope.regexEmail.test($scope.newEmail)) {
                    $scope.settingsCustomer.notify_email.push({
                        url: $scope.newEmail
                    });
                    $('.email').val('');
                } else {
                    $('.error-text').show();
                }
            };

            $scope.delete = function(email) {
                _.remove($scope.settingsCustomer.notify_email, email);
            };


            $scope.save = function() {
                operators
                    .updateUser({ _id: $scope.currentUser._id, settings: $scope.settingsCustomer })
                    .then(function() {
                        customer.saveSettings($scope.settingsCustomer);
                        $scope.noChange = true;
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            };

            /* ############ */



        });