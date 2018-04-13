angular.module('regidiumApp')
  .directive('ptooltip', [function() {
    return {
      restrict: 'AEC',
      scope: {

      },
      link: function(scope, element, attrs) {
        var _this = $(element);
        _this.hover(
          function() {
            _this.addClass('active');
            _this.find(".p-tooltip").show();
            _this.find(".p-tooltip").animate({
              opacity: 1,
              top: "25px"
            }, 100);
          },
          function() {
            var _this = $(this);
            _this.removeClass('active');
            _this.find(".p-tooltip").animate({
              top: "35px",
              opacity: 0
            }, 100, function() {
              $(this).hide();
            });

          }
        );
      }
    }
  }]);
