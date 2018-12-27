import BraintreeApi from 'braintree'

let environment, gateway
Meteor.startup(() => {

  // get braintree settings
  if(_.isUndefined(Meteor.settings) || _.isUndefined(Meteor.settings.braintree)) {
    throw new Meteor.Error('Cannot find Meteor.settings.braintree. Use "$ meteor npm run start" instead of "$ meteor".')
  }

  // determine environment from settings
  environment = Meteor.settings.braintree.environment ===
      "braintree.Environment.Production"?
      BraintreeApi.Environment.Production:BraintreeApi.Environment.Sandbox

  // connect to braintree gateway
  gateway = BraintreeApi.connect({
    environment: environment,
    merchantId: Meteor.settings.braintree.merchantId,
    publicKey: Meteor.settings.braintree.publicKey,
    privateKey: Meteor.settings.braintree.privateKey
  })
})

// async generate braintree client token
// args.id - payment id in database
// args.customerId - braintree customer id in vault of merchant
const generateClientToken = (args, callback) => {
  Log.log(['debug', 'payment', 'braintree'], `generatingClientToken`, args)

  // define client token args
  const clientTokenArgs = {}

  // get user
  const userId = Meteor.userId()
  if (!userId) {
    Log.log(['error', 'payment', 'braintree'],
        'Must be logged in to generate client token.')
  }
  const user = Meteor.users.findOne()
  // Log.log(['debug', 'braintree'],
  //     'braintree.server.api.generateClientToken.user', user)

  // set braintree customer id of repeat customer
  if(user.payments && user.payments.braintree &&
        user.payments.braintree.customerId) {
    clientTokenArgs.customerId = user.payments.braintree.customerId
  }
  // Log.log(['debug', 'braintree'], 'braintree.server.api.generateClientToken.clientTokenArg', clientTokenArgs)

  // get payments collection
  const payments = Mongo.Collection.get('payments')

  // async generate token
  gateway.clientToken.generate(
    clientTokenArgs,
    Meteor.bindEnvironment((error, response) => {

      // if error
      if(error) {

        // update payment with error
        payments.update(args.id, {$set: {state: 'ERROR', errorType: 'CONNECTION', errorMessage: 'connection error'}})
        Log.log(['warning', 'braintree'], 'could not generate braintree client token', [error])
      }

      // else - success
      else {

        // if response is success
        if (response.success) {
          Log.log(['information', 'braintree'], 'generated braintree client token')

          // update payment with client token
          payments.update(args.id, {$set: {
            state: 'TOKENIZED',
            'braintree.clientToken': response.clientToken
          }})
        }
        else {

          // update payment with error
          payments.update(args.id, {$set: {state: 'ERROR', errorType: 'PROCESSOR', errorMessage: response.message}})
          Log.log(['warning', 'braintree'], [response.message])
        }
      }

      //callback
      if(callback) {
        callback(error, response)
      }
    })
  )

  //async function returns undefined
  return undefined
}


//async braintree payment
//args.id - the payment id
//args.nonce - the nonce from the client
const braintreePayment = (args, callback) => {

  // get the collection
  const payments = Mongo.Collection.get('payments')

  // get the payment
  const payment = payments.findOne(args.id)
  if(_.isUndefined(payment)) {
    Log.log(['error', 'braintree'],'braintree needs a payment to process:', [payment])
  }

  // mark payment as processiong and set the nonce
  payments.update(payment._id, {$set: {state: 'PROCESSING', 'braintree.nonce': args.nonce}})

  // async create sale using braintree gateway
  gateway.transaction.sale(

    // transaction request data
    {
      amount: payment.amount,
      paymentMethodNonce: args.nonce,
      options: {
        submitForSettlement: true,
        storeInVaultOnSuccess: true
      }
    },

    // callback function
    Meteor.bindEnvironment(
      (error, result) => {

        // if error
        if (error) {

          // mark transaction as error in db
          payments.update(payment._id, {$set: {state: 'ERROR',
              errorType: 'CONNECTION', errorMessage: 'connection error'}})
          Log.log(['warning', 'braintree'], [error])

          // callback
          if (callback) {
            callback(error, result)
          }
        }

        // else if result is success
        else if (result.success) {
          Log.log(['information', 'debug', 'braintree'],
              `Sale ${result.transaction.id} is a success.`)

          // mark transaction as approved and store transaction id
          payments.update(payment._id, {$set: {state: 'APPROVED',
              'braintree.transactionId': result.transaction.id}})
          Log.log(['debug', 'braintree'], `payment approved ${payment._id}`)

          // store customer id for user
          Meteor.users.update({_id: Meteor.userId()},
              {$set: {'payments.braintree.customerId':
              result.transaction.customer.id}})

          // callback
          if (callback) {
            callback(undefined, result)
          }
        }

        // else - result is not a success
        else {

          // mark transaction as error in db
          payments.update(payment._id, {$set: {state: 'REJECTED',
              message: result.message}})
          Log.log(['warning', 'braintree'], 'payment rejected by gateway',
              [result.message])

          //callback
          if (callback) {
            callback('payment rejected by gateway', result)
          }
        }

        // return undefined
        return undefined
      }
    )
  )

  // async function returns undefined
  return undefined
}

// update api
export const Braintree = {
  gateway: gateway,
  generateClientToken: generateClientToken,
  payment: braintreePayment
}
