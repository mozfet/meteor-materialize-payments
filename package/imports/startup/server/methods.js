// imports
import Payment from '/imports/api/server/payments'
import Braintree from '/imports/api/server/braintree'

// methods
Meteor.methods({
  'payments.create': Payment.create,
  'payments.cancel': Payment.cancel,
  'payments.reset': Payment.reset,
  'braintree.generateClientToken': Braintree.generateClientToken,
  'braintree.payment': Braintree.payment
})
