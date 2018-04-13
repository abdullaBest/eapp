angular.module('regidiumApp')
  .directive('offlinetimepassed', ['moment', function() {

    var shift = 0;

    return {
      restrict: 'A',
      scope: {
          offlinetimepassed: '='
      },
      link: function(scope, element) {

        var h = 3600;
        var m = 60;

        setTimeout(function () {

          scope.$watch('offlinetimepassed', function(){
            if(!scope.offlinetimepassed) return;
            var tsEnter = new Date(scope.offlinetimepassed.entertime).valueOf();
            var tsExit = new Date(scope.offlinetimepassed.exittime).valueOf();


            var millseconds = tsExit - tsEnter;
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

            element.text(timeString + ', покинул сайт в ' + moment(tsExit).format('HH:mm:ss'));
          });

        }, 0);


      }
  };

}
]);
