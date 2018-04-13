angular.module('regidiumApp')
    .controller('ReportsOperatorsCtrl', function ($scope, $http, moment, operators) {

        setTimeout(function () {
            $("[data-toggle='tooltip']").tooltip()
        }, 0);

        $scope.Math = window.Math;
        $scope.parseInt = window.parseInt;

        $scope.year = moment().year();
        $scope.period = 'today';
        $scope.periodSelectList = {
            'default': '',
            'today': 'За день',
            'week': 'За неделю',
            'year': 'За год'
        };
        $scope.startDate = null;
        $scope.endDate = null;

        $scope.operator = 'all';
        $scope.operatorsSelectList = {
            'default': '',
            'all': 'Все операторы'
        };
        $scope.allOperators = operators.operators;
        $scope.operators = {};


        $scope.$watch('allOperators', function (newValue, oldValue) {
            if (newValue == null) return;
            newValue.forEach(function (operator) {
                $scope.operators[operator._id] = operator;
                $scope.operatorsSelectList[operator._id] = operator.name;
            })
        }, true);

        $scope.todayWday = (moment().day() || 0) - 1;

        $scope.day = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        $scope.monthsName = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        $scope.monthsDate = ['января', 'февраля', 'марта', 'апреля', 'майя', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        $scope.weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        $scope.calendar = [];

        $scope.operatorsStats = {};
        $scope.operatorsStatsByHour = [];

        var daysAtMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        for (var i = 0; i < 12; i++) {
            $scope.calendar[i] = [
                []
            ];

            var fwd = moment().date(1).month(i).day() || 7;

            function addEmptyWeek(mnum, wn) {
                $scope.calendar[mnum][wn] = [
                    {class: 'layer-void'},
                    {class: 'layer-void'},
                    {class: 'layer-void'},
                    {class: 'layer-void'},
                    {class: 'layer-void'},
                    {class: 'layer-void'},
                    {class: 'layer-void'}
                ];
            }

            var weekNum = 0;
            var startDay = 1;
            addEmptyWeek(i, weekNum);

            for (var weekDay = fwd; weekDay <= 7; weekDay++) {

                $scope.calendar[i][weekNum][weekDay - 1]['class'] = 'layer-little';
                $scope.calendar[i][weekNum][weekDay - 1]['day'] = 1 + (weekDay - fwd);
                startDay++;
            }

            for (var d = startDay; d <= daysAtMonth[i]; d++) {

                if (weekDay == 8) {
                    weekNum++;
                    weekDay = 1;
                    addEmptyWeek(i, weekNum);
                }

                $scope.calendar[i][weekNum][weekDay - 1]['class'] = 'layer-little';
                $scope.calendar[i][weekNum][weekDay - 1]['day'] = d;

                weekDay++;
            }

        }


        $scope.$watchGroup(['period', 'operator'], function () {

            switch ($scope.period) {
                case 'week':
                    $scope.startDate = moment().startOf('week');
                    $scope.endDate = moment().endOf('week');
                    $scope.periodDays = [
                        {
                            'day': $scope.weekDays[0],
                            'date': moment().startOf('week')
                        }, {
                            'day': $scope.weekDays[1],
                            'date': moment().startOf('week').add(1, 'days')
                        },
                        {
                            'day': $scope.weekDays[2],
                            'date': moment().startOf('week').add(2, 'days')
                        }, {
                            'day': $scope.weekDays[3],
                            'date': moment().startOf('week').add(3, 'days')
                        },
                        {
                            'day': $scope.weekDays[4],
                            'date': moment().startOf('week').add(4, 'days')
                        }, {
                            'day': $scope.weekDays[5],
                            'date': moment().startOf('week').add(5, 'days')
                        }, {
                            'day': $scope.weekDays[6],
                            'date': moment().startOf('week').add(6, 'days')
                        }
                    ];
                    break;

                case 'year':
                    $scope.startDate = moment().date(1).month(0).hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
                    $scope.endDate = moment().date(31).month(11).hours(23).minutes(59).seconds(59).milliseconds(999).valueOf();
                    break;
            }
            $http.get('/api/stats/operatorefficiencyreport?operator=' + $scope.operator + '&period=' + $scope.period).success(function (data) {
                $scope.operatorsStats = data;
            });
        });

        $scope.$watch('operatorsStats', function (newValue, oldValue) {
            if (newValue == null) return;
            setTimeout(function () {
                $("[data-toggle='tooltip']").tooltip();
            }, 0);
        }, true);


        function plur(number, one, two, five) {
            number = Math.abs(number);
            number %= 100;
            if (number >= 5 && number <= 20) {
                return five;
            }
            number %= 10;
            if (number === 1) {
                return one;
            }
            if (number >= 2 && number <= 4) {
                return two;
            }
            return five;
        }


        $scope.parseTime = function (time) {
            var timer = ' не в сети';
            if (time > 0) {
                timer = '';
                var hour = Math.floor(time / 3600000);
                var minute = Math.floor((time - hour * 3600000)  / 60000);
                var seconds = Math.floor((time - hour * 3600000 - minute * 60000) / 1000);
              
                if (hour > 0) {
                    timer += hour + plur(hour, ' час ', ' часа ', ' часов ');
                }
                if (minute > 0) {
                    timer += minute + plur(minute, ' минута ', ' минуты ', ' минут ');
                }
                if (seconds > 0) {
                    timer += seconds + plur(seconds, ' секунда ', ' секунды ', ' секунд ');
                }
                timer += " онлайн";
            }

          return timer;
        };

    });
