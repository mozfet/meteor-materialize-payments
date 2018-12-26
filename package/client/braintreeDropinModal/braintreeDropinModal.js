// imports
import { Mongo } from 'meteor/mongo'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { _ } from 'meteor/underscore'
import { Payment } from '../payment'
import { Braintree } from '../braintree'
import BraintreeDropin from 'braintree-web-drop-in'
import { Toast } from 'meteor/mozfet:materialize-toast'
import { Log } from 'meteor/mozfet:meteor-logs'
import 'meteor/mozfet:dynaview'
import './braintreeDropinModal.html'

// close modal worker function
function closeModal() {
  const element = $('#paymentModal')
  const modal = M.Modal.getInstance(element)
  modal.close()
}

// on created
Template.braintreeDropinModal.onCreated(() => {
  const instance = Template.instance()
  console.log('braintreeDropinModal instance data', instance.data)

  // subscribe to payments publication
  instance.subscribe('payments')

  // define reactive vars
  instance.paymentId = new ReactiveVar()
  instance.payment = new ReactiveVar()
  instance.paymentMethodRequestable= new ReactiveVar(false)
  instance.paymentOptionSelected= new ReactiveVar(false)
  instance.nonce = new ReactiveVar()
  instance.token = new ReactiveVar()
  instance.isProcessing = new ReactiveVar(false)

  // normalise input texts
  const inputTexts = instance.data.texts?instance.data.texts:{}
  Log.log(['debug', 'braintree'], `input texts`, inputTexts)

  // merge input texts with default texts
  instance.texts = _.defaults(inputTexts, {
    'product-name': 'Premium Account',
    'buy-button-text': 'Buy',
    'modal-title': 'Online Payment',
    'modal-submit-button': 'Submit',
    'modal-cancel-button': 'Cancel',
    'toast-payment-cancelled': 'Payment Cancelled',
    'toast-payment-success': 'Payment Ok',
    'toast-payment-error-create': 'Payment Creation Error',
    'toast-payment-error-method': 'Payment Method Error',
    'toast-payment-processing': 'Payment Processing',
    'toast-payment-approved': 'Payment Approved',
    'toast-payment-cancelled': 'Payment Cancelled',
  })
  Log.log(['debug', 'payment', 'braintree'], `texts`, _.clone(instance.texts))

  // if modal intro is not specified as input
  const textIntro = instance.data.texts?instance.data.texts['modal-intro']
      :undefined
  if (!textIntro) {
    Log.log(['debug', 'payment', 'braintree'],
        `Modal intro is not specified, generate it.`)

    // intro text from transaction data
    const textProductName = instance.texts['product-name']
    if (textProductName) {
      instance.texts['modal-intro'] = `Payment of ${instance.data.currency}`+
          ` ${instance.data.amount} for ${textProductName}.`
    }
    else {
      instance.texts['modal-intro'] = `Payment of ${instance.data.currency}`+
          ` ${instance.data.amount}.`
    }
  }
  Log.log(['debug', 'payment', 'braintree'], `texts`, _.clone(instance.texts))

  // worker function to retrieve texts
  instance.text = (key) => {
    if (_.chain(instance.texts).keys().contains(key)) {
      return instance.texts[key]
    }
    else {
      return key
    }
  }

  // create a payment
  const args = {
    type: 'BRAINTREE',
    amount: instance.data.amount,
    currency: instance.data.currency,
    productCode: instance.data.productCode,
    meta: instance.data.meta
  }
  const callback = (error, paymentId) => {
    if (error) {
      Log.log(['warning', 'payment', 'braintree', 'dropin'], error)
      Toast.show(['payment'], instance.text('toast-payment-error-create'))
      closeModal()
    }
    else {
      Log.log(['debug', 'payment', 'braintree'], 'braintree dropin payment id',
          paymentId)
      instance.paymentId.set(paymentId)
    }
  }
  Payment.create(args, callback)
})

// on rendered
Template.braintreeDropinModal.onRendered(() => {
  const instance = Template.instance()

  // autorun
  instance.autorun(() => {

    // when payment id changes
    const paymentId = instance.paymentId.get()

    // if payment id is defined
    if (paymentId) {

      // get payment
      const payments = Mongo.Collection.get('payments')
      const paymentCursor = payments.find({_id: paymentId})
      const payment = _.first(paymentCursor.fetch())
      Log.log(['debug', 'braintree'], 'braintree dropin payment', payment)
      instance.payment.set(payment)

      // if payment is in created state
      if (payment && payment.state==='CREATED') {
        Log.log(['debug', 'braintree'],
            'braintree dropin payment state CREATED', [])

        // get the client token from the server
        Meteor.call('braintree.generateClientToken',
            {id: payment._id}, (error, response) => {
          Log.log(['debug', 'braintree'], 'braintree client token generated',
              [error, response])
        })
      }

      // else if payment is in processing state
      else if (payment && (payment.state === 'PROCESSING')) {
        Log.log(['debug', 'braintree'],
            'braintree dropin payment state PROCESSING')
        instance.isProcessing.set(true)
        Toast.show(['braintree'],
            instance.text('toast-payment-processing'))
      }

      // else if payment is in error state
      else if (payment && (payment.state === 'ERROR')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state ERROR',
            payment.errorMessage)
        Toast.show(['braintree'], payment.errorMessage)
        closeModal()
      }

      // else if payment is in rejected state
      else if (payment && (payment.state === 'REJECTED')) {
        Log.log(['debug', 'braintree'],
            'braintree dropin payment state REJECTED', payment.message)
        Toast.show(['braintree'], payment.message)
        closeModal()
      }

      // else if payment is in approved state
      else if (payment && (payment.state === 'APPROVED')) {
        Log.log(['debug', 'braintree'],
            'braintree dropin payment state APPROVED')

        // inform user of success
        Toast.show(['braintree'], instance.text('toast-payment-approved'))

        // close modal
        closeModal()
      }

      // else if braintree client token exists
      else if (payment && (payment.state === 'TOKENIZED')) {
        Log.log(['debug', 'braintree'],
          'braintree dropin payment state TOKENIZED')

        // create dropin using token as authorization
        BraintreeDropin.create(
          {
            authorization: payment.braintree.clientToken,
            container: '#braintree-dropin-container',
            paypal: {
              flow: 'vault'
            }
          },
          function (error, dropinInstance) {

            // if error
            if (error) {

              // log and inform user
              const msg = 'error creating braintree dropin'
              Log.log(['warning', 'braintree'], msg, error)
              Toast.show(['braintree'], msg)
              closeModal()
            }

            // else - no error
            else {
              Log.log(['information', 'braintree'],
                  'braintree dropin instance created')

              // assign dropin instance to template
              instance.dropin = dropinInstance

              if (instance.dropin.isPaymentMethodRequestable()) {
                // this will be true if you generated the client token
                // with a customer ID and there is a saved payment method
                // available to tokenize with that customer.
                instance.paymentMethodRequestable.set(true)
              }

              // when payment method is requestable
              instance.dropin.on('paymentMethodRequestable', (event) => {

                // mark reactive var
                Log.log(['information', 'braintree'],
                    'braintree dropin payment method is requestable')
                instance.paymentMethodRequestable.set(true)
              })

              // when payment method is set
              instance.dropin.on('paymentOptionSelected', (event) => {

                // mark reactive var
                Log.log(['information', 'braintree'],
                    'braintree dropin payment option is selected')
                instance.paymentOptionSelected.set(true)
              })
            }
          }
        )
      }
    }
  })
})

// helpers
Template.braintreeDropinModal.helpers({

  // is ready
  ready() {
    const instance = Template.instance()
    const payment = instance.payment.get()
    const state = payment?payment.state:undefined
    if(state === 'TOKENIZED') {
      return true
    }
    return false
  },

  // text strings for customized modal
  text(key) {
    const instance = Template.instance()
    return instance.text(key)
  },

  // pay button attributes
  payButtonAttr() {

    // pay button is disabled if no payment method is available
    const instance = Template.instance()
    const disabled = (!instance.paymentMethodRequestable.get()) ||
        instance.isProcessing.get()
    const baseClass = 'btn waves-effect waves-green js-submitPaymentButton'
    return {
      'class': disabled?baseClass+' disabled':baseClass
    }
  }
})

// events
Template.braintreeDropinModal.events({

  // on click pay button
  'click .js-submitPaymentButton'(event) {
    event.preventDefault()
    const instance = Template.instance()

    // if payment is tokenized
    if (instance.payment.get().state === 'TOKENIZED') {

      // if payment method can be requested
      if (instance.dropin.isPaymentMethodRequestable()) {
        instance.dropin.requestPaymentMethod(function (error, payload) {

          // if error
          if (error) {
            Log.log(['warning', 'braintree'], error, payload)
            Toast.show(['payment'],
                instance.text('toast-payment-error-payment-method'))
            closeModal()
          }

          // else - no error
          else {
            Log.log(['information', 'braintree'],
                'braintree dropin payment method:', [payload])

            // perform braintree payment with nonce
            Braintree.payment({
              id: instance.paymentId.get(),
              nonce: payload.nonce
            })
          }
        })
      }
    }
  },

  // on click cancel button
  'click .js-cancelPaymentButton'(event, template) {
    const instance = Template.instance()
    event.preventDefault()

    // cancel the payment
    Meteor.call('payments.cancel', instance.paymentId.get())

    // show toast
    Toast.show(['braintree'], instance.text('toast-payment-cancelled'))

    // close the modal
    closeModal()
  }
})

// on destroyed
Template.braintreeDropinModal.onDestroyed(() => {
  const instance = Template.instance()
  if (instance.dropin) {
    instance.dropin.teardown()
  }
})
