angular.module("regidiumApp").directive('lineChart', [
    'moment',
    function (moment) {
        return {
            restrict: 'A',
            scope: {
                lineData: '=',
                lineXkey: '=',
                lineYkeys: '=',
                lineLabels: '=',
                lineColors: '=',
                lineTimeformat: '='
            },
            link: function (scope, elem) {
                function getDate(time) {
                    time = new Date(time);
                    var date = '';
                    if (scope.lineXkey == 'today') {
                        var hour = time.getHours();
                        if (hour % 2 == 0) {
                            if (hour < 10) {
                                date = "0" + hour + ":00";
                            } else {
                                date = hour + ":00";
                            }
                        } else {
                            date = "";
                        }

                    } else {
                        var days = time.getDate();
                        var months = time.getMonth() + 1;
                        var year = time.getFullYear();
                        if (days < 10) {
                            date = '0' + days + '-' + months + '-' + year;
                        } else {
                            date = days + '-' + months + '-' + year;
                        }
                    }
                    return date;
                }

                scope.$watch('lineData', function (args) {
                    var option = {
                        container: 'chat-report-chart'
                    };

                    option = $.extend({}, args);

                    google.charts.load('current', {'packages': ['corechart', 'line']});
                    google.charts.setOnLoadCallback(_draw);

                    function _draw() {
                        var arr = [];
                        for (var i = 0; i < scope.lineData.length; i++) {
                            var arrVal = Object.values(scope.lineData[i]);
                            arrVal[0] = getDate(arrVal[0]);
                            arr.push(arrVal);
                        }
                        var data = new google.visualization.DataTable();

                        data.addColumn('string', 'Время');
                        data.addColumn('number', 'Все');
                        data.addColumn('number');
                        data.addColumn('number');
                        data.addRows(arr);

                        var options = {
                            title: '',
                            curveType: 'function',
                            legend: 'none',
                            chartArea: {
                                left: 30,
                                top: 20,
                                width: '150%',
                                height: '85%'
                            },
                            colors: ['#2b274f', '#72c352', '#ff5a5a'],
                            crosshair: {
                                color: '#d3dadf'
                            },
                            fontSize: 12,
                            fontName: 'Roboto',
                            hAxis: {
                                baselineColor: '#d3dadf',
                                textStyle: {
                                    color: '#94aaba'
                                }
                            },
                            vAxis: {
                                baselineColor: '#d3dadf',
                                textStyle: {
                                    color: '#94aaba'
                                },
                                minValue: 0,
                                viewWindow: {
                                    min: 0
                                }
                            },
                            tooltip: {isHtml: true}

                        };

                        var chart = new google.visualization.LineChart(document.getElementById("chat-report-chart"));

                        chart.draw(data, options);
                    }

                }, true);

            }
        }

    }

]);
