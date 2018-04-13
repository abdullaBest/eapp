angular.module('regidiumApp')
    .directive('mhScrollbar', function () {
        return {
            restrict: "AE",
            scope: {},

            link: function (scope, element, attrs) {
                if (!element.hasClass('load-more')) {
                    if (element.hasClass('chat__form-textarea-wrap-scroll')) {
                        console.log(element);
                        element.mCustomScrollbar({
                            axis: "y",
                            autoHideScrollbar: true
                        });
                    }
                    element.mCustomScrollbar();
                } // иницилизация скроллбара для всех
                // елементов
            }
        }
    });