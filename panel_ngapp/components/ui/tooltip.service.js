angular.module('regidiumApp')
    .factory('errorTooltips', function () {
        var CONSTANTS = {
            email: {
                type: 0,
                text: 'Введите электронную почту'
            },
            password: {
                type: 1,
                text: 'Введите пароль'
            },
            site: {
                type: 3,
                text: "Введите адрес сайта"
            },
            name: {
                type: 4,
                text: "Введите имя и фамилию"
            }
        };

        return {
            changeDataOriginalTitle: function (value, old, instance, errors, form) {
                if (value == undefined) return;
                old = old || "";
                if (value == "" && form[instance].$dirty) {
                    $("." + instance).attr('data-original-title', 'Данное поле необходимо заполнить').tooltip('show');
                } else if (old.length == 0 && value.length > 0) {
                    var text = $("." + instance).attr('data-original-title');
                    if (text != CONSTANTS[instance].text) {
                        $("." + instance).attr('data-original-title', CONSTANTS[instance].text).tooltip('show');
                    }
                } else if (errors.type == CONSTANTS[instance].type && value.length > 0) {
                    delete errors.type;
                    $("." + instance).attr('data-original-title', CONSTANTS[instance].text).tooltip('show');
                }
            }
        }
    });