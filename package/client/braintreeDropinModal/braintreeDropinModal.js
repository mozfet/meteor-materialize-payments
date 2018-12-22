// imports
import { Mongo } from 'meteor/mongo'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Payment } from '../payment'
import { Braintree } from '../braintree'
import BraintreeDropin from 'braintree-web-drop-in'
import { Toast } from 'meteor/mozfet:materialize-toast'
import '../dynaViewMaterialModal/dynaViewMaterialModal'
import './braintreeDropinModal.html'

// close modal
function closeModal() {
  const element = $('#paymentModal')
  const modal = M.Modal.getInstance(element)
  modal.close()
}

// define templates
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

  // internationalisation support
  instance.translate = (key) => {
    const translations = instance.data.translations?instance.data.translations:
        {
          'toast-payment-cancelled': 'Payment Cancelled',
          'toast-payment-success': 'Payment Ok',
          'toast-payment-error-create': 'Payment Creation Error',
          'toast-payment-error-method': 'Payment Method Error',
          'payment-modal-submit-button': 'Submit',
          'payment-modal-cancel-button': 'Cancel',
          'toast-payment-processing': 'Payment Processing',
          'toast-payment-approved': 'Payment Approved',
          'toast-payment-cancelled': 'Payment Cancelled',
          'modal-title': 'Online Payment'
        }
    if (_.chain(translations).keys().contains(key)) {
      return translations[key]
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
    meta: instance.data.meta
  }
  const callback = (error, paymentId) => {
    if (error) {
      Log.log(['warning', 'payment', 'braintree', 'dropin'], error)
      Toast.show(['payment'], instance.translate('toast-payment-error-create'))
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
            instance.translate('toast-payment-processing'))
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
        Toast.show(['braintree'], instance.translate('toast-payment-approved'))

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

  translate(key) {
    const instance = Template.instance()
    return instance.translate(key)
  },

  title() {
    const instance = Template.instance()
    return instance.data.title?instance.data.title:
        instance.translate('modal-title')
  },

  intro() {
    const instance = Template.instance()
    return instance.data.intro?instance.data.intro:undefined
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

// event handlers
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
                instance.translate('toast-payment-error-payment-method'))
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
    Toast.show(['braintree'], instance.translate('toast-payment-cancelled'))

    // close the modal
    closeModal()
  }
})

// cleanup
Template.braintreeDropinModal.onDestroyed(() => {
  const instance = Template.instance()
  if (instance.dropin) {
    instance.dropin.teardown()
  }
})
