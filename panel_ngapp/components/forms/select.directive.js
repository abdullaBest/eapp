angular.module('regidiumApp')
    .directive('select', ['$timeout', function() {
        return {
            restrict: 'EA',
            replace: true,
            require:'ngModel',
            scope: {
                selectLabel: '@',
                selectOptions: '='
            },
            template: function(scope, element) {
              var result = '<div class="select js-select"> ';
              result += '<input class="select__value js-select-value" type="hidden" value="0">';
              result += '<span class="select__current js-select-current" ng-click="open()">{{selectOptions[model]}}</span>';
              result += '<ul class="select__list js-select-list">';
              result += '<li class="select__list-item js-select-list-item" ng-class="{__selected:model==value}" ng-if="$index>0" ng-click="change(value)" ng-repeat="(value, name) in selectOptions" data-type-id="type-{{value}}" data-value="{{value}}"';

              if (element.attributeSource) {
                result += ' data-source="' + element.attributeSource + '"';
              }

              result += '>{{name}}</li>';
              result += '</ul>';
              result += '</div>';

              return result;
            },


            link : function(scope, element, attrs, ngModelCtrl) {

                var list = element.find('.select__list');
                var cntrl = element.find('.select__current');

                scope.open = function(){

                    if(cntrl.hasClass('__active') && list.hasClass('__active')) {
                      scope.close();
                    } else {
                      list.show().stop(true,false).animate({
                      },50);
                      cntrl.addClass('__active');
                        list.addClass('__active');


                      $(document).on('click.closeList', function(e){
                        if($(e.target).closest('.select').length == 0){
                          scope.close();
                        }
                      });
                    }
                };

                scope.close = function(){
                  $(document).off('click.closeList');
                  cntrl.removeClass('__active');
                    list.removeClass('__active');
                  list.stop(true,false).animate({},50, function(){
                      $(this).hide();
                  });
                };

                scope.change = function(value){
                    scope.model = value;
                    ngModelCtrl.$setViewValue(scope.model);
                    scope.close();
                };

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
        };
    }]);
