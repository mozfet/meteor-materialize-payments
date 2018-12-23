// imports
import { check } from 'meteor/check'
import { Braintree } from './braintree'
import './buyButton/buyButton.js'

// define database collection for payments
new Meteor.Collection('payments')

/**
 * Polymorphic function to create a payment.
 * @param {}  -
 * @returns {}
 **/
const create = (args, callback) => {
  check(args, Object)
  check(callback, Function)

  // return call method to create payment server side
  return Meteor.call('payments.create', args, callback)
}

// export
export const Payment = {
  create
}
