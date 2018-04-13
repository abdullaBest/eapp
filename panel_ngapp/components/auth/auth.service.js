'use strict';

angular.module('regidiumApp')
  .factory('Auth', function Auth( Net, $location, User, $cookies, $q, customer, operators, chats, webusers) {
    return {
        currentUser  : {}, // данные по пользователю
        operators    : [], // список всех операторов
        customer     : {}, // основные данные
        onError      : null,    // фнкция которая будет вызвана при ошибке
        newUser      : false,   // 
        // активируем систему авторизации
        init:  function(){
            var obj = this;
            Net.msg_auth = function (d){ obj.msg(d); }
            Net.Auth = this;
        },
        // Авторизириуем пользователя по токену
        auth: function(){
            var token = localStorage.getItem('regidium-token');
            if ($location.path()==='/login'){ return; }
            //var token = $cookies.get('token');
            if (token===undefined || token===null || token===''){
                $location.path('/login');
            }else{ // отправляем запрос
                Net.send({
                    i: Net.MSG_AUTH,
                    t: token,
                });
            }
        },
        // Авторизириуем пользователя по логину и паролю
        login: function(user) {
            Net.send({
                i: Net.MSG_AUTH,
                u: user.email,
                p: user.password,
                r: user.remember
            });
        },
        // удаляем токен и чистием данные по пользователю
        logout: function() {
            localStorage.setItem('regidium-token','');
            $cookies.remove('token');
            this.currentUser = {};
            this.operators = [];
            Net.stop();
            $location.path('/login');
        },
        // Создаем нового пользователя
        createCustomer: function(name,email,password,site) {
            Net.send({
                i        : Net.MSG_REG,
                name     : name,
                email    : email,
                password : password,
                site     : site,
            });
        },
        // TODO перевести на новый сервер 
      remindPassword: function(email, callback){
        var cb = callback || angular.noop;
        return User.remindPassword({email:email},
          function(res) {
            return cb(res);
          }, function(err) {
            return cb(err);
          }).$promise;
      },

        // возращает данные о текущем пользователе
        getCurrentUser: function() {
            return this.currentUser;
        },
        // возращает массив операторов
        getOperators: function() {
            return this.operators;
        },

        /**
        * Check if a user is logged in
        *
        * @return {Boolean}
        */
        isLoggedIn: function() {
            return this.currentUser.hasOwnProperty('email');
        },
        /**
        * TODO этот мегакостыль надо уничтожить!!!
        * Waits for currentUser to resolve before checking if user is logged in
        */
        isLoggedInAsync: function(cb) {
            if(this.currentUser.hasOwnProperty('$promise')) {
                this.currentUser.$promise.then(function() {
                    cb(true);
                }).catch(function() {
                    cb(false);
                });
            } else if(this.currentUser.hasOwnProperty('role')) {
                cb(true);
            } else {
                cb(false);
            }
        },

        /**
        * Check if a user is an admin
        *
        * @return {Boolean}
        */
        isAdmin: function() {
            return this.currentUser.role === 'admin';
        },
        /**
           * Get auth token
        */
        getToken: function() {
            return $cookies.get('token');
        },
        // сообщения с сервера
        msg : function(data){
            if (data.err!==0){ // зашли с другого аккаунта
                // под этим логином зашли с другого места
                if (data.err===13){
                    Net.stop();
                    this.logout();
                    localStorage.setItem('logout_warning', true);
                }else{
                    // подготавливаем развернутый ответ по ошибке
                    var err = {
                        n : data.err,              // номер
                        c : ERRORS[data.err][0],   // класс ошибки
                        t : ERRORS[data.err][1],   // текст
                    }
                    if (this.onError!==null){
                        this.onError(err);
                    }
                }
            }else{
                // авторизация прошла успешно
                localStorage.setItem('regidium-token',data.token);
                $cookies.put('token', data.token);
                this.currentUser = data.operator;
                this.operators   = data.operators;
                this.customer    = data.customer;
                //
                operators.init(this.currentUser,this.operators,this.customer.settings);
                webusers.init();
                chats.init();
                customer.init(this.customer);
                //
                var t = localStorage.getItem('notification');
                if (t===null){ localStorage.setItem('notification', 'show'); }
                t = localStorage.getItem('appBtn');
                if (t===null){ localStorage.setItem('appBtn', 'show'); }
                t = localStorage.getItem('siteCode');
                if (t===null){ localStorage.setItem('siteCode', 'show'); }
                //
                if ($location.path()==='/login'){ 
                    $location.path('/'); 
                }
                if ($location.path()==='/signup'){ 
                    $location.path('/'); 
                    this.newUser = true;
                    // принудительно выставляем метки
                    localStorage.setItem('notification', 'show'); 
                    localStorage.setItem('appBtn', 'show'); 
                    localStorage.setItem('siteCode', 'show'); 
                }
                // продолжаем цепочку вызовов
                Net.next_req();
            }
        }
    };
  });
