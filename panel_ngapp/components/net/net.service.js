'use strict';

angular.module('regidiumApp')
 .factory('Net', function ( config, $cookies, $location, $q, cfpLoadingBar ) { //$rootScope, $http, User, Customer
    return {
        //
        MSG_AUTH   : 1, // запрос на авторизацию в системе
        MSG_REG    : 2, // запрос на регистрацию в системе
        MSG_PING   : 3, // ping - pong - поддерживаем связь с сервером
        MSG_USER   : 4, // работа с операторами
        MSG_SP     : 5, // сообщения от клиентов
        MSG_CHAT   : 6, // сообщения от операторов
        //
        ACTION_ADD : 0, // добавить
        ACTION_DEL : 1, // удалить
        ACTION_UPD : 2, // обновить
        ACTION_ON  : 3, // активен
        ACTION_OFF : 4, // неактивен
        //
        ACTION_GET_CUSTOMER : 5,   // получить данные о customer
        ACTION_GET_WEBUSER  : 6,   // получить данные о webuser
        ACTION_SEND_INFO    : 7,   // рассылает информацию
        ACTION_GET          : 8,   // получить данные
        ACTION_CHAT         : 9,  // сообщения 
        ACTION_READED       : 10,  // сообщение было прочитано
        ACTION_TYPING       : 11,  // печатает
        ACTION_STATE        : 12,  // статус виджета
        ACTION_LINK         : 13,  // клиент перешел по ссылке
        ACTION_PRESENCE     : 14,  // присутствие
        ACTION_REROUTE      : 15,  // перенаправление чата
        //
        ACTION_SETTINGS     : 16,  // настройки виджета
        //
        socket     : null,
        timer      : 0,
        _reqs      : [],
        _promise   : null,
        _req_delta : 0,
        ready      : false,
        _auth      : 0,     // автоматическая аторизация
        Auth       : null,  // сервис авторизации
        //
        _send      : [],    // список данных которые нужно отправить
        //
        msg_auth   : null,
        msg_user   : null,
        msg_sp     : null,
        msg_chat   : null,
        // создаем соединение
        connect : function(){
            //
            if (this.socket!==null && this.socket.readyState!==1){
                if (this._reqs.length!==0){
                    var req = this._reqs.shift();
                    req.p.reject(ERRORS[1]);
                    this.next_req();
                }
                this.socket.close();
                this.socket = null;                   
            }
            //
            if (this.socket===null){
                this.ready = false;
                var s;
                var url = config.wsServer;
                if (location.origin.indexOf('localhost')!==-1){
                    url = config.wsServer_local; 
                }
                //|| location.origin.indexOf('file://')!==-1
                if (location.origin.indexOf('.dev.')!==-1){
                    url = config.wsServer_dev; 
                }
                var s = new WebSocket(url); 
                s.binaryType = 'arraybuffer';
                this.socket = s;
                //
                var a = this;
                s.onopen = function(){ a._onopen(); }
                s.onmessage = function(data){ a._message(data); }
                s.onclose = function(){ a._onclose(); }
            }
        },
        _timer : function(){
            // пингуем чтобы не потерять связь
            this._send_json([this.MSG_PING]);
            // если запрос длиться больше 5 сек то отменяет прошлый и запускаем новый
            var delta = Date.now() - this._req_delta;
            if (delta>10000){
                if (this._reqs.length!==0){
                    var req = this._reqs.shift();
                    req.p.reject(ERRORS[1]);
                    this.next_req();
                }
            }
            
        },
        _send_json : function (d){
            this.connect();
            if (this.ready){
              this.socket.send(JSON.stringify(d)); 
              //if (d.i!==this.MSG_PING){
                //cfpLoadingBar.start();
              //}
            }
        },
        _onopen  : function(){
            this.ready = true;
            if (this.Auth!==null) { this.Auth.auth(); }
            $('#connectionModal').modal('hide').remove('.modal-backdrop');
            this.send_next();
        },
        _onclose : function(){
            if (this._auth !== 0){
                $('#connectionModal').appendTo('body').modal('show');
            }
        },
        _message : function(_data){
            //cfpLoadingBar.complete();
            var a = JSON.parse(_data.data);
            //console.log(a);
            var type = parseInt(a.i);
            var sys  = parseInt(a.s);
            if (type===this.MSG_AUTH && a.err===0){
                this._auth = 1; // переходим в режим автоматической авторизации при потери связи
                var obj = this;
                clearInterval(this.timer);  
                this.timer = setInterval(function(){ obj._timer(); },5000);
            }
            //
            if (sys===1){ // пришло системное сообщение
                //console.log('sys',a);
                switch(type){
                    // аторизация
                    case this.MSG_AUTH: if (this.msg_auth!==null){ this.msg_auth(a); }
                                        break; 
                    // данные об операторах
                    case this.MSG_USER: if (this.msg_user!==null){ this.msg_user(a); }
                                        break; 
                    // данные об операторах
                    case this.MSG_SP  : if (this.msg_sp!==null){ this.msg_sp(a); }
                                        break; 
                    // чат
                    case this.MSG_CHAT: if (this.msg_chat!==null){ this.msg_chat(a); }
                                        break; 
                }
            }else{  // пришел ответ на прошлый запрос
                if (this._reqs.length!==0){
                    var req = this._reqs.shift();
                    var err = parseInt(a.err);
                    if (err===0){
                        req.p.resolve(a);
                    }else{
                        // подготавливаем развернутый ответ по ошибке
                        var err = {
                            n : a.err,              // номер
                            c : ERRORS[a.err][0],   // класс ошибки
                            t : ERRORS[a.err][1],   // текст
                        }
                        req.p.reject(err);
                    }
                    this.next_req();
                }
            }
        },
        next_req : function(){
            if (this._reqs.length!==0){
                var a = this._reqs[0];
                this._req_delta = Date.now();
                this._send_json(a.data);
            }
        },
        // отправляем запрос с ожиданиме ответа
        req : function(data){
            if (this._reqs.length===0 && this.ready){
                this._req_delta = Date.now();
                this._send_json(data);
            }
            var p = $q.defer();
            this._reqs.push({
                data : data,
                p    : p,
            });
            return p.promise;
        },
        // отправляем запрос без ожидания ответа
        send : function(data){
            this.connect();
            if (this.ready){
                this.socket.send(JSON.stringify(data)); 
            }else{
                this._send.push(data);
            }
        },
        send_next: function(){
            if (this._send.length===0){ return; }
            this.connect();
            if (this.ready){
                var data = this._send.pop();
                this.socket.send(JSON.stringify(data));
                this.send_next();
            }
        },        
        stop : function(){
            clearInterval(this.timer); 
            this.ready=false; 
            this._auth = 0;
            while (this._reqs.length!==0){
                var req = this._reqs.shift();
                req.p.reject(ERRORS[1]);
            }

            if (this.socket!==null){
                this.socket.close();
                this.socket = null;
            }
        },
        init : function(){
            this.stop();
            this.connect();
        },
    };
 });
