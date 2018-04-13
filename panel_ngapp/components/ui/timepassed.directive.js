angular.module('regidiumApp')
  .directive('timepassed', function() {

    var shift = 0;

    return {
      restrict: 'A',
      scope: {
          timepassed: '='
      },
      link: function(scope, element) {

        var h = 3600;
        var m = 60;

        setTimeout(function () {

            scope.$watch('timepassed', function(){
                updateTime();
            });

            function updateTime() {
              var ts = new Date(scope.timepassed).valueOf();
              var millseconds = Date.now() - ts;
              if(millseconds < 0 && -1*millseconds > shift) shift =  -1*millseconds;
              millseconds+=shift;
              var seconds = Math.floor(millseconds / 1000);
              var hours = Math.floor(seconds / h);
              var minutes = Math.floor((seconds % h) / m);
              var scnds = Math.floor((seconds % m));
              if (scnds < 10) scnds = "0" + scnds;
              if (hours < 10) hours = "0" + hours;
              if (minutes < 10) minutes = "0" + minutes;
              var timeString = hours + ":" + minutes + ":" + scnds;
              element.text(timeString);
            }

            updateTime();
            setInterval(updateTime, 1000);
        }, 0);


      }
  };

  });
