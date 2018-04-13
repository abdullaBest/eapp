'use strict';

/**
 * Shake invalid form
 */
angular.module('regidiumApp')
    .directive('shakeForm', ['$animate', function($animate) {
        return {
            require: '^form',
            scope: {
                submit: '&',
                submitted: '='
            },
            link: function(scope, element, attrs, form) {
                // listen on submit event
                element.on('submit', function() {
                    // tell angular to update scope
                    scope.$apply(function() {
                        // everything ok -> call submit fn from controller
                        if (form.$valid) return scope.submit();
                        // show error messages on submit
                        scope.submitted = true;
                        // shake that form
                        $animate.addClass($(element).parent(), 'shake').then(function() {
                            $animate.removeClass($(element).parent(), 'shake');
                        });
                    });
                });
            }
        };

    }]);