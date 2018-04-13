angular.module('regidiumApp')
    .factory('customer', function(Net, $http, $q, moment, $cookies) {

        return {
            customer : null,
            customerGetPromise: $q.defer(),

            init: function(_customer) {
                this.customer = _customer;
                this.customerGetPromise.resolve(this.customer);
            },

            create: function(){

            },

            getActiveBill: function () {
              return $http.get('/api/payments/bill');
            },

            getInfo: function(){
                return this.customerGetPromise.promise;
            },

            isWidgetInstaled: function(){
                return $http.get('/api/customer/widgetinst');
            },

            updateCustomerInfo: function(data){
              return $http.put('/api/customer', {data:data});
            },

            updateCustomerBillAcc: function (data) {
              return $http.put('/api/customer/billaccount', {data: data});
            },

            /*getSettings: function(){
                return this.customer.settings || false;
            },*/
            // пришли обновленные данные по настройкам виджета
            update_settings : function(data){
                this.customer.settings = data;
            },
            saveSettings: function(settings) {
                Net.send({
                    i    : Net.MSG_USER,
                    a    : Net.ACTION_SETTINGS,
                    data : settings,
                });
            },

            saveSites: function(sites){
                $http.put('/api/customer/sites', {sites:sites}).success(function () {
                });
            },

            createBill: function(name, months, period, operators, rebill, promocode, billType, id){
                return $http.post('/api/payments/bill', {name: name, months:months, period:period, operators:operators, rebill:rebill, promocode:promocode, billType:billType, id:id});
            },

            /*updateBill: function(name, id, operators, months, period, rebill, promocode){
                return $http.put('/api/payments/bill/'+id, {name: name, id: id, operators:operators, months:months, period:period, rebill:rebill, promocode:promocode});
            },*/

            getBill: function(id){
                return $http.get('/api/payments/bill/'+id);
            },

            // getLastPayedBill: function () {
            //     return $http.get('/api/payments/bill/lastbill');
            // }
        };


    });
