angular.module('regidiumApp')
    .directive('rpopup', ['$timeout', function() {
        return {
            restrict: 'A',

            link : function(scope, element, attrs) {

                element.find('.cntrl-popup-close').on('click', function(e){
                    e.preventDefault();
                    var self = $(this),
                        parent = self.parent();

                    self.removeClass('active');
                    element.find(".cntrl-action-layer").animate({top: "55px",opacity:0},10).hide(190);
                });

                element.find('.cntrl-popup').on('click', function(e){

                    e.preventDefault();
                    var self = $(this),
                        parent = self.parent();

                    if(!self.hasClass('active')){
                        self.addClass('active');
                        element.find(".cntrl-action-layer").show().animate({top: "50px",opacity:1},10);
                        $(document).on('click.actionLayer'+parent.index(), function (e) {
                            if ($(e.target).closest(parent).length == 0) {
                                self.removeClass('active');
                                element.find(".cntrl-action-layer").animate({top: "55px",opacity:0},10).hide(190);
                                $(document).off('click.actionLayer'+parent.index());
                            }
                        });
                    }else{
                        self.removeClass('active');
                        element.find(".cntrl-action-layer").animate({top: "55px",opacity:0},10).hide(190);
                    }

                })

            }
        }
    }]);