angular.module('regidiumApp')
    .directive('drange', ['$timeout', function() {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                range: '='
            },
            template: ' <div class="period js-show-traget-source" id="period">' +
                        '<input class="period__input js-date-input" ng-model="range.from" type="text">' +
                        '<input class="period__input js-date-input" ng-model="range.to" type="text">' +
                        '</div>',

            link : function(scope, element, attrs) {


                if ($.datepicker == undefined) {
                    $.datepicker = new Datepicker();
                    $.datepicker.initialized = false;
                    $.datepicker.uuid = new Date().getTime();
                    $.datepicker.version = "1.10.2";
                }

              $.datepicker.regional['ru'] = {
            		closeText: 'Закрыть',
            		prevText: '&#x3c;Пред',
            		nextText: 'След&#x3e;',
            		currentText: 'Сегодня',
            		monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
            		'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            		monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
            		'Июл','Авг','Сен','Окт','Ноя','Дек'],
            		dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
            		dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
            		dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
            		weekHeader: 'Нед',
            		dateFormat: 'dd.mm.yy',
            		firstDay: 1,
            		isRTL: false,
            		showMonthAfterYear: false,
            		yearSuffix: ''};
            	$.datepicker.setDefaults($.datepicker.regional['ru']);
              element.find(".js-date-input").datepicker({
                dateFormat: "dd.mm.yy"
              });
            }
        };
    }]);
