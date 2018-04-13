// Version 1: http://pastebin.com/x16d1cGm
// Version 2: http://pastebin.com/m0yTf2Uu
// Alpha Version: http://pastebin.com/ELTGhxW6
// Betta version: http://pastebin.com/TjBsPXcY

angular.module('regidiumApp')
    .directive('msgScrollbar', ['chats', function (chats) {
        return {
            restrict: 'AE',
            scope: {
                msgScrollbarChat: '='
            },
            link: function (scope, element, attrs) {



                /*
                 * Init.
                 */

                var COUNT_OF_MESSAGES = 5;
                var MAX_OFFSET = 50;

                element[0].className += " m--scrollable";

                var scrollArea = $('.rw-messages__list-inner')[0];

                var track = document.createElement('div');
                track.className = 'rw-window-scrollbar-track';
                element[0].appendChild(track);

                var thumb = document.createElement('div');
                thumb.className = 'rw-window-scrollbar-thumb';
                element[0].appendChild(thumb);

                /* ############ */




                /*
                 * Private methods.
                 */

                function updateThumb() {
                    var ratio = element[0].offsetHeight / element[0].scrollHeight;
                    $(thumb).css('top', -parseInt(scrollArea.style.marginBottom) * ratio);
                    setTimeout(function() {
                        ratio = element[0].offsetHeight / element[0].scrollHeight;
                        $(thumb).css('height', ratio * element[0].offsetHeight);
                    }, 0);
                }

                function scrollToEnd() {
                    setTimeout(function() {
                        element[0].scrollTop = element[0].scrollHeight;
                        updateThumb();
                    }, 0);
                }

                function changeScrollTop(offset) {

                    var ratio = element[0].scrollHeight / $(track).height();

                    element[0].scrollTop = element.scrollTop() - offset * ratio;
                }

                function getChatAreaHeight() {
                     
                     var heights = _.map(_.values($('.m--message')), function(obj) {
                        return obj.offsetHeight || 0;
                    });

                    var _height = 0;

                    for(var key in heights)
                        _height += heights[key];

                    return _height;
                }

                var thumbTimeoutId = -1;

                function showThumb() {
                    if(thumbTimeoutId !== -1) {
                        clearTimeout(thumbTimeoutId);
                    }
                    thumbTimeoutId = setTimeout(function() {
                        $(thumb).show();
                    }, 300);
                }

                /* ############ */




                /*
                 * Watching section.
                 */

                scope.$watch('msgScrollbarChat.messages', function(value, old) {
                    if(!value) return;

                    if(old && value.length - old.length) {

                        if(value.length === old.length + 1) {

                            if(getChatAreaHeight() >= element[0].offsetHeight) {
                                showThumb();
                            }

                            scrollToEnd();
                            return;
                        }

                        var hh = 0;

                        var heights = _.map(_.values($('.m--message')), function(obj) {
                            return obj.offsetHeight || 0;
                        }).slice(6, COUNT_OF_MESSAGES + 6);

                        for(var key in heights)
                            hh += heights[key];

                        element[0].scrollTop = hh;
                        scrollArea.style.marginBottom = -hh + 'px';
                    }


                    /* 
                     * Upload more messages if existing messages aren't enough for sliding.
                     * Example: large screen or screen with high resolution.
                     */
                    setTimeout(function() {

                        var globalHeight = getChatAreaHeight();

                        if(globalHeight < element[0].offsetHeight) {
                            $(thumb).hide();
                        } else {
                            showThumb();
                        }

                        if(globalHeight < 2 * element[0].offsetHeight) {
                            var promise = chats.get(scope.msgScrollbarChat, true)
                            if (promise.success) {
                                promise.success(function() {
                                    scrollToEnd();
                                });
                            }
                        }

                    }, 0);

                }, true);


                /*
                 * If we switched into another chat just scrolled to end.
                 */
                scope.$watch('msgScrollbarChat', function(value) {
                    if(!value) return;
                    $(thumb).hide();
                    scrollToEnd();
                });

                /* ############ */




                /*
                 * Event binding.
                 */

                $(element).scroll(function() {

                    var _scrollTop = element.scrollTop();

                    if(!_scrollTop) {
                        var promise = chats.get(scope.msgScrollbarChat, true)
                        if (promise.then) {
                            promise.then(function(messages) {
                                updateThumb();
                            });
                        }
                    }

                    scrollArea.style.marginBottom = -_scrollTop + 'px';

                    updateThumb();
                });

                $(thumb).on('mouseover', function() { $(thumb).addClass('m--over'); });
                $(thumb).on('mouseout', function() { $(thumb).removeClass('m--over'); });

                var pressed = false;

                $(thumb).on('mousedown', function() {
                    pressed = true;
                    document.onselectstart = function() { return false; };
                });

                $(document).on('mouseup', function() {
                    pressed = false;
                    document.onselectstart = function() { return true; };
                });

                $(document).on('mousemove', function(e) {
                    if(pressed) {
                        changeScrollTop(-e.originalEvent.movementY);
                    }
                });

                $(track).on('mousedown', function(e) {

                    var topThumbOffset = parseInt( $(thumb).css('top') );
                    var offset = 0;

                    if(e.offsetY > topThumbOffset) {
                        offset = -Math.min(MAX_OFFSET, e.offsetY - topThumbOffset - $(thumb).height());
                    } else {
                        offset = Math.min(MAX_OFFSET, topThumbOffset - e.offsetY);
                    }

                    changeScrollTop(offset);
                });

                /* ############ */



            }
        }
    }]);