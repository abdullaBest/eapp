angular.module('regidiumApp')
  .directive('localtime', ['moment', function(moment) {

    var shift = 0;

    return {
      restrict: 'A',
      scope: {
          localtime: '='
      },
      link: function(scope, element) {


        setTimeout(function () {

            var h = 3600;
            var m = 60;

            scope.$watch('localtime', function(){
                updateTime();
            });

            function updateTime() {
              if(!scope.localtime) return;
              element.text(moment().utcOffset(-1 * scope.localtime).format('HH:mm:ss'));
            }

            updateTime();
            setInterval(updateTime, 1000);
        }, 0);

      }
  };
  }
]);
