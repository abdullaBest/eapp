angular.module('regidiumApp')
    .factory('operators', function(Net, User, customer, $rootScope, $q) {
        return {
            _deferred : $q.defer(),
            operators : [],
            settings  : {},
            user      : null,
            init      : function(_user,_operators,_settings){
                            this.user      = _user;
                            this.operators = _operators;
                            this.settings  = _settings;
                            this.user.exittime = new Date(this.user.exittime).getTime();
                            this._deferred.resolve(this.user);
                            var obj = this;
                            Net.msg_user = function(d){ obj.msg(d); }
                            this.user.online = true;
                            this.updateUser(this.user);
                        },

            setPresence: function(presence) {
                var action = Net.ACTION_OFF;
                if (presence){ action = Net.ACTION_ON; }
                Net.send({
                    i   : Net.MSG_USER,
                    a   : action,
                });
            },
            updateUser: function(data, callback) {
                var cb = callback || angular.noop;
                var op = _.find(this.operators, {_id:data._id});
                _.merge(op, data);
                return User.update({ id: data._id }, data, function(user) {
                    return cb(user);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            updateUserSettings: function(data, callback) {
                var cb = callback || angular.noop;
                var op = _.find(this.operators, {_id:data._id});
                _.merge(op, data);
                return User.update({ id: data._id }, data, function(user) {
                    return cb(user);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            //
            getOperator: function(){
                return this._deferred.promise;
            },

            getDepartmentMembers: function(department_id){
                return _.where(this.operators, {division:department_id});
            },
            // сообщения о изменениях в пользователях с сервера
            msg:function(data){
                var opr = data.operator;
                switch(data.a){
                    case Net.ACTION_ADD:
                                        this.operators.push(opr);
                                        break;
                    case Net.ACTION_UPD:
                                        for (var i=0;i<this.operators.length;i++){
                                            var op = this.operators[i];
                                            if (op._id===opr._id){
                                                this.operators[i] = opr;
                                                break;
                                            }
                                        }
                                        break;
                    case Net.ACTION_DEL:
                                        for (var i=0;i<this.operators.length;i++){
                                            var op = this.operators[i];
                                            if (op._id===opr._id){
                                                this.operators.splice(i,1);
                                                break;
                                            }
                                        }
                                        break;
                    case Net.ACTION_ON:
                                        for (var i=0;i<this.operators.length;i++){
                                            var op = this.operators[i];
                                            if (op._id===opr._id){
                                                op.online = true;
                                                break;
                                            }
                                        }
                                        break;
                    case Net.ACTION_OFF:
                                        for (var i=0;i<this.operators.length;i++){
                                            var op = this.operators[i];
                                            if (op._id===opr._id){
                                                op.online = false;
                                                break;
                                            }
                                        }
                                        break;
                    case Net.ACTION_SETTINGS:{
                                        customer.update_settings(data.data);
                                        }
                                        break;
                }
                $rootScope.$apply();
            }
        };
    });
