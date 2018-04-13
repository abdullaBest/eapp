angular.module('regidiumApp')
    .controller('SettingsNotificationCtrl', function($scope, operators, customer, notify, cfpLoadingBar) {



        /* PUBLIC FIELDS */

        $scope.notification = null;
        $scope.noChange = true;

        $scope.notificationType = {
            'default': 'Выбрать тип',
            'audio': 'Звуком',
            'info': 'Визуально',
            'audio_info': 'Звуком и визуально'
        };

        $scope.sounds = {
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

        /* ############ */



        /* PRIVATE FIELDS */
        
        var sound = null;
        var soundSupport = false;
        var firstSettingsInit = false;

        /* ############ */



        /* INIT */

        operators.getOperator().then(function(currentUser) {
            $scope.currentUser = currentUser;
            $scope.notification = $scope.currentUser.settings;
            customer.getInfo().then(function (data) {
                $scope.notification.for_webuser = data.settings.for_webuser;
                $scope.settings = data.settings;
            })
        });

        /* ############ */



        /* WATCHING */

        $scope.$watch('notification', function(newValue, oldValue) {
            if (!newValue) return;

            if(!firstSettingsInit) {
                firstSettingsInit = true;
                return;
            }

            if (!angular.equals(newValue, oldValue)) {
                $scope.noChange = false;
            }
        }, true);

        /* ############ */



        /* PUBLIC METHODS */

        $scope.chooseSound = function (notification, file, cb) {
            $scope.srcMp3 = 'https://my.regidium.com/assets/sounds/' + file + '.mp3';
            $scope.srcWav = 'https://my.regidium.com/assets/sounds/' + file + '.wav';

            try {
                soundSupport = !!(document.createElement('audio').canPlayType);
                if (soundSupport) {
                    sound = document.createElement('audio');
                    sound.id = notification;
                    sound.innerHTML = '<source src="' + $scope.srcMp3 + '" type="audio/mpeg" /><source' +
                        ' src="' + $scope.srcWav + '" type="audio/wave" />';
                    sound.load();
                    sound.volume = 0.5;
                }
            } catch (e) {
                soundSupport = false;
            }

            cb();
        };

        $scope.playSound = function () {
            if (soundSupport) {
                sound.play();
            }
        };

        $scope.save = function() {
            if ($scope.currentUser.isadmin) $scope.settings.for_webuser = $scope.notification.for_webuser;
            $scope.currentUser.settings = $scope.notification;
            operators
                .updateUser({ _id: $scope.currentUser._id, settings: $scope.notification }, notify.changeSettings($scope.notification), $scope.currentUser.isadmin?customer.saveSettings($scope.settings):operators.updateUserSettings($scope.currentUser), cfpLoadingBar.start())
                .then(function() {
                    $scope.noChange = true;
                    cfpLoadingBar.complete();
                })
                .catch(function(err) {
                    console.log(err);
                });
        };

        /* ############ */



    });