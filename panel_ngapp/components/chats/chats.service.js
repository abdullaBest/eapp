'use strict';
angular.module('regidiumApp')
    .factory('chats', function (Net, operators, $http, webusers, notify, $state, $rootScope, $filter, moment) {

        var needMessage = null;
        var lastMessageIndex;

        return {
            chats       : [],
            unreaded    : { counter: 0, chats: 0 },
                          // активный чат
            active      : undefined,     
                          // парсит список сообщений в чате           
            parse_msg   : function(chat,messages){
                            var regExLink = /(http(s)?:\/\/www[\.]?|)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/g;
                            for (var j=0;j<messages.length;j++) {
                                var msg = messages[j];
                                if (j === 0 || new Date(msg.dtime).getDate() !== new Date(messages[j - 1].dtime).getDate()) {
                                    msg.show_date = true;
                                }
                                var newText = [];
                                 var text = msg.text;
                                 if (text===undefined){ text=''; }
                                 var textChap = text.split(' ');

                                for (var k=0; k<textChap.length; k++) {
                                    newText.push({
                                        text    : textChap[k],
                                        isMatch : textChap[k].match(regExLink)
                                    });
                                }
                                chat.messages.push({
                                    system    : msg.type === 'aareply',
                                    from      : msg.direction === 'w2o' ? msg.webuser  : msg.operator,
                                    to        : msg.direction === 'w2o' ? msg.operator : msg.webuser,
                                    text      : text,
                                    time      : new Date(msg.dtime),
                                    type      : msg.direction === 'w2o' ? 1 : 2,
                                    readed    : msg.readed,
                                    url       : newText,
                                    show_date : msg.show_date
                                });

                                if (msg.direction === 'w2o' && !msg.readed) {
                                    chat.unreaded++;
                                    this.unreaded.counter++;
                                    if (chat.unreaded > 0) {
                                        this.unreaded.chats++;
                                    }
                                }
                            }
                            if (messages.length!==0){
                                chat.last_message_time = Date.parse(_.last(messages).dtime);
                            }
                        },
            init        : function () {
                            var self = this;
                            // запрашиваем список чатов
                            // TODO перенести эти данные в auth_ok так как они все равно автоматически запрашиваются каждый раз
                            Net.req({
                                i : Net.MSG_CHAT,
                                a : Net.ACTION_GET
                            }).then(function(data){ 
                                var chats = data.chats;
                                for (var i=0;i<chats.length;i++) {
                                    self.set_chat(chats[i]);
                                }
                            }).catch(function(err){
                            });
                            //
                            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                                if (self.active===undefined){return;}
                                if (toState.name === 'app.chats' && self.active) {
                                    if (self.active.unreaded) {
                                        self.unreaded.counter -= self.active.unreaded;
                                        self.unreaded.chats--;
                                    }
                                    self.active.unreaded = 0;
                                    notify.unreaded(self.unreaded.counter);
                                    self.system(self.active.webuser._id, 'readed');
                                }
                            });
                            //
                            Net.msg_chat = function(d){ self.msg(d); }
                            if (window.IPC!==undefined){
                                window.IPC.on('chat', function(e,data){
                                    var id = data.id;
                                    var text = data.text;
                                    var chat = _.find(self.chats, {webuserid: id});
                                    self.send(chat,text,operators.user._id);
                          
                                });
                            }
                        }, 
            automsg : function(chat,type,text){
                        if (text!==null) {
                            needMessage = {
                                system  : (type === 'aareply'),
                                text    : 'В ответ на автоматическое сообщение: ' + text,
                                time    : new Date(),
                                type    : type
                            };
                            if (new Date(needMessage.time).getDate() === chat.messages[chat.messages.length - 1]) {
                                needMessage.show_date = true;
                            }
                        } else {
                            needMessage = null;
                        }
                    },
            msg     : function(_data){
                        var data       = _data.data;
                        var webuser_id = data.from;
                        var chat       = _.find(this.chats, {webuserid: webuser_id});            
                        var action     = _data.a;
                        switch (action){
                            case Net.ACTION_CHAT    : // пришло сообщение
                                                        this.onmessage(data);
                                                    break;
                            case Net.ACTION_READED  :  // клиент прочитал сообщения
                                                    if (chat){
                                                        chat.messages.forEach(function (item) {
                                                            item.readed = true;
                                                        });
                                                    }
                                                    break;
                            case Net.ACTION_TYPING  : // клиент набирает текст
                                                    if (chat){
                                                       chat.preview = data.data;
                                                    }
                                                    break;
                            case Net.ACTION_STATE   : 
                                                    if (chat){
                                                        var state = data.data;
                                                        var text  = state === 'open' ? 'Посетитель открыл чат' : 'Посетитель свернул чат';
                                                        chat.messages.push({
                                                            system : true,
                                                            text   : text,
                                                            time   : new Date(),
                                                        });
                                                    }
                                                    break;
                            case Net.ACTION_LINK   :
                                                    if (chat){
                                                        var state = data.data;
                                                        chat.messages.push({
                                                            system  : true,
                                                            text    : state === 'goto' ? 'Посетитель перешел по ссылке' : "",
                                                            time    : new Date()
                                                        });
                                                    }
                                                    break;
                            case Net.ACTION_PRESENCE:
                                                    if (chat){
                                                        var online = data.data;
                                                        chat.messages.push({
                                                            system  : true,
                                                            text    : online ? 'Посетитель вернулся на сайт' : 'Посетитель покинул сайт',
                                                            time    : new Date()
                                                        });
                                                    }
                                                    break;
                            case Net.ACTION_REROUTE: // перенаправили чат 
                                                    {
                                                        _.remove(this.chats, {webuserid: data.webuser._id});
                                                        var chat = this.set_chat(data);
                                                        chat.unreaded++;
                                                        this.unreaded.counter++;
                                                        if (chat.unreaded > 0) {
                                                            this.unreaded.chats++;
                                                        }
                                                        notify.message(data);
                                                        notify.unreaded(this.unreaded.counter);
                                                    }
                                                    break;
                        }
                        $rootScope.$apply();
                    },
            onmessage : function(data){
                        data.time = new Date(data.time);
                        data.type = 1;
                        var chatitem = _.find(this.chats, {webuserid: data.from});
                        if ( chatitem ) {
                            chatitem.last_message_time = data.time;
                            if (chatitem.messages.length!==0){
                                lastMessageIndex = chatitem.messages.length - 1;
                                data.show_date = !(data.time.getDate() === chatitem.messages[lastMessageIndex].time.getDate());
                                data.new_msg = moment(data.time).diff(moment(chatitem.messages[lastMessageIndex].time), 'minutes') > 10;
                            }else{
                                data.show_date = true;
                                data.new_msg = true;
                            }
    
                            chatitem.messages.push(data);
                            if (this.active && this.active.webuserid === chatitem.webuserid && $state.current.name === 'app.chats') {
                                //пришло в активный чат
                                this.system(this.active.webuserid, 'readed');
                            } else {
                                chatitem.unreaded++;
                                this.unreaded.counter++;
                                if (chatitem.unreaded > 0 && chatitem.unreaded < 2) {
                                    this.unreaded.chats++;
                                }
                            }
                        } else {
                            if (needMessage === null) {
                                data.show_date = true;
                                this.chats.unshift({
                                    webuserid   : data.from,
                                    webuser     : webusers.get(data.from),
                                    messages    : [data],
                                    unreaded    : 1,
                                    preview     : '',
                                    last_message_time: Date.now(),
                                    color       : '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
                                });
                            } else {
                                this.chats.unshift({
                                    webuserid   : data.from,
                                    webuser     : webusers.get(data.from),
                                    messages    : [needMessage, data],
                                    unreaded    : 1,
                                    preview     : '',
                                    last_message_time: Date.now(),
                                    color       : '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
                                });
                            }
                            this.unreaded.counter++;
                            this.unreaded.chats++;
                        }
                        notify.message(data);
                        notify.unreaded(this.unreaded.counter);
                        //
                        if (window.IPC!==undefined){
                            chatitem = _.find(this.chats, {webuserid: data.from});
                            window.IPC.send('message', chatitem);
                        }
                        //
            },
            // пришли данные о новом чате 
            set_chat : function(a){
                        var webuserid = a.webuser._id;
                        if (!_.find(webusers.webusers, {_id: webuserid })) {
                            webusers.update(a.webuser);
                        }
                        // подгружаем чат если он существует
                        var chat_old = _.find(this.chats, {webuserid: webuserid});
                        if (chat_old){
                            // обновляем счетчики
                            if (chat_old.unreaded) {
                                this.unreaded.counter -= chat_old.unreaded;
                                this.unreaded.chats--;
                            }
                            notify.unreaded(this.unreaded.counter);
                            // удаляем старый чат
                            _.remove(this.chats, {webuserid: webuserid});
                        }
                        // создаем новый
                        var chat = {
                            _id               : a._id,
                            webuserid         : webuserid,
                            webuser           : webusers.get(webuserid),
                            messages          : [],
                            unreaded          : 0,
                            preview           : '',
                            page              : 1,
                            color             : '#' + Math.random().toString(16).slice(2, 8).toUpperCase(),
                            last_message_time : 0,
                        }
                        if (this.active && this.active.webuserid===webuserid){
                            this.active = chat;
                        }
                        this.parse_msg(chat,a.messages);
                        this.chats.unshift(chat);
                        return chat;
            },
/*
                socket.socket.on('system', function (data) {
                    data = JSON.parse(data);
                    var chat = _.find(this.chats, {webuserid: data.from});

                    if (data.text !== undefined) {
                        needMessage = {
                            system: (data.type === 'aareply'),
                            text: 'В ответ на автоматическое сообщение: ' + data.text,
                            time: new Date(),
                            type: data.type
                        };
                        if (!chat || new Date(needMessage.time).getDate() === chat.messages[chat.messages.length - 1]) {
                            needMessage.show_date = true;
                        }
                    } else {
                        needMessage = null;
                    }

                    if (chat) {

                        switch (data.type) {
                            case 'aareply':
                                chat.messages.push(needMessage);
                                break;
                        }

                    } else {

                    }

                });


*/

            system: function (webuserid, type) {
                Net.send({
                    i    : Net.MSG_CHAT,
                    a    : Net.ACTION_SEND_INFO,
                    type : type,
                    to   : webuserid
                });
            },
            send: function (actChat, text, operator) {
                var regexTag = /(<([^>]+)>)/ig;
                if (regexTag.test(text)) return false;
                
                Net.send({
                    i    : Net.MSG_CHAT,
                    a    : Net.ACTION_CHAT,
                    text : text,
                    to   : actChat.webuserid
                });
                var regExLink = /(http(s)?:\/\/www[\.]?|)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/g;
                var newText = [];

                var textChap = text.split(' ');

                for (var i = 0; i < textChap.length; i++) {
                    newText.push({
                        text: textChap[i],
                        isMatch: textChap[i].match(regExLink)
                    });
                }

                var msg = {
                    from      : operator,
                    to        : actChat.webuserid,
                    text      : text,
                    time      : new Date(),
                    type      : 2,
                    url       : newText,
                    show_date : false
                };
                var lastMessageIndex = actChat.messages.length - 1;
                if (actChat.messages.length === 0 || !(msg.time.getDate() === actChat.messages[lastMessageIndex].time.getDate())) {
                    msg.show_date = true;
                }

                for (var j = 0; j < actChat.messages.length; j++) {
                    if (actChat.messages[j].new_msg) {
                        actChat.messages[j].new_msg = false;
                    }
                }
                actChat.last_message_time = msg.time;
                actChat.messages.push(msg);
            },
            get: function (chat, flag) {
                if (chat && chat._id) {
                    var promise = $http.get('/api/chats/chat-history/' + chat._id + '/' + chat.page + '/?messages=' + (chat.messages.length ? chat.messages.length : 0)).success(function (data) {
                        chat.page++;
                        if (data.length > 0) {
                            data[0].show_date = true;
                        }
                        for (var j = data.length - 1; j >= 0; j--) {
                            chat.messages[0].show_date = new Date(chat.messages[0].time).getDate() !== new Date(data[j].dtime).getDate();
                            var currentMessage = data[j];
                            chat.messages.unshift({
                                system: (currentMessage.type === 'aareply'),
                                from: currentMessage.direction === 'w2o' ? currentMessage.webuser : currentMessage.operator,
                                to: currentMessage.direction === 'w2o' ? currentMessage.operator : currentMessage.webuser,
                                text: currentMessage.text,
                                time: new Date(currentMessage.dtime),
                                type: currentMessage.direction === 'w2o' ? 1 : 2,
                                readed: currentMessage.readed,
                                show_date: currentMessage.show_date
                            });
                        }

                    });

                    if (flag) {
                        return promise;
                    }
                }
                return _.find(this.chats, {webuserid: chat.webuserid});
            },

            start: function (webuserid) {
                this.active = _.find(this.chats, {webuserid: webuserid});
                if (this.active) {
                    this.system(webuserid, 'active');
                } else {
                    // создаем новый чат
                    this.chats.push({
                        webuserid   : webuserid,
                        webuser     : webusers.get(webuserid),
                        messages    : [],
                        unreaded    : 0,
                        preview     : '',
                        color       : '#' + Math.random().toString(16).slice(2, 8).toUpperCase(),
                        last_message_time : null,
                    });
                    this.setActive(this.chats[this.chats.length - 1]);
                }
            },

            setActive: function (chat) {
                if (chat) {
                    this.active = _.find(this.chats, {webuserid: chat.webuserid});
                    if (this.active) {
                        if (this.active.messages.length) {
                            var current = this.active;
                            for (var i = 0; i <= current.messages.length - 1; i++) {
                                if (current.messages[i].new_msg) {
                                    var new_msg = current.messages[i];
                                    setTimeout(function () {
                                        new_msg.new_msg = false;
                                    }, 3000);
                                }
                            }
                        }

                        if (this.active.unreaded > 0) {
                            this.unreaded.counter -= this.active.unreaded;
                            this.unreaded.chats -= 1;
                        }
                        this.active.unreaded = 0;
                        notify.unreaded(this.unreaded.counter);
                        this.system(chat.webuserid, 'active');
                        this.system(chat.webuserid, 'readed');
                    }
                }
            },

            reroute: function (webuserid, operatorid) {
                        this.stop(webuserid);
                        Net.send({
                            i        : Net.MSG_CHAT,
                            a        : Net.ACTION_REROUTE,
                            webuser  : webuserid,
                            operator : operatorid
                        });
                        if (this.active.webuserid === webuserid) {
                            this.setActive(undefined);
                        }
                    },

            stop: function (webuserid) {
                var chat = _.find(this.chats, {webuserid: webuserid});
                if (chat.unreaded) {
                    this.unreaded.counter -= chat.unreaded;
                    this.unreaded.chats--;
                }
                if (this.active && this.active.webuserid===webuserid){
                    this.active = undefined;
                }
                notify.unreaded(this.unreaded.counter);
                _.remove(this.chats, {webuserid: webuserid});
                this.system(webuserid, 'unactive');
            },
            // закрываем чат с пользователем
            closeChat: function (webuserid, operatorid) {
                Net.send({
                    i        : Net.MSG_CHAT,
                    a        : Net.ACTION_STATE,
                    webuser  : webuserid,
                    operator : operatorid,
                });
            },

            typing: function (webuserId, isTyping) {
                if (isTyping){
                    this.system(this.active.webuser._id, 'typingon');
                }else{
                    this.system(this.active.webuser._id, 'typingoff');
                }
            }
        };

    });
