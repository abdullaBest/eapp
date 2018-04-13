angular.module('regidiumApp')
.factory('confirmModal', function($q) {

  var mwnd = $('#confirm-window');
  var msgBody = $('#modalConfirmBody');
  var cancelButton = $('#confirmWindowCancel');
  var okButton = $('#confirmWindowOk')
  var closeButton = $('#confirmWindowClose')

  return {
    open: function(msg){
      msgBody.html(msg);
      $.fancybox.open(mwnd, {
          closeBtn: false,
          padding: 0,
          autoCenter: true,
          autoSize: false,
          autoResize: false,
          fitToView: false,
          width: 'auto',
          height: 'auto',
          helpers: {
              overlay: {
                  locked: false,
                  css: {

                  }
              }
          },
          afterLoad: function(){
           $('.modal-window').animate({top: 0,opacity: 1},500,"linear");


          },
          beforeClose: function(){
             $('.modal-window').animate({top: "-59px",opacity: 0},500,"linear");
          }
      });

      return $q(function(resolve, reject) {

        okButton.one('click', function(){
          resolve();
          $.fancybox.close();
        })

        cancelButton.one('click', function(){
          reject();
          $.fancybox.close();
        });

        closeButton.one('click', function(){
          reject();
          $.fancybox.close();
        });


      });

  }
}
})
.directive('confirmClick', function ($window, confirmModal) {
  var i = 0;
  return {
    restrict: 'A',
    priority:  1,
    compile: function (tElem, tAttrs) {
      var fn = '$$confirmClick' + i++,
          _ngClick = tAttrs.ngClick;
      tAttrs.ngClick = fn + '($event)';

      return function (scope, elem, attrs) {
        var confirmMsg = attrs.confirmClick || 'Вы уверены?';

        scope[fn] = function (event) {

          confirmModal.open(confirmMsg).then(function(){
            //ok
            scope.$eval(_ngClick, {$event: event});
          },
          function(){
            //cancel & close
          });

        };
      };
    }
  };
})
