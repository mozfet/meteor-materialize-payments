// imports
import { Payment } from './payment'
import { Braintree } from './braintree'

// methods
Meteor.methods({
  'payments.create': Payment.create,
  'payments.cancel': Payment.cancel,
  'payments.reset': Payment.reset,
  'braintree.generateClientToken': Braintree.generateClientToken,
  'braintree.payment': Braintree.payment
})
