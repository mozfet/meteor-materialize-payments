// imports
import { check } from 'meteor/check'
import { Braintree } from './braintree'

// on startup
Meteor.startup(() => {

  // define database collection for payments
  const Payments = new Meteor.Collection('payments')
})

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
