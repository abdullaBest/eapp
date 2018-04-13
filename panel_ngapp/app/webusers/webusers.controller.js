angular.module('regidiumApp')
    .animation('.webuserrow', function () {
        return {
            enter: function (element, done) {

                element.css({
                    'opacity': '0'
                });
                jQuery(element).animate({
                    opacity: 1,
                    height: 50
                }, 100, done);

                return function (isCancelled) {
                    if (isCancelled) {
                        jQuery(element).stop();
                    }
                };
            },

            leave: function (element, done) {
                element.css({
                    'opacity': 1,
                    'height': '50px',
                    'color': 'red'
                });
                jQuery(element).animate({
                    opacity: 0,
                    height: 0
                }, 100, done);

                return function (isCancelled) {
                    if (isCancelled) {
                        jQuery(element).stop();
                    }
                };
            }
        };
    })
    .controller('WebusersCtrl', function ($scope, $filter, $location, chats, webusers, operators, customer) {

        /* INIT */
        $scope.webusers  = webusers.webusers;
        $scope.operators = operators.operators;
        $scope.settings  = operators.settings;
        $scope.chats     = chats.chats;

        $scope.selected = undefined;
        $scope.bindedoperator = undefined;
        $scope.currentOperator = undefined;

        $scope.userslist = [];
        $scope.offset = 20;
        $scope.limit = 20;
        $scope.tab = 'online';

        $scope.counters = {
            online: 0,
            offline: 0
        };

        var limits = {
            online: 20,
            offline: 20,
            chat: 20
        };

        customer.getActiveBill().then(function (data) {
            $scope.currentBill = data.data;
            $scope.getPaymentInfo = function () {
                var dayleft = moment($scope.currentBill.end).diff(moment(), 'days');

                return {
                    isDemo: $scope.currentBill.period === 1,
                    daysleft: dayleft,
                    isFreeMode: dayleft <= 0
                };
            };
        });


        operators.getOperator().then(function (currentUser) {
            if (!currentUser.settings.allusers) {
                $scope.bindedoperator = currentUser._id;
            } else {
                $scope.bindedoperator = _.filter($scope.webusers, function (item) {
                    return item.bindedoperator === currentUser._id;
                })
            }
            $scope.currentOperator = currentUser;
            $scope.userslist = _.filter($scope.userslist, function (item) {
                return item.online || item.exittime >= $scope.currentOperator.exittime;
            });
        });
        /* ############ */


        /* WATCHING */
        $scope.$watchGroup(['tab', 'bindedoperator', 'webusers'], function (newValue) {
            if (newValue === null) return;
            updateUserList(updateCounters);
        });

        $scope.$watch('webusers', function (newValue, oldValue) {
            if (newValue === null) return;

            updateUserList(updateCounters);

        }, true);
        /* ############ */


        /* PRIVATE METHODS */
        function updateUserList(cb) {
            var filterParams = null,
                filteredUser = null;
            if ($scope.tab === 'online') {

                $scope.checkHeight();
                filterParams = {online: true};

                if ($scope.currentOperator && !$scope.settings.allusers) {
                    if ($scope.bindedoperator) {
                        filterParams.bindedoperator = $scope.bindedoperator;
                    }
                }
                filteredUser = $filter('filter')($scope.webusers, filterParams);

                $scope.userslist = filteredUser;
                cb();

            }

            if ($scope.tab === 'offline') {
                $scope.checkHeight();
                filterParams = {online: false};
                if ($scope.currentOperator && !$scope.settings.allusers) {
                    if ($scope.bindedoperator) {
                        filterParams.bindedoperator = $scope.bindedoperator;
                    }
                }
                filteredUser = $filter('filter')($scope.webusers, filterParams);

                $scope.userslist = filteredUser;

                if ($scope.bindedoperator) {
                    $scope.userslist = _.filter($scope.userslist, function (item) {
                        return item.exittime >= $scope.currentOperator.exittime
                    })
                }
                cb();

            }

            $scope.userslist = $filter('orderBy')($scope.userslist, 'entertime', true);

            //выбираем 1 из списка
            if (!$scope.selected && $scope.userslist.length > 0) {
                $scope.selectWebuser($scope.userslist[0]._id);
            } else if ($scope.userslist.length === 0) {
                $scope.selected = undefined;
            }
        }

        function updateCounters() {
            $scope.filterOnline = {online: true};
            $scope.filterOffline = {online: false};

            if ($scope.currentOperator) {
                if (!$scope.settings.allusers) {
                    $scope.filterOnline = {online: true, bindedoperator: $scope.currentOperator._id};
                    $scope.filterOffline = {online: false, bindedoperator: $scope.currentOperator._id};
                }

                var offlineUsers = $filter('filter')($scope.webusers, $scope.filterOffline);
                var onlineUsers = $filter('filter')($scope.webusers, $scope.filterOnline);

                if ($scope.bindedoperator) {
                    offlineUsers = _.filter(offlineUsers, function (item) {
                        return item.exittime >= $scope.currentOperator.exittime;
                    })
                }

                $scope.counters = {
                    online: onlineUsers.length,
                    offline: offlineUsers.length
                };
            }

        }

        /* ############ */


        /* PUBLIC METHODS */
        $scope.changeTab = function (mode) {
            $scope.limit = limits[mode];
            $scope.tab = mode;
        };

        $scope.getWebUserName = function (id) {
            var webuser = _.find($scope.webusers, {_id: id});
            var name = 'Анонимус';
            if (webuser) {
                if (webuser.name && webuser.name.length > 0) {
                    name = webuser.name;
                }
                if (!webuser.name && webuser.email && webuser.email.length > 0) {
                    name = webuser.email;
                }
                if (!webuser.name && webuser.phone && webuser.phone.length > 0) {
                    name = webuser.phone;
                }
            }
            return name;
        };

        $scope.getOperatorName = function (id) {
            var operator = _.find($scope.operators, {_id: id});
            return operator ? operator.name : '';
        };

        $scope.getOperatorImage = function (id) {
            var operator = _.find($scope.operators, {_id: id});
            return (operator) ? operator.image : '';
        };

        $scope.getWebUserTime = function (id) {
            var timepassed = webusers.getWebUserTime(id, 'ctrl');
            if (id === $scope.selected._id) $scope.selected.timepassed = timepassed;
            return timepassed;
        };

        $scope.selectWebuser = function (id) {
            $scope.selected = _.find($scope.webusers, {_id: id});
        };

        $scope.startChat = function (id) {
            var webuser = webusers.get(id);
            if (webuser && webuser.bindedoperator===operators.user._id){
                chats.start(id);
                $("[data-toggle='tooltip']").tooltip('hide');
                $location.path('/dialogs');
            }
        };
        /* ############ */

        $scope.checkHeight = function () {
            if ($('.__with-info')[0]) {
                $('.tab-pane .wrap-operator-offset').css('max-height', 'calc(100vh - 240px)');
                $('.js-watch-height, .layer-overlay-info.js-watch-height').css('max-height', 'calc(100vh - 171px)');
            }
        };
        $scope.isMine= function (webuser) {
            return webuser.bindedoperator===operators.user._id;
        };


        /* ASYNCHRONIOUS BLOCK */
        setTimeout(function () {
            $("[data-toggle='tooltip']").tooltip();
            $scope.checkHeight();
        }, 0);
        /* ############ */


    });