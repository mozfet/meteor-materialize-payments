// imports
import { check, Match } from 'meteor/check'
import ClientPaymentApi from '/imports/api/client/payment'
import ServerPaymentApi from '/imports/api/server/payment'

/**
 * Polymorphic payment creation.
 * @param {Object} args  -
 * @param {Function} callback -
 * @returns {} - see client/server api for details
 **/
const createPayment = (args, callback) => {
  check(args, Object)

  // if server
  if (Meteor.isServer) {

    // return call result from server api
    return ServerPaymentApi.createPayment(args)
  }

  // else - client
  else {

    // call method to create payment server side
    return ServerPaymentApi.createPayment(args, callback)
  }
}

export default {
  createPayment
}
