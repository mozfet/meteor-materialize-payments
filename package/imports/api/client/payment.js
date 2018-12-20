// imports
import { check } from 'meteor/check'

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

export default {create}
