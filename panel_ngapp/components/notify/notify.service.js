angular.module('regidiumApp')
    .factory('notify', function (operators, $state, $rootScope) {

        var soundSupport = false,
            flashIntr,
            settings = {},
            notifications = [];

        operators.getOperator().then(function (currentUser) {
            settings = currentUser.settings;

            var notificationSettings = {
                webuser_in: settings.webuser_in,
                webuser_out: settings.webuser_out,
                new_message: settings.new_message
            };

            for (var key in notificationSettings) {
                if (notificationSettings[key]) {
                    if (notificationSettings[key].enabled) {
                        var srcMp3 = '../../assets/sounds/' + settings[key].audio_file + '.mp3';
                        var srcWav = '../../assets/sounds/' + settings[key].audio_file + '.wav';
                        try {
                            soundSupport = !!(document.createElement('audio').canPlayType);
                            if (soundSupport) {
                                key = document.createElement('audio');
                                key.class = key;
                                key.innerHTML = '<source src="' + srcMp3 + '" type="audio/mpeg" /><source' +
                                    ' src="' + srcWav + '" type="audio/wave"/>';
                                key.load();
                                key.volume = 0.5;
                            }
                            notifications.push(key);
                        } catch (e) {
                            soundSupport = false;
                        }
                    } else {
                        notifications.push(null);
                    }
                }
            }
        });

        function playSound(element) {
            if (soundSupport && notifications[element]) {
                notifications[element].play();
                return true;
            } else {
                return false;
            }
        }

        function showMessage(title, text) {
            $('.notification-title').html(title);
            $('.notification-body').html(text);
            $('.notification').animate({
                opacity: 1
            }, 500).delay(5000).animate({
                opacity: 0
            }, 500);

        }

        return {

            message: function (data) {
                if (!settings || !settings.new_message) return;

                if (settings.new_message.enabled && settings.new_message.type === 'audio' || settings.new_message.type === 'audio_info') {
                    playSound(2);
                }

                if (settings.new_message.enabled && settings.new_message.type === 'info' || settings.new_message.type === 'audio_info') {
                    var title = 'Новое сообщение';

                    showMessage(title, data.text);
                }
            },

            userin: function (data) {

                if (!settings || !settings.webuser_in) return;

                if (settings.webuser_in.enabled && settings.webuser_in.type === 'audio' || settings.webuser_in.type === 'audio_info') {
                    playSound(0);
                }

                if (settings.webuser_in.enabled && settings.webuser_in.type === 'info' || settings.webuser_in.type === 'audio_info') {
                    var title = 'Новый посетитель на сайте';
                    var text = '';

                    if (data.searchengine) {
                        text += ' пришел из ' + data.searchengine + '. ';
                    }

                    // if(data.socialnetwork) {
                    //   text+=' пришел из ' + data.socialnetwork
                    // }

                    if (data.city) {
                        data.city = ", " + data.city;
                    } else {
                        data.city = "";
                    }

                    text += data.country + data.city;

                    showMessage(title, text);
                }
            },

            userout: function () {
                if (!settings || !settings.webuser_out) return;

                if (settings.webuser_out.enabled && settings.webuser_out.type === 'audio' || settings.webuser_out.type === 'audio_info') {
                    playSound(1);
                }

                if (settings.webuser_out.enabled && settings.webuser_out.type === 'info' || settings.webuser_out.type === 'audio_info') {
                    showMessage('Посетитель покинул сайт', '');
                }

            },

            changeSettings: function (data) {
                settings = data;
            },

            unreaded: function (cnt) {
                if (cnt > 0 && !flashIntr) {
                    flashIntr = setInterval(function () {
                        document.title = (document.title === $state.current.resolve.$title()) ? '* НОВОЕ СООБЩЕНИЕ *' : $state.current.resolve.$title();
                    }, 500);
                }

                if (cnt === 0 && flashIntr) {
                    clearInterval(flashIntr);
                    flashIntr = undefined;
                    document.title = $state.current.resolve.$title();
                }
            }

        };
    });
