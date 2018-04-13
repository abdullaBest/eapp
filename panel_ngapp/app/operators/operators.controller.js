angular.module('regidiumApp')
    .controller('OperatorsCtrl', function ($scope, $state, $location, Net, operators, User, Departments, customer, chats, FileUploader) {

        var uploader = $scope.uploader = new FileUploader({
            autoUpload: true,
            removeAfterUpload: true
        });

        uploader.onProgressItem = function (fileItem, progress) {
            $scope.uploading = true;
            $scope.progress = progress;
        };

        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            $scope.modalform.image = response.image;
            $scope.isNewImg = true;
        };

        uploader.onCompleteItem = function (item) {
            $scope.uploading = false;
        };

        $scope.cancel = function () {
            uploader.cancelItem();
        };

        $scope.$watch('progress', function (value) {
            if (value === null) return;
            $scope.progress = value;
        });

        var currentModalWindow = null;

        // удаляем созданное до этого модальное окно
        var elem = document.querySelector('body > div.modal#addOperatorModal');
        if (elem!==null) { elem.remove(); }
        //
        currentModalWindow = angular.element('#addOperatorModal');
        currentModalWindow.appendTo('body');

        $scope.progress = 0;
        $scope.operators = operators.operators;
        $scope.operatorsAdded = $scope.operators.length;
        $scope.currentUser = {};
        $scope.departments = {};
        $scope.valid = true;
        $scope.errors = {};
        $scope.isNewImg = false;
        $scope.modalFormMode = 'create';
        $scope.operatorsBought = 10;
        $scope.uploading = false;
        $scope.standartImg = 'https://e2.tacdn.com/img2/generic/site/no_user_photo-v1.gif';

        $scope.regexEmail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|top|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

        $scope.$watchCollection('operators', function (newValue, oldValue) {
            if (newValue === null) return;
            $scope.operatorsAdded = newValue.length;
        });

        $scope.getOperatorOnlineTime = function (operator) {
            var temporaryTime = new Date(operator.exittime);

            var hour = temporaryTime.getHours() < 10 ? '0' + temporaryTime.getHours() : temporaryTime.getHours(),
                minute = temporaryTime.getMinutes() < 10 ? '0' + temporaryTime.getMinutes() : temporaryTime.getMinutes(),
                second = temporaryTime.getSeconds() < 10 ? '0' + temporaryTime.getSeconds() : temporaryTime.getSeconds();

            return temporaryTime.getDate() + "." + (temporaryTime.getMonth() + 1) + "." + temporaryTime.getFullYear() + " " + hour + ":" + minute + ":" + second;
        };

        customer.getActiveBill().success(function (data) {
            $scope.currentBill = data;
            $scope.operatorsBought = data.operators || 10;
        });

        operators.getOperator().then(function (currentUser) {
            $scope.currentUser = currentUser;
            $scope.isadmin = currentUser.isadmin;
            uploader.url = '/api/users/uploadimage/' + $scope.currentUser._id;
            $scope.operators = operators.operators;
            $scope.operatorsAdded = $scope.operators.length;
        });

        Departments.query().$promise.then(function (result) {
            $scope.departments[null] = '';
            for (var i = 0; i < result.length; i++) {
                $scope.departments[result[i]['_id']] = result[i]['name'];
            }
        }).then(function () {
            // определяем группу оператора
            $scope.getGroup = function (division) {
                return $scope.departments[division];
            };
        });

        $scope.getGroup = function (division) {
            return $scope.departments[division];
        };

        $scope.availableOperators = function () {
            return $scope.operatorsBought > $scope.operatorsAdded;
        };

        $scope.modalform = {
            division: 0,
            name    : '',
            jobtitle: '',
            email   : '',
            password: '',
            image   : 'https://e2.tacdn.com/img2/generic/site/no_user_photo-v1.gif',
            isadmin : false,
            blocked : false,
            sendmsg : false,
        };

        $scope.deleteImage = function () {
            $scope.modalform.image = 'https://e2.tacdn.com/img2/generic/site/no_user_photo-v1.gif';
            $scope.isNewImg = false;
        };

        $scope.new = function () {
            $(currentModalWindow).modal('show');
            $scope.modalform = {
                title   : 'Добавление оператора',
                division: null,
                name    : '',
                jobtitle: '',
                email   : '',
                password: '',
                image   : 'https://e2.tacdn.com/img2/generic/site/no_user_photo-v1.gif',
                isadmin : false,
                blocked : false,
                sendmsg : true,
            };
            $scope.modalFormMode = 'create';
        };

        $scope.edit = function (id) {
            $(currentModalWindow).modal('show');
            var op = _.find($scope.operators, {_id: id});

            $scope.modalform = {
                title   : 'Редактирование оператора',
                division: op.division,
                name    : op.name,
                jobtitle: op.jobtitle,
                email   : op.email,
                password: '',
                image   : op.image,
                isadmin : op.isadmin,
                id      : op._id,
                blocked : op.blocked,
                isMe    : $scope.currentUser._id === id,
                sendmsg : false,
            };
            $scope.isNewImg = $scope.modalform.image !== $scope.standartImg;

            $scope.modalFormMode = 'update';
        };

        $scope.$watch('modalform.email', function (newValue, oldValue) {
            if (newValue == null) return;

            if ($scope.regexEmail.test(newValue)) {
                $('.error-text').hide();
            }
        });

        $scope.$watch('valid', function (newValue, oldValue) {
            if (newValue == false) {
                $('.error-text').show();
            } else {
                $('.error-text').hide();
            }
        });

        $scope.getConversations = function (operatorid) {
            var operatorChats = chats.getOperatorChats(operatorid);
            console.log(operatorChats.length);
        };

        $scope.delete = function (id) {
            Net.req({
                i   : Net.MSG_USER,
                a   : Net.ACTION_DEL,
                id  : id,
            }).then(function(data){ 
                $(currentModalWindow).modal('hide');
            }).catch(function(err){
                $('.error-text').html(err.t).show();
            });       
        };

        $scope.submitForm = function (form) {
            $scope.submitted = true;
            if (form.$valid && $scope.regexEmail.test($scope.modalform.email) ) {

                var action = Net.ACTION_UPD; // редктируем существующую запись
                if ($scope.modalFormMode === 'create') {
                    action = Net.ACTION_ADD; //создаем нового оператора
                }
                Net.req({
                    i           : Net.MSG_USER,
                    a           : action,
                    id          : $scope.modalform.id,
                    email       : $scope.modalform.email,
                    password    : $scope.modalform.password,
                    division    : $scope.modalform.division,
                    name        : $scope.modalform.name,
                    blocked     : $scope.modalform.blocked,
                    image       : $scope.modalform.image,
                    jobtitle    : $scope.modalform.jobtitle,
                    isadmin     : $scope.modalform.isadmin,
                    sendmsg     : $scope.modalform.sendmsg,
                }).then(function(data){ 
                    $(currentModalWindow).modal('hide');
                }).catch(function(err){
                    $('.error-text').html(err.t).show();
                });
            } else {
                // сообщаем о ошибке
                $('.error-text').html(ERRORS[11][1]).show();
            }
        };

        $scope.$watch(function () {
            return location.hash;
        }, function (value) {
            // do stuff
            if (value === '#my') {
                setTimeout(function () {
                    $scope.edit($scope.currentUser._id);
                }, 0);
            }
        });

        angular.element('#addOperatorModal').on('hidden.bs.modal', function () {
            if ('my' === $location.hash()) {
                $location.url($location.path());

                // hidden.bs.modal fires out from $digest cycle. Need force update.
                $scope.$apply();
            }
        });
        setTimeout(function () {
            $("[data-toggle='tooltip']").tooltip()
        }, 0);

    });