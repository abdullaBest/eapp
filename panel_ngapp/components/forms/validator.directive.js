angular.module('regidiumApp').directive('validcountry', function (){
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ngModel) {
      var validcountry = scope.$parent.$parent.countries;

      //For DOM -> model validation
      ngModel.$parsers.unshift(function(value) {
        var valid = validcountry.indexOf(value) >= 0;
        ngModel.$setValidity('validcountry', valid);

        return valid ? value : undefined;
      });

      //For model -> DOM validation
      ngModel.$formatters.unshift(function(value) {
        ngModel.$setValidity('validcountry', validcountry.indexOf(value) >= 0);
        return value;
      });
    }
  };
});

angular.module('regidiumApp').directive('validcity', function (){
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ngModel) {
      var list = scope.$parent.$parent.cities;

      //For DOM -> model validation
      ngModel.$parsers.unshift(function(value) {
        var valid = list.indexOf(value) >= 0;
        ngModel.$setValidity('validcity', valid);

        return valid ? value : undefined;
      });

      //For model -> DOM validation
      ngModel.$formatters.unshift(function(value) {
        ngModel.$setValidity('validcity', list.indexOf(value) >= 0);
        return value;
      });
    }
  };
});
