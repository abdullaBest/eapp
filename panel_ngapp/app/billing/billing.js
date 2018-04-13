'use strict';

angular.module('regidiumApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.billing', {
        url: '/billing',
        templateUrl: '/app/billing/billing.html',
        controller: 'BillingCtrl',
        resolve: { $title: function() { return 'Баланс и выбор опций'; } },
        authenticate: true
      })
      .state('app.billing_rebill', {
        url: '/billing/rebill',
        templateUrl: '/app/billing/billing.rebill.html',
        controller: 'BillingRebillCtrl',
        resolve: { $title: function() { return 'Продлить'; } },
        authenticate: true
      })
      .state('app.billing_pay', {
        url: '/billing/pay/:billid',
        templateUrl: '/app/billing/pay.html',
        controller: 'PayCtrl',
        resolve: { $title: function() { return 'Оплата'; } },
        authenticate: true
      })
      .state('billing_invoice', {
        url: '/billing/pay/:billid/invoice/:type',
        templateUrl: '/app/billing/invoice.html',
        controller: 'PayInvoiceCtrl',
        resolve: { $title: function() { return 'Оплата'; } },
        authenticate: true
      })
      .state('app.billing_devpayfail', {
        url: '/billing/devpayfail',
        templateUrl: '/app/billing/payfail.html',
        controller: 'PayResCtrl',
        resolve: { $title: function() { return 'Оплата не удалась'; } },
        authenticate: true
      })
      .state('app.billing_devpaysuccess', {
        url: '/billing/devpaysuccess',
        templateUrl: '/app/billing/paysuccess.html',
        resolve: { $title: function() { return 'Оплата прошла успешно'; } },
        controller: 'PayResCtrl',
        authenticate: true
      })
      .state('app.billing_payfail', {
        url: '/billing/payfail',
        templateUrl: '/app/billing/payfail.html',
        controller: 'PayResCtrl',
        resolve: { $title: function() { return 'Оплата не удалась'; } },
        authenticate: true
      })
      .state('app.billing_paysuccess', {
        url: '/billing/paysuccess',
        templateUrl: '/app/billing/paysuccess.html',
        controller: 'PayResCtrl',
        resolve: { $title: function() { return 'Оплата прошла успешно'; } },
        authenticate: true
      });
  });
