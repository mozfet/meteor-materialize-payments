/*jshint esversion: 6 */

import Braintree from './api';

Meteor.methods({
  'braintree.generateClientToken': function(args) {
    // console.log('braintree.generateClientToken.args', args);
    Braintree.generateClientToken(args, undefined);
  },
  'braintree.payment': function(args) {
    Braintree.payment(args, undefined);
  }
});
