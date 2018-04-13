angular.module('regidiumApp')
    .factory('Tarif', function($http) {


        var trarif = [
            {id:0, name:'Пробный период',description: 'Тариф для ознакомления'},
            {id:1, name:'Платный', price: 450, description: 'Полный набор функций'}
        ];

        var options = [
            'Онлайн-чат на сайте',  //0
            'Блокировка посетителя', //1
            'Поддержка 24/7', //2
            'Фотографии операторов', //3
            'Шифрование SSL', //4
            'Наблюдение за печатью', //5
            'Автоматические действия (Вовлечение в диалог)', //6
            'Информация о клиенте', //7
            'Переадресация чата', //8
            'Генератор лидов', //9
            'Статистика отчеты', //10
            'История переписки', //11
            'Отделы', //12
            'Оценка агента', //13
            'Скрытие разработчика чата', //14
            'API Regidium' //15
        ]

        var tarifOptionsAvailbe = {
            0: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
            1: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
        }

        var unpaidOptions = [0, 4, 10, 12];


        return {
            getOptions: function(tarif, paid){
                var result = [];
                for(var i=0, l=options.length; i<l; i++){
                    var t = {name:options[i]};
                    if(paid) {
                        t.enable = tarifOptionsAvailbe[tarif].indexOf(i)>=0
                    } else {
                        t.enable = unpaidOptions.indexOf(i)>=0
                    }
                    result.push(t);
                }
                return result;
            },

            getTarifInfo: function(id){
                return trarif[id];
            },

            getNonfreeTarif: function(){
                var result = [];
                for(var i=1, l=trarif.length; i<l; i++){
                    result.push(trarif[i]);
                }
                return result;
            }


        };


    });
