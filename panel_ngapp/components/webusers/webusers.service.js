angular.module('regidiumApp')
    .factory('webusers', function (Net, $http, notify, $rootScope) {
        var webUsers = [];
        var getWebUserTime = function (id, type) {

            var webuser = _.find(webUsers, {
                _id: id
            });
            var differenceTimeOnline, differenceTimeOffline, timepassed;
            if (webuser) {
                var entertime = new Date(webuser.entertime).getTime() - new Date(webuser.entertime).getTimezoneOffset(),
                    exittime = new Date(webuser.exittime).getTime() - new Date(webuser.exittime).getTimezoneOffset(),
                    nowTime = new Date().getTime() - new Date().getTimezoneOffset();


                if (type == 'ctrl') {
                    differenceTimeOnline = Math.floor((nowTime - entertime) / 1000 / 60);
                    differenceTimeOffline = Math.floor((exittime - entertime) / 1000 / 60);

                    timepassed = (webuser.online) ? differenceTimeOnline : differenceTimeOffline;
                } else {
                    timepassed = (webuser.online) ? nowTime - entertime : exittime - entertime;
                }
            }

            return timepassed;
        };

        return {
            webusers    : webUsers,
            init        : function() {
                            // TODO убрать, передавать список онлайн и оффлайн при авторизации оператора
                            $http.get('/api/webusers/offline?offset=0').success(function (offlineusers) {
                                webUsers.splice(0, webUsers.length);
                                webUsers.push.apply(webUsers, _.map(_.values(_.groupBy(offlineusers, '_id')), function (value) {
                                    return value[0];
                                }));
                            });
                            var obj = this;
                            Net.msg_sp = function(d){ 
                                obj.msg(d); 
                            };

                          },
            msg         : 
                          function(data){
                            var webuser = data.webuser;
                            switch(data.a){
                                case Net.ACTION_SEND_INFO:  //
                                            this.update(webuser);
                                            break;
                            }
                            $rootScope.$apply();
                        },
            update      : // обновляем данные о клиенте 
                          function(webuser){
                            var wu = _.find(webUsers, {_id: webuser._id});
                            if (webuser.online!==undefined){
                                if (!wu) {
                                    webUsers.push(webuser);
                                    if (webuser.online) { notify.userin(webuser); }
                                } else {
                                    if (wu.online && !webuser.online) { notify.userout(); }
                                    if (!wu.online && webuser.online) { notify.userin(webuser); }
                                }
                            }
                            if (wu) { 
                                wu.timepassed = this.getWebUserTime(wu._id);
                                _.assign(wu, webuser); 
                            }
                          },
            
                        
                          
            getWebUserTime: getWebUserTime,

            updateCountStopDialog: function (id) {
                            $http.put('/api/webusers/' + id, {stopdialog: true});
                          },
            block       : function (id) {
                            _.remove(webUsers, {_id: id});
                            $http.put('/api/webusers/' + id, {blocked: true, block_date: new Date().getTime()});
                          },
            unblock     : function (id) {
                            _.remove(webUsers, {_id: id});
                            $http.put('/api/webusers/' + id, {blocked: false, block_date: new Date().getTime()});
                            //Todo: надо както влиять на коллекцию
                          },
            get         : function (id) {
                            return _.find(webUsers, {_id: id});
                          },
            getBlocked  : function () {
                            return $http.get('/api/webusers/blocked');
                          }
        };
    });
