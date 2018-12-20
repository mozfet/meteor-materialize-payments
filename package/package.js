Package.describe({
  name: 'mozfet:materialize-payments',
  version: '0.0.2',
  summary: 'MaterializeCSS Styled Payments for Braintree',
  git: 'https://github.com/mozfet/meteor-materialize-payments.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.0.1');
  api.use('ecmascript', 'server');
  api.use(['fourseven:scss@4.9.0', 'mozfet:access']);
  api.addFiles('./imports/api/client/payment.js', 'client');
  api.addFiles('./imports/api/server/payment.js', 'server');
});

// Package.onTest(function(api) {
//   api.use('ecmascript');
//   api.use('fourseven:scss@4.9.0');
//   api.use('tinytest');
//   api.use('mozfet:materialize-payments');
//   api.mainModule('main-tests.js');
// });
