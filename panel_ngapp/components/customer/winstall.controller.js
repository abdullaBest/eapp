'use strict';

angular.module('regidiumApp').config(['ngClipProvider', function (ngClipProvider) {
    ngClipProvider.setPath("/bower_components/zeroclipboard/dist/ZeroClipboard.swf");
}]);

angular.module('regidiumApp')
    .controller('WinstallCtrl', function (Net, Auth, $scope, customer, $http, operators) {

        $scope.operators = operators.operators;
        $scope.regexEmail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        $scope.regexSite = /(http(s)?:\/\/)?(www[\.])?([\w])+[\.]([\w]){2,4}$/;
        $scope.key = '';
        $scope.webmasterEmail = '';
        $scope.codeSendedToWebmaster = false;
        $scope.operatorMail = '';
        $scope.operatorName = '';
        $scope.emails = [];
        $scope.sites = [];
        $scope.newUser = {};
        $scope.site = '';
        $scope.code = '';
        $scope.newCode = '';
        $scope.copyCode = false;
        $scope.linkForWinApp = '';

        $scope.sendEmail = function (form) {
            // $scope.submitted = true;
            if ($scope.regexEmail.test($scope.webmasterEmail)) {
                $http.post('/api/customer/sendtowebmaster', {email: $scope.webmasterEmail}).success(function () {
                    $scope.showSendForm = false;
                    $scope.codeSendedToWebmaster = true;
                });
            } else {
                $('.inline-send-form__form').addClass("error");
                $('.inline-send-form').append('<div class="error-email-error">Введите корректный адрес</div>');
                setTimeout(function () {
                    $('.inline-send-form__form').removeClass("error");
                    $('.inline-send-form__form input').val('');
                    $scope.hideError('.error-email-error');
                }, 4000);
            }
        };
        $scope.fallback = function (copy) {
            window.prompt('Press cmd+c to copy the text below.', copy);
        };

        if (Auth.newUser) {
            $('#entranceModal').appendTo('body').modal('show');
        }

        $scope.$watch('operators', function (newValue, oldValue) {
            if (newValue == null || !newValue.length) return false;
            if ($scope.emails.indexOf(newValue[0].email) !== -1) return;
            $scope.emails.push(newValue[0].email);
        }, true);

        customer.getInfo().then(function (data) {
            var customerInfo = data;
            $scope.sites = customerInfo.sites;
            $scope.key = customerInfo.key;
            $scope.linkForWinApp = customerInfo.winAppLink;
            
            $scope.code = '<!-- Regidium --> <script type="text/javascript"> var RegidiumKey = "' + $scope.key + '"; var el = window.document.createElement("script"); el.type = "text/javascript"; el.charset = "utf-8"; el.src = "https://static.regidium.com/widget.dev.js"; el.async = true; el.isLoaded = false; el.onload = el.onreadystatechange = function() { if ((el.readyState && el.readyState != "complete" && el.readyState != "loaded") || el.isLoaded) return; el.isLoaded = true; }; window.document.getElementsByTagName("head")[0].appendChild(el); </script> <!-- /Regidium--> ';


            customer.isWidgetInstaled().then(function (response) {
                if (response.data.installed === true || Auth.newUser) {
                    return true;
                } else {
                    $('#widgetCode').modal('show');
                }
            });
        });


        /* ADD OPERATOR FUNCTION */
        $scope.addOperator = function () {
            if ($scope.regexEmail.test($scope.operatorMail)) {
                //
                Net.req({
                    i           : Net.MSG_USER,
                    a           : Net.ACTION_ADD,
                    id          : 0,
                    email       : $scope.operatorMail,
                    password    : $scope.operatorMail,
                    division    : '',
                    name        : $scope.operatorName,
                    blocked     : false,
                    image       : 'https://e2.tacdn.com/img2/generic/site/no_user_photo-v1.gif',
                    jobtitle    : '',
                    isadmin     : false,
                    sendmsg     : false,
                }).then(function(data){ 
                    $scope.emails.push(data.operator.email);
                    console.log("created");
                    $('.addoperator input').val('');
                }).catch(function(err){
                    console.log(err);
                    $('.addoperator').addClass("error");
                    $('.emailblock li:first-child').append('<div class="wizard error-add-operator">Данная почта уже используется.</div>');
                    setTimeout(function () {
                        $('.addoperator').removeClass("error");
                        $('.addoperator input').val('');
                        $scope.hideError('.error-add-operator');
                    }, 4000);
                });
            }
        };
        /* ADD SITE FUNCTION */
        $scope.addSite = function () {
            if ($scope.regexSite.test($scope.site)) {

                var index = _.pluck($scope.sites, 'url').indexOf($scope.site);
                if (index == -1) {
                    $scope.sites.push({
                        url: $scope.site
                    });
                    $('.site').val('');
                    customer.saveSites($scope.sites);
                } else {
                    $('.addsite').addClass("error");
                    $('.siteblock li:first-child').append('<div class="wizard error-add-site">Данный сайт уже есть в списке.</div>');
                    setTimeout(function () {
                        $('.addsite').removeClass("error");
                        $('.addsite input').val('');
                        $scope.hideError('.error-add-site');
                    }, 4000);
                }
            } else {
                $('.addsite').addClass('error');
                $('.siteblock li:first-child').append('<div class="wizard error-add-site">Некоректные данные.</div>');
                setTimeout(function () {
                    $('.addsite').removeClass("error");
                    $('.addsite input').val('');
                    $scope.hideError('.error-add-site');
                }, 4000);
            }
        };


        /* MODALS functions */
        $scope.sendEvent = function (sel, prevStep, step) {
            $('.step-' + prevStep).hide();
            $('.step-' + step).show();
        };

        $scope.closeModal = function (modal) {
            if (modal == '#entranceModal') localStorage.setItem('justregistred', false);
            $(modal).modal('hide').remove('.modal-backdrop');
        };

        /* DELETE SITE AND OPERATOR */
        $scope.deleteEmail = function (email) {
            var operator = _.find($scope.operators, {email: email});
            if (!operator.isadmin) {
                Net.req({
                    i   : Net.MSG_USER,
                    a   : Net.ACTION_DEL,
                    id  : operator._id,
                }).then(function(data){ 
                    _.remove($scope.emails, email);
                }).catch(function(err){
                    console.log(err);
                });      
            } else {
                $('.emailblock').append('<div class="wizard error-delete-operator">Невозможно удалить администратора аккаунта</div>');
                setTimeout(function () {
                    $scope.hideError('.error-delete-operator');
                }, 4000);
            }
        };

        $scope.deleteSite = function (site) {
            _.remove($scope.sites, site);
            customer.saveSites($scope.sites);
        };

        /* HELPERS */
        $scope.hideError = function (error) {
            $(error).hide();
        };

    });
