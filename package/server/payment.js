// imports
import EventEmitter from 'events'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Access } from 'meteor/mozfet:access'
import { Log } from 'meteor/mozfet:meteor-logs'
import { Braintree } from './braintree'

// define database collection for payments
const payments = new Mongo.Collection('payments')

// before payment insert
payments.before.insert(function (userId, doc) {

  // if user is not logged in
  if (!userId) {
    Log.log(['error', 'payments'], 'User must be signed in to pay.')
  }

  // set owner id
  doc.ownerId = userId

  // set initial state
  doc.state = 'CREATED'

  // set creation and update time
  doc.createdAt = doc.updatedAt = new Date()
})

// before payment update
payments.before.update(function (userId, doc, fieldNames, modifier, options) {

  // set update time
  doc.updatedAt = new Date()
})

// client permissions - only admin users can mutate payments
payments.allow(Access.adminCreateUpdateRemove)

// publications
Meteor.publish('payments', function () {
  const userId = this.userId

  // if user is admin
  if (Access.isAdmin(userId)) {

    // publish all payments
    return payments.find({})
  }

  // all other users
  else {

    // publish all payments user sent or recieved or is owner of
    return payments.find({$or: [
      {ownerId: userId}, {senderId: userId}, {recieverId: userId}
    ]})
  }
})

// publications
Meteor.publish('payments.session', function (sessionId) {
  check(sessionId, String)
  const userId = Meteor.userId()

  // if user is admin
  if(Access.isAdmin()) {

    return payments.find({
      'meta.sessionId': sessionId
    })
  }

  // all other users
  else {

    // publish all payments user sent or recieved
    return payments.find({
      'meta.sessionId': sessionId,
      $or: [{senderId: userId}, {recieverId: userId}]
    })
  }
})

/**
 * Create a payment record in the database.
 * @param {Object} args - arguments compliant to payment schema
 * @param {Function} callback - optional node style callback with paymentId
 * @returns {String} paymentId if no callback is supplied
 * @throws {Meteor.Error} in case of error without callback
 **/
const create = (args) => {
  check(args, Object)

  // insert payment
  const paymentId = payments.insert(args)

  // if payment was created
  if (paymentId) {

    // log payment detail
    const payment = payments.findOne(paymentId)
    Log.log(['information', 'payments'], 'Created payment:', payment)

    // return payment id
    return paymentId
  }

  // else - payment creation failed
  else {

    // log and throw error
    Log.log(['error', 'payments'], 'Unable to create new payment.')
  }
}

/**
 * Cancel a payment. Will be called from server in case of error from braintree
 * server or timeout. Does not do anything from client side.
 * @param {paymentId}  -
 * @returns {}
 **/
const cancel = (paymentId) => {
  if (Meteor.isServer) {
    check(paymentId, String)
    payments.update(paymentId, {$set: {state: 'CANCELLED'}})
    Log.log(['information', 'payments'], `Cancelled payment ${paymentId}.`)
  }
}

/**
 * Server side administrator function to remove user payment tokens.
 * Note that this will not remove any actual payment records.
 * After this function completed, all users will need to re-enter their payment
 * data.
 * @param {}  -
 * @returns {}
 **/
const reset = () => {
  if (Access.isAdmin()) {
    Log.log(['information', 'payments'], 'Reset Payments.')
    Meteor.users.update({}, {$unset: {payments: 1}}, {multi: true})
  }
}

/**
 * Events
 **/
export const emitter = new EventEmitter()
export const events = {
  PAYMENT_APPROVED: 'PAYMENT_APPROVED'
}

// after update payment
payments.after.update((userId, doc, fieldNames, modifier, options) => {
  Log.log(['debug', 'payments', 'hooks'], `After payment update modifier`,
      modifier)

  // if state changed to approved
  if (modifier['$set'].state === 'APPROVED') {
    Log.log(['debug', 'payments', 'hooks'], `State changed to approved.`)

    // emit
    emitter.emit(events.PAYMENT_APPROVED, doc)
  }
})

emitter.on(events.PAYMENT_APPROVED, payment => {
  Log.log(['debug', 'payments'], `On Payment Approved:`, payment)
})

/**
 * Export Payment API
 **/

export const Payment = {
  create,
  cancel,
  reset
}
