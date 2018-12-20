Package.describe({
  name: 'meteor-materialize-payments',
  version: '0.0.1',
  summary: 'MaterializeCSS Styled Payments for Braintree',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.0.1');
  api.use('ecmascript');
  api.use('fourseven:scss@4.9.0')
  api.mainModule('main.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('meteor-materialize-payments');
  api.mainModule('main-tests.js');
});
