angular.module('regidiumApp')
    .directive('colpick', ['$timeout', function(scope) {
        return {
            restrict: 'EA',
            replace: true,
            require:'ngModel',
            scope: {
                colpickLabel: '@',
                colpickModel: '='
            },
            template:   '<div>' +
                '<label for="title-text-color" ng-bind="colpickLabel"></label>' +
                '<span class="label label-color" data-value="{{model}}" ng-style="{\'background-color\':model}"></span>' +
                '<input class="form-control" type="text" id="title-text-color" ng-model="model"/>' +
            '</div>',

            link : function(scope, element, attrs, ngModelCtrl) {

                scope.$watch('colpickModel', function (newValue, oldValue) {
                    scope.style = {'background-color':newValue};

                    element.find('.label-color').colpick({
                        submit: "Ok",
                        color: newValue,
                        onChange:function(hsb,hex,rgb,el,bySetColor) {
                            scope.$apply(function(){
                                scope.model = '#'+hex;
                                ngModelCtrl.$setViewValue(scope.model);
                            })
                        }
                    })
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
            }
        }
    }]);