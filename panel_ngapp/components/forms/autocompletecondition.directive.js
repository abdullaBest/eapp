angular.module('regidiumApp')
  .directive('autoCompleteCondition', function($timeout) {
    return function(scope, iElement, iAttrs) {
      iElement.autocomplete({
          source: function (request, response) {
              var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
                response($.grep(_.pluck(scope[iAttrs.uiItems], 'name'), function (item, index) {
                    if (iAttrs.uiItems == 'citiesList') {
                        return matcher.test(item) && scope[iAttrs.uiItems][index].country_id == iAttrs.countryId;
                    } else {
                        return matcher.test(item);
                    }
                }));
          },
        select: function(e) {
          $timeout(function () {
            scope.$parent.$parent.modalform.conditions[iAttrs.autoCompleteCondition].value = e.target.value;
          }, 0);
        }
      });
    };
});