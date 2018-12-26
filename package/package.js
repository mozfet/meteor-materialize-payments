Package.describe({
  name: 'mozfet:materialize-payments',
  version: '1.0.1',
  summary: 'MaterializeCSS Styled Payments for Braintree',
  git: 'https://github.com/mozfet/meteor-materialize-payments.git',
  documentation: 'README.md'
});

Npm.depends({
  'braintree': '2.13.1',
  'braintree-web': '3.39.0',
  'braintree-web-drop-in': '1.14.1',
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.0.1');

  // both
  api.use([
    'ecmascript',
    'underscore',
    'mozfet:meteor-logs@0.3.3',
    'dburles:mongo-collection-instances@0.3.5'
  ]);

  // server
  api.use([
    'fourseven:scss@4.10.0',
    'mozfet:access@0.0.4',
    'matb33:collection-hooks@0.8.4'
  ], 'server');
  api.addFiles([
    './server/braintree.js',
    './server/methods.js'
  ], 'server');
  api.mainModule('./server/payment.js', 'server');

  // client
  api.use([
    'session',
    'ejson',
    'templating@1.3.2',
    'ui@1.0.13',
    'mozfet:meteor-logs',
    'mozfet:dynaview@0.0.4',
    'mozfet:materialize-toast@0.0.4'
  ], 'client')
  api.mainModule('./client/payment.js', 'client', { lazy: true });
});

// Package.onTest(function(api) {
//   api.use('ecmascript');
//   api.use('fourseven:scss@4.10.0');
//   api.use('tinytest');
//   api.use('mozfet:materialize-payments');
//   api.mainModule('main-tests.js');
// });
