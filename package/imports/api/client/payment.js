// imports
import { check, Match } from 'meteor/check'

/**
 * Polymorphic function to create a payment.
 * @param {}  -
 * @returns {}
 **/
const createPayment = (args, callback) => {
  check(args, Object)
  check(callback, Function)

    // call method to create payment server side
    Meteor.call('payments.create', args, callback)

    // return undefined
    return undefined
  }
}

export default {
  createPayment
}
