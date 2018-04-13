angular.module('regidiumApp')
    .controller('DialogsCtrl', function ($scope, $filter, $http, $location, operators, webusers, localStorageService) {

        $scope.customPeriod = {
            show: false,
            from: localStorageService.get('DialogsCtrl.customPeriod.from') || '',
            to: localStorageService.get('DialogsCtrl.customPeriod.to') || ''
        };

        loadDialogs();

        $scope.periods = {
            'default': '',
            'today': 'За сегодня',
            'yesterday': 'За вчера',
            'week': 'За неделю',
            'month': 'За месяц',
            'custom': 'Произвольный период'
        };

        $scope.period = localStorageService.get('DialogsCtrl.period') || 'today';
        $scope.dialogs = [];
        $scope.webusers = [];
        $scope.operators = operators.operators;
        var limit = 0;
        var offset = 0;


        $scope.operator = localStorageService.get('DialogsCtrl.operator') || 'all';
        $scope.operatorsList = {
            'default': '',
            'all': 'Все операторы'
        };

        $scope.operators = operators.operators;

        $scope.$watch('operators', function (value, old) {
            if (value !== null)
                value.forEach(function (operator) {
                    $scope.operators[operator._id] = operator;
                    $scope.operatorsList[operator._id] = operator.name;
                });
        });


        function loadDialogs() {

            setTimeout(function () {
                if ($scope.period === 'custom') {
                    $http.get('/api/chats/conversations?period=custom&from=' + $scope.customPeriod.from + '&to=' + $scope.customPeriod.to + '&offset=' + offset + '&limit=' + limit + '&operators=' + $scope.operator).success(function (data) {
                        $scope.dialogs = data;
                        for (var i = 0; i < $scope.dialogs.length; i++) {
                            $scope.dialogs[i].operator = _.find($scope.operators, {_id: $scope.dialogs[i].operatorid});
                        }
                    });
                } else {
                    $http.get('/api/chats/conversations?period=' + $scope.period + '&offset=' + offset + '&limit=' + limit + '&operators=' + $scope.operator).success(function (data) {
                        $scope.dialogs = data;
                        if ($scope.operator === 'all') {
                            $scope.dialogs = data;
                        } else {
                            $scope.dialogs = $filter('filter')($scope.dialogs, {operatorid: $scope.operator});
                        }

                        if ($scope.dialogs.length > 0) {
                            for (var i = 0; i < $scope.dialogs.length; i++) {
                                $scope.dialogs[i].operator = _.find($scope.operators, {_id: $scope.dialogs[i].operatorid});
                                $scope.duration = $filter('duration')($scope.dialogs[i].end - $scope.dialogs[i].start, 'hh:mm');
                            }
                        }
                    });
                }
            }, 0);

        }

        $scope.$watch('customPeriod', function () {
            localStorageService.set('DialogsCtrl.customPeriod.from', $scope.customPeriod.from)
            localStorageService.set('DialogsCtrl.customPeriod.to', $scope.customPeriod.to)
            if ($scope.customPeriod.from !== '' && $scope.customPeriod.to !== '' && $scope.customPeriod.show) {
                loadDialogs();
            }
        }, true);

        $scope.$watchGroup(['period', 'operator'], function (newVal, oldVal) {
            var period = newVal[0]
            var operator = newVal[1]
            localStorageService.set('DialogsCtrl.period', period)
            localStorageService.set('DialogsCtrl.operator', operator)
            offset = 0;
            setTimeout(function () {
                $("[data-toggle='tooltip']").tooltip();
            }, 0);
            if ($scope.period === 'custom') {
                $scope.customPeriod.show = true;
                loadDialogs();
            } else {
                $scope.customPeriod.show = false;
                loadDialogs();
            }
        });

        $scope.showDialog = function (dialog) {
            $location.path('/journal/' + dialog.operatorid + '/' + dialog.webuserid + '/' + dialog.start + '/' + dialog.end);
            localStorage.setItem('dialogData', JSON.stringify({
                msgNum: dialog.messages,
                webuser: dialog.webuser
            }));
        };

        $scope.takeDuration = function (dialog) {
            var duration = new Date(dialog.end).getTime() - new Date(dialog.start).getTime();
            return $scope.parseTime(duration);
        };

        $scope.parseTime = function (time) {
            var hour = 0, minute = 0, seconds = 0;
            if (time > 0) {
                hour = Math.floor(time / 3600000);
                minute = Math.floor((time - hour * 3600000) / 60000);
                seconds = Math.floor((time - hour * 3600000 - minute * 60000) / 1000);
            }

            hour = hour < 10 ? "0" + hour : hour;
            minute = minute < 10 ? "0" + minute : minute;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            return hour + ":" + minute + ":" + seconds;
        };


        $scope.deleteDialog = function (operator, webuser, start, end, e) {
            var url = '/api/chats/conversations/' + [operator, webuser._id, start, end].join('/');
            if (confirm('Вы действительно хотите удалить диалог?')) {
                $http.delete(url).then(function () {
                    _.remove($scope.dialogs, {webuserid: webuser._id});
                });
            }
            e.stopPropagation();
        };

        setTimeout(function () {
            $("[data-toggle='tooltip']").tooltip();
        }, 0);

    });
