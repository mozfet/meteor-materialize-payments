// imports
import { check, Match } from 'meteor/check'
import Access from '/imports/api/access'

/**
 * Create a payment record in the database.
 * @param {Object} args - arguments compliant to payment schema
 * @param {Function} callback - optional node style callback with paymentId
 * @returns {String} paymentId if no callback is supplied
 * @throws {Meteor.Error} in case of error without callback
 **/
const createPayment = (args) => {
  check(args, Object)

  // insert payment
  const paymentId = Payments.insert(args)

  // log payment detail
  const payment = Payments.findOne(paymentId)
  Log.log(['information', 'payments'], 'Created payment:', payment)

  // if payment was created
  if (paymentId) {

    // log and throw error
    Log.log(['error', 'payments'], 'Unable to create new payment.')
  }

  // else - payment creation failed
  else {

    // return payment id
    return paymentId
  }
}

/**
 * Cancel a payment. Will be called from server in case of error from braintree
 * server or timeout. Does not do anything from client side.
 * @param {paymentId}  -
 * @returns {}
 **/
const cancelPayment = (paymentId) => {
  if (Meteor.isServer) {
    check(paymentId, String)
    Payments.update(paymentId, {$set: {state: 'CANCELLED'}})
    Log.log(['information', 'payments'], `Cancelled payment ${paymentId}.`)
  }
}

/**
 * Server side administrator function to remove user payment tokens.
 * Does not do anything on client side.
 * Note that this will not remove any actual payment records.
 * After this function completed, all users will need to re-enter their payment
 * data.
 * @param {}  -
 * @returns {}
 **/
const resetUserPaymentData = () => {

  if (Access.isAdmin()) {
    Log.log(['information', 'payments'], 'Reset Payments.')
    Meteor.users.update({}, {$unset: {payments: 1}}, {multi: true})
  }
}

//export api
export default {
  create: createPayment,
  cancel: cancelPayment,
  reset: resetUserPaymentData
}
