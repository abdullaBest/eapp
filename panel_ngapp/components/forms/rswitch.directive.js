angular.module('regidiumApp')
    .directive('rswitch', ['$timeout', function() {
        return {
            restrict: 'EA',
            replace: true,
            require:'ngModel',
            scope: {
                rswitchLabel: '@',
                rswitchDirection: '@'
            },
            template: '<div class="type-toggle">' +
                    '<label ng-if="rswitchDirection==\'right\'" class="toggle-text" ng-bind="rswitchLabel"></label>' +
                    '<div class="toggle-span" ng-class="{\'pos-no\': !model, \'pos-yes\': model}"><div class="handle"></div><i class="fa fa-check"></i><i class="fa fa-times"></i></div>' +
                    '<label ng-if="rswitchDirection!=\'right\'" class="toggle-text" ng-bind="rswitchLabel"></label>' +
                    '</div>',

            link : function(scope, element, attrs, ngModelCtrl) {
                var KEY_SPACE = 32;

                element.on('click', function() {
                    scope.$apply(scope.toggle);
                });

                element.on('keydown', function(e) {
                    var key = e.which ? e.which : e.keyCode;
                    if (key === KEY_SPACE) {
                        scope.$apply(scope.toggle);
                    }
                });

                ngModelCtrl.$formatters.push(function(modelValue){
                    return modelValue;
                });

                ngModelCtrl.$parsers.push(function(viewValue){
                    return viewValue;
                });

                ngModelCtrl.$viewChangeListeners.push(function() {
                    scope.$eval(attrs.ngChange);
                });

                ngModelCtrl.$render = function(){
                    scope.model = ngModelCtrl.$viewValue;
                };

                scope.toggle = function toggle() {
                    if(!scope.disabled) {
                        scope.model = !scope.model;
                        ngModelCtrl.$setViewValue(scope.model);
                    }
                };
            }
        }
    }]);
