angular.module('regidiumApp')
    .directive('webuserinfo', ['customer', 'webusers', 'moment', function (customer, webusers, moment) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                webuser: '='
            },
            templateUrl: 'components/webusers/webuserinfo.html',
            link: function (scope, element, attrs) {

                setTimeout(function () {
                    $("[data-toggle='tooltip']").tooltip()
                }, 0);


                var pagesMap = $('#user-map-list');

                scope.showPagesMap = function () {
                    if (!pagesMap.hasClass('in')) {
                        pagesMap.addClass('in');
                    }
                };

                scope.hidePagesMap = function () {
                    if (pagesMap.hasClass('in')) {
                        pagesMap.removeClass('in');
                    }
                };

                scope.parseTime = function (time) {
                    var timer = '';
                    if (time > 0) {
                        var hour = Math.floor(time / 3600000);
                        var minute = Math.floor((time - hour * 3600000) / 60000);
                        var seconds = Math.floor((time - hour * 3600000 - minute * 60000) / 1000);

                        if (hour > 0) {
                            timer += hour<10?"0" + hour + "ч ":hour + "ч ";
                        }
                        if (minute > 0) {
                            timer += minute<10?"0" + minute + "м ":minute + "м ";
                        }
                        if (seconds > 0) {
                            timer += seconds<10?"0" + seconds + "с":seconds + "с";
                        }
                    }
                    return " " + timer;
                };

                scope.$watch('webuser', function (newValue, oldValue) {
                    if (!newValue) return;

                    scope.url = newValue.url;
                    scope.getSiteTime = function (id) {
                        return scope.parseTime(webusers.getWebUserTime(id, 'directive'));
                    };

                    scope.webuser.completedchats = newValue.completedchats;

                    setTimeout(function () {
                        $("[data-toggle='tooltip']").tooltip()
                    }, 0);

                    scope.getTimePage = function (time) {
                        var temporary = 0;
                        if (scope.webuser) {
                            if (scope.webuser.online) {
                                temporary = Date.now() - Date.parse(time);
                            } else {
                                temporary = Date.parse(scope.webuser.exittime) - Date.parse(time);
                            }
                        }
                        return scope.parseTime(temporary);
                    };

                    // Данные о местоположении, определённом по IP
                    scope.center = [scope.webuser.long, scope.webuser.latitude];
                    scope.geoObject = {
                        geometry: {
                            type: 'Point',
                            coordinates: scope.center
                        },
                        properties: {
                            // В балуне: страна, город, регион.
                            balloonContentHeader: newValue.country,
                            balloonContent: newValue.city,
                            balloonContentFooter: newValue.region
                        }
                    };

                    if (scope.webuser.referrer && scope.webuser.referrer.indexOf("http") === -1) {
                        scope.webuser.referrer = 'http://' + scope.webuser.referrer;
                    }

                }, true);

                scope.hideTooltip = function () {
                    $("[data-toggle='tooltip']").tooltip('hide');
                };

                customer.getActiveBill().then(function (data) {
                    scope.currentBill = data.data;
                    scope.getPaymentInfo = function () {
                        var dayleft = moment(scope.currentBill.end).diff(moment(), 'days');

                        return {
                            isDemo: scope.currentBill.period === 1,
                            daysleft: dayleft,
                            isFreeMode: dayleft <= 0
                        };
                    };
                });
                
                scope.timezone = new Date().getTimezoneOffset();

            }
        }
    }]);
