Package.describe({
  name: 'mozfet:materialize-payments',
  version: '0.0.5',
  summary: 'MaterializeCSS Styled Payments for Braintree',
  git: 'https://github.com/mozfet/meteor-materialize-payments.git',
  documentation: 'README.md'
});

Npm.depends({
  braintree: '2.13.1',
  'braintree-web': '3.39.0',
  'braintree-web-drop-in': '1.14.1',
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.0.1');
  api.use(['ecmascript', 'underscore', 'mozfet:meteor-logs@0.3.1']);
  api.use([
    'fourseven:scss@4.10.0',
    'mozfet:access@0.0.4',
    'matb33:collection-hooks@0.8.4'
  ], 'server');
  api.use('mozfet:materialize-toast@0.0.3', 'client')
  api.addFiles([
    './server/braintree.js',
    './server/methods.js'
  ], 'server');
  api.addFiles([
    './client/braintreeDropinModal/braintreeDropinModal.js'
  ], 'client');
  api.mainModule('./client/payment.js', 'client');
  api.mainModule('./server/payment.js', 'server');
});

// Package.onTest(function(api) {
//   api.use('ecmascript');
//   api.use('fourseven:scss@4.9.0');
//   api.use('tinytest');
//   api.use('mozfet:materialize-payments');
//   api.mainModule('main-tests.js');
// });
