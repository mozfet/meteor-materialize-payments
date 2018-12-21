/**
 * Syncronously get client token for payment.
 * Launch dropin with this token.
 * @param {Object} args - arguments for braintree.generateClientToken method
 * @param {String} args.id - payment id in database
 **/
const getClientToken = (args, callback) => {
  return Meteor.apply('braintree.generateClientToken', [args],
      {wait: true}, callback)
}

/**
 * Create and async process new payment
 * @param {String} args.id - payment id in database
 * @param {} args.nonce - nonce from braintree dropin
 **/
const payment = (args, callback) => {
  return Meteor.apply('braintree.payment', [args], {wait: true}, callback)
}

// export default api
export const Braintree = {
  getClientToken: getClientToken,
  payment: payment
}
