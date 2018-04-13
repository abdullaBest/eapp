"use strict";
angular.module('regidiumApp')
    .run(
        ['$rootScope', 'amMoment',
            function ($rootScope, amMoment) {
                amMoment.changeLocale('ru');
            }
        ]
    )
    .controller('ChatsCtrl', function ($scope, $http, chats, operators, webusers, $filter, FileUploader) {


        /* INIT */

        /*var uploader = $scope.uploader = new FileUploader({
         autoUpload: true
         });*/

        $scope.chats = chats.chats;
        $scope.activeChat = chats.active;
        $scope.showUserInfo = true;
        $scope.newMessage = '';
        $scope.operators = operators.operators;
        $scope.currentUser = {};
        $scope.typing = false;
        $scope.lastTyping = false;
        $scope.webusers = webusers.webusers;
        $scope.name = '';
        $scope.all_chats = chats;
        $scope.unreaded_chats = chats.unreaded.chats;
        $scope.invisible_unreaded = 0;
        $scope.reverse = false;
        $scope.orderedChats = [];
        $scope.scroll = false;
        $scope.onlineOperators = [];

        operators.getOperator().then(function (currentUser) {
            $scope.currentUser = currentUser;
        });

        /* ############ */


        /* PRIVATE METHODS */

        var updateInvisibleUnreaded = function () {

            var chatEl = angular.element('.chat')[0]

            if (!chatEl) return

            var visibleChatsNum = Math.min(
                Math.floor(chatEl.clientHeight / 70),
                $scope.orderedChats.length
            );

            var visible_unreaded = 0;

            for (var i = 0; i < visibleChatsNum; i++) {
                if ($scope.orderedChats[i].unreaded) {
                    visible_unreaded++;
                }
            }

            $scope.invisible_unreaded = $scope.unreaded_chats - visible_unreaded;
        };

        /* ############ */


        /* WATCHING */

        $scope.$watch('all_chats.unreaded.chats', function (newValue) {
            if (newValue === null) return false;
            $scope.unreaded_chats = newValue;
        });

        $scope.$watch('chats', function (newValue, oldValue) {
            if (newValue === null) return;
            if (!newValue.length) return;
            $scope.orderedChats = _.sortBy($scope.chats, 'last_message_time').reverse();
            updateInvisibleUnreaded();
        }, true);

        $scope.$watchCollection('chats', function () {
            if (!$scope.activeChat && $scope.chats.length > 0) {
                chats.setActive($scope.chats[0]);
                $scope.activeChat = chats.active;
            }
        });

        $scope.$watch('activeChat.messages', function (newValue, oldValue) {
            if (newValue === undefined) return;
            if (oldValue === undefined) return;
            if (!newValue.length || !oldValue.length) return;
            if (new Date(oldValue[oldValue.length - 1].time).getTime() < new Date(newValue[newValue.length - 1].time).getTime()) {
                $scope.scrollToEnd();
            }
        }, true);

        $scope.$watch('activeChat.preview', function (value, old) {
            if (value === undefined) return;
            if (old === undefined) return;
            $scope.scrollToEnd();
        });

        $scope.$watch('operators', function (value) {
            if (value === undefined) return;
            value.forEach(function (item) {
                if (item.online && $scope.currentUser._id !== item._id) {
                    $scope.onlineOperators.push(item);
                }
            })
        }, true);

        /* ############ */


        /* PUBLIC METHODS */

        $scope.sendMessage = function () {
            var regexTag = /(<([^>]+)>)/ig;
            if ($scope.newMessage.length === 0 || regexTag.test($scope.newMessage)) {
                return false;
            }

            chats.send($scope.activeChat, $scope.newMessage, $scope.currentUser._id);
            $scope.newMessage = '';
            $scope.scrollToEnd();
            angular.element('#newMessage').focus();
        };

        $scope.keypress = function (event) {
            if (event.keyCode === 0xA || event.keyCode === 0xD) {
                event.preventDefault();
                if (event.shiftKey) {
                    //shift+enter переход строки
                    $scope.newMessage += '\n';
                } else {
                    //отправка
                    $scope.sendMessage();
                }
            }

            $scope.typing = true;
        };

        $scope.getWebuserName = function (name, type) {
            var firstChar, secondChar;

            $scope.name = type == 'image' ? 'А' : 'Посетитель';
            if (name) {
                name = name.trim();
                if (type == 'image') {
                    if (name.split(' ').length > 1) {
                        firstChar = name.split(' ')[0].split('');
                        secondChar = name.split(' ')[1].split('');
                        $scope.name = firstChar[0] + secondChar[0];
                    } else {
                        firstChar = name.split('');
                        $scope.name = firstChar[0];
                    }
                } else {
                    $scope.name = name;
                }
            }

            return $scope.name;
        };

        $scope.getOperatorName = function (id) {
            if (id) return _.find(operators.operators, {_id: id}).name;
        };

        $scope.getOperatorName = function (id) {
            var operator = _.find(operators.operators, {_id: id});
            return operator ? operator.name : '';
        };

        $scope.getWebusername = function (chat) {
            if (!chat) return;
            if (!chat.webuser) return "Анонимус";
            if (chat.webuser.name) {
                return chat.webuser.name;
            } else if (chat.webuser.email && !chat.webuser.name) {
                return chat.webuser.email;
            } else if (!chat.webuser.name && !chat.webuser.email) {
                return "Анонимус";
            }
        };

        $scope.selectChat = function (chat) {
            //if (chat._id === $scope.activeChat._id) return;
            if (chat.webuserid === $scope.activeChat.webuserid) return;
            $scope.scroll = chat === $scope.activeChat;
            $scope.activeChat = undefined;
            chats.setActive(chat);
            $scope.activeChat = chats.active;
            if (!$scope.scroll) {
                $scope.scrollToEnd();
            }

        };

        $scope.reroute = function (id) {
            chats.reroute($scope.activeChat.webuserid, id);
            $scope.activeChat = undefined;
        };

        $scope.stopDialog = function (chat) {

            $("[data-toggle='tooltip']").tooltip('hide');

            chats.stop(chat.webuserid);
            chats.closeChat(chat.webuserid, $scope.currentUser._id);
            $http.put('/api/chats/conversation', chat);

            webusers.updateCountStopDialog($scope.activeChat.webuserid);

            if ($scope.activeChat._id === chat._id) {
                $scope.activeChat = undefined;
            }
            _.remove($scope.chats, {webuserid: chat.webuserid});
        };

        $scope.isToday = function (day) {
            return new Date().getDate() === new Date(day).getDate();
        };

        $scope.blockWebuser = function (chat) {
            var webuserid = chat.webuserid;
            $scope.stopDialog(chat);
            webusers.block(webuserid);
        };

        /* ############ */


        /* EVENTS */

        angular.element(window).on('resize', function () {
            updateInvisibleUnreaded();
        });

        $scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
            $(element).addClass('scrollable');
        });

        /* ############ */


        /* ASYNCHRONIOUS BLOCK */

        setInterval(function () {
            if ($scope.activeChat && $scope.typing !== $scope.lastTyping) {
                chats.typing($scope.activeChat.webuserid, $scope.typing);
                $scope.lastTyping = $scope.typing;
            }
            $scope.typing = false;
        }, 1000);

        setTimeout(function () {
            $scope.scrollToEnd();
        }, 1000);

        setTimeout(function () {
            $scope.activeChat = $scope.orderedChats[0];
            $("[data-toggle='tooltip']").tooltip();
            angular.element("[data-toggle='tooltip']").tooltip();
            angular.element('.right-block').removeClass('col-wide-left');

            if ($('.__with-info')[0]) {
                $('.js-watch-height').css('height', 'calc(100vh - 171px)');
                $('.list-group-operators').css('max-height', 'calc(100vh - 171px)');
            }
        }, 0);

        $scope.scrollToEnd = function () {
            var ca = angular.element('.rw-messages__list');
            setTimeout(function () {
                if (ca[0]) {
                    ca[0].scrollTop = ca[0].scrollHeight;
                }
            }, 0);
        };

        /* ############ */


    });