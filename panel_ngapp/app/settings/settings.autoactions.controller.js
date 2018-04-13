'use strict';

angular.module('regidiumApp')
    .controller('SettingsAutoactionsCtrl', function ($scope, customer, $http, operators) {

        var elems = $('body > div.modal');
        var currentModalWindow = null;
        var sound,
            soundSupport = false;
        $scope.isAdmin = false;

        if (elems.length) {
            for (var index = 0; index < elems.length; index++) {
                if ($(elems[index]).attr('id') === 'editModal')
                    $(elems[index]).remove();
            }
        }
        currentModalWindow = angular.element('#editModal');
        currentModalWindow.appendTo('body');

        $scope.chooseSound = function (file, cb) {
            $scope.srcMp3 = 'https://my.regidium.com/assets/sounds/' + file + '.mp3';
            $scope.srcWav = 'https://my.regidium.com/assets/sounds/' + file + '.wav';

            try {
                soundSupport = !!(document.createElement('audio').canPlayType);
                if (soundSupport) {
                    sound = document.createElement('audio');
                    sound.id = 'sound';
                    sound.innerHTML = '<source src="' + $scope.srcMp3 + '" type="audio/mpeg" /><source' +
                        ' src="' + $scope.srcWav + '" type="audio/wave" />';
                    sound.load();
                    sound.volume = 0.1;
                }
            } catch (e) {
                soundSupport = false;
            }

            cb();
        };

        $scope.playSound = function () {
            if (soundSupport) {
                sound.play();
                return true;
            } else {
                return false;
            }
        };

        $scope.actions = [];
        $scope.myForm = null;
        $scope.modalFormMode = 'create';
        $scope.modalFormActionId = null;

        $http.get('/api/actions').success(function (actions) {
            $scope.actions.push.apply($scope.actions, actions);
        });

        $scope.active = function (action) {
            $http.put('/api/actions/' + action._id + '/active', {active: action.active});
        };

        $scope.countries = [];
        $scope.countriesList = [];
        $scope.cities = [];
        $scope.citiesList = [];
        $scope.countryId = null;
        $scope.editName = true;

        $http.get('/api/users/countries').success(function (countries) {
            $scope.countries = _.pluck(countries, 'name');
            $scope.countriesList.push.apply($scope.countriesList, countries);
        });

        $http.get('/api/users/cities').success(function (cities) {
            $scope.cities = _.pluck(cities, 'name');
            $scope.citiesList.push.apply($scope.citiesList, cities);
        });

        $scope.conditionsTypes = {
            'default': 'Выбрать условие',
            'number_page': 'Количество ' +
            'просмотренных страниц',
            'url': 'URI страницы',
            'time': 'Время на сайте',
            'time_message': 'Время от сообщения посетителя',
            'number_visits': 'Количество визитов на сайт',
            'time_page': 'Количество проведенных чатов', // поменять key для события и на сервере внести изменения
            'country': 'Страна',
            'city': 'Город',
            'week_day': 'День недели'
        };

        $scope.actionsTypes = {
            'default': 'Выбрать действие',
            'openmessage': 'Открыть виджет и написать сообщение',
            'playsound': 'Воспроизвести звук'
        };

        $scope.actionsTypePlaysound = {
            'default': 'Выбрать звук',
            'coin_echo': 'Монета',
            'connect_echo': 'Эхо',
            'guitar_arrpegio': 'Гитара',
            'sound-connect': 'Соединение',
            'tambourine': 'Тамбурине',
            'cash-machine': 'Кассовый аппарат',
            'bicycle-horn': 'Велосипедный гудок',
            'toggle-switch': 'Тумблер'
        };

        $scope.conditionsComparsion = {
            'default': '',
            'lt': '<',
            'gt': '>',
            'eq': '='
        };

        $scope.conditionsComparsionUrl = {
            'default': '',
            'eq': '=',
            'not_equal': '≠',
            'contains': 'Содержит'
            // 'not_contains': 'Не содержит'
        };

        $scope.conditionsComparsionDay = {
            'default': '',
            'mon': 'Понедельник',
            'tue': 'Вторник',
            'wed': 'Среда',
            'thu': 'Четверг',
            'fri': 'Пятница',
            'sat': 'Суббота',
            'sun': 'Воскресенье'
        };

        $scope.actionsRepetition = {
            'default': 'Выбрать условие',
            'once_per_session': 'Один раз за сессию',
            'once_all_time': 'Один раз за все время',
            'always': 'Каждый раз при перезагрузке страницы'
        };

        $scope.modalform = {
            active: true,
            conditions: [{
                type: 'default'
            }],
            conditionsbl: 'or',
            operatorstatus: 'always',
            name: '',
            actiontype: 'default',
            actiontypeplaysound: 'coin_echo',
            message: '',
            repetition: 'default'
        };

        $scope.addCondition = function () {
            $scope.modalform.conditions.push({
                type: 'default'
            });
        };

        $scope.actionPlaySound = function () {
            var $audio = new Audio();
            $audio.src = '/sounds/signal_' + $scope.modalform.actiontypeplaysound + '.mp3';

            if ($audio.paused) {
                $audio.play();
            } else {
                $audio.currentTime = 0
            }
        };

        $scope.changeCountryValid = function (a, b, c) {
            console.log(a, b, c);
        };

        $scope.setOperatorStatus = function (name) {
            $scope.modalform.operatorstatus = name;
        };

        $scope.setBLogic = function (name) {
            $scope.modalform.conditionsbl = name;
        };

        $scope.editNameStatus = function (status) {
            $scope.editName = status;
        };

        $scope.addAction = function () {
            $(currentModalWindow).modal('show');
            $scope.editName = true;
            $scope.modalFormMode = 'create';
            $scope.modalform = {
                active: true,
                conditions: [{
                    type: 'default'
                }],
                conditionsbl: 'or',
                operatorstatus: 'always',
                name: '',
                actiontype: 'default',
                repetition: 'default',
                actiontypeplaysound: 'coin_echo',
                message: '',
                modal_name: 'Добавление автоматических действий'
            };
        };


        $scope.deleteCondition = function (condition) {
            $scope.modalform.conditions.splice($scope.modalform.conditions.indexOf(condition), 1);
        };


        $scope.editAction = function (id) {
            $(currentModalWindow).modal('show');
            var actionForEdit = _.find($scope.actions, {_id: id});
            $scope.editName = false;
            $scope.modalFormMode = 'update';
            $scope.modalFormActionId = id;

            $scope.modalform = {
                active: actionForEdit.active,
                conditions: _.clone(actionForEdit.conditions),
                conditionsbl: actionForEdit.conditionsbl,
                operatorstatus: actionForEdit.operatorstatus,
                name: actionForEdit.name,
                actiontype: actionForEdit.actiontype,
                repetition: actionForEdit.repetition,
                actiontypeplaysound: actionForEdit.message,
                message: actionForEdit.message,
                modal_name: 'Настройка автоматических действий'
            };
        };

        $scope.$watch('modalform', function (newValue, oldValue) {
            if (newValue == null) return false;
            for (var key in $scope.modalform.conditions) {
                var condition = newValue.conditions[key];
                if (condition.value) {
                    if (condition.type == 'country') {
                        $scope.country = _.find($scope.countriesList, {name: condition.value});
                        $scope.countryId = $scope.country.country_id;
                    }
                }
            }
        }, true);

        $scope.saveAction = function () {
            // if (!$scope.myForm.$valid) {
            //   return false;
            // }

            // Сохраняем путь к музыке в поле "message".
            if ($scope.modalform.actiontype == 'playsound') {
                $scope.modalform.message = $scope.modalform.actiontypeplaysound;
            }

            for (var condition_key in $scope.modalform.conditions) {
                var condition = $scope.modalform.conditions[condition_key];

                switch (condition.type) {
                    case 'country':
                        $scope.modalform.conditions[condition_key].data = _.find($scope.countriesList, {name: condition.value});
                        $scope.modalform.conditions[condition_key].comparsion = 'eq';
                        break;

                    case 'city':
                        $scope.modalform.conditions[condition_key].data = _.find($scope.citiesList, {name: condition.value});
                        $scope.modalform.conditions[condition_key].comparsion = 'eq';
                        break;
                }
            }

            if ($scope.modalFormMode === 'create') {
                // Create.
                $http.post('/api/actions', $scope.modalform).success(function (newAction) {
                    $scope.actions.push(newAction);
                    $(currentModalWindow).modal('hide').remove('.modal-backdrop');

                });
            } else {
                // Update.
                $http.put('/api/actions/' + $scope.modalFormActionId, $scope.modalform).success(function (newAction) {
                    _.assign(_.find($scope.actions, {_id: $scope.modalFormActionId}), $scope.modalform);

                    $(currentModalWindow).modal('hide').remove('.modal-backdrop');

                })
            }
        };

        $scope.deleteAction = function (id) {
            if (confirm('Вы действительно хостите удалить автоматическое действие?')) {
                $http.delete('/api/actions/' + id).success(function () {
                    _.remove($scope.actions, {_id: id});
                });
            }
        };


    });
