angular.module('regidiumApp')
    .directive('dmenu', ['$state', 'operators', function ($state, operators) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                path: '@',
                selectOptions: '='
            },
            template: '<div class="col-xs-4 col-sm-4 col-md-4">' +
            '<nav class="navigation __content-left-nav" role="navigation">' +
            '<ul class="nav nav-simple nav-stacked">' +
            '<li ng-repeat="item in menuitems">' +
            '<a ui-sref="{{item.name}}" class="link __nav" ng-class="{__active: isActive(item.url)}" ng-href="{item.url}">{{item.title}}</a>' +
            '</li>' +
            '</ul>' +
            '</nav>' +
            '</div>',
            link: function (scope, element, attrs) {
                scope.menuitems = [];


                $state.get().forEach(function (item) {
                    operators.getOperator().then(function (data) {
                        scope.isadmin = data.isadmin;
                        if (scope.isadmin && item.name.indexOf(scope.path) === 0) {
                            scope.menuitems.push({
                                name : item.name,
                                title: item.resolve.$title(),
                                url  : item.url
                            });
                        } else if (item.name.indexOf(scope.path) === 0) {
                            if (scope.path === 'app.settings_') {
                                if (item.url === '/settings/notification') {
                                    scope.menuitems.push({
                                        name: item.name,
                                        title: item.resolve.$title(),
                                        url: item.url
                                    });
                                }
                            } else {
                                scope.menuitems.push({
                                    name: item.name,
                                    title: item.resolve.$title(),
                                    url: item.url
                                });
                            }
                        }
                    });

                });

                var _self = $(element).find('.b-info-nav');
                var _w = _self.parents('.block').outerWidth();

                $(document).on('scroll', function () {
                    var scroll = $(this).scrollTop();
                    var header = $('.main-content__header').filter(":visible").outerHeight(true),
                        notify = $('.site-notify').filter(":visible").outerHeight(true),
                        header_height = header + notify;

                    if (scroll > 1) {
                        _self.addClass('float');
                        _self.css({
                            maxWidth: _w + 'px',
                            top: (header_height - 3) + 'px'
                        });
                    } else {
                        _self.removeClass('float');
                        _self.css({
                            maxWidth: '100%',
                            top: 0
                        });
                    }
                });

                scope.isActive = function (route) {
                    if (location.pathname.split('/').length > 4) {
                        return route === "/" + location.pathname.split('/')[1];
                    } else {
                        return route === location.pathname;
                    }
                };

            }
        };
    }]);
