// imports
import {Template} from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import PaymentsApi from '../../../../../client/api'
import BraintreeApi from '../../../api'
import BraintreeDropin from 'braintree-web-drop-in'
import Braintree from 'braintree-web'
import Locale from '../../../../../../locale'
import Toast from '/imports/ui/components/toast'
import '../../../../../../../ui/components/DynaViewMaterialModal'
import './braintreeDropinModal.html'

// define templates
Template.braintreeDropinModal.onCreated(() => {
  const instance = Template.instance()

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

  // create a payment
  const args = {
    type: 'BRAINTREE',
    amount: instance.data.quote.amount,
    currency: instance.data.quote.currency,
    credits: instance.data.quote.credits,
    quote: instance.quote
  }
  const callback = (error, result) => {
    if(error) {
      const msg = 'error creating payment id'
      Log.log(['warning', 'braintree', 'dropin'], msg, [])
      Materialize.toast(msg)
    }
    else {
      Log.log(['information', 'braintree'], 'braintree dropin payment id', [result])
      instance.paymentId.set(result)
    }
  }

  Meteor.call('payments.create', args, callback)
})

Template.braintreeDropinModal.onRendered(() => {
  const instance = Template.instance()

  // autorun
  instance.autorun(() => {

    // when payment id changes
    const paymentId = instance.paymentId.get()

    // if payment id is defined
    if(paymentId) {

      // get payment
      const paymentCursor = Payments.find({_id: paymentId})
      const payment = _.first(paymentCursor.fetch())
      Log.log(['debug', 'braintree'], 'braintree dropin payment', payment)
      instance.payment.set(payment)

      // if payment is in created state
      if(payment && payment.state==='CREATED') {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state CREATED', [])

        // get the client token from the server
        Meteor.call('braintree.generateClientToken',
            {id: payment._id}, (error, response) => {
          Log.log(['debug', 'braintree'], 'braintree client token generated', [error, response])
        })
      }

      // else if payment is in processing state
      else if(payment && (payment.state === 'PROCESSING')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state PROCESSING')
        Meteor.call('track', {tag: 'paymentProcessing', category: 'payment',
            action: 'processing'})
        instance.isProcessing.set(true)
        Toast.show(['braintree'], 'payment processing')
      }

      // else if payment is in error state
      else if(payment && (payment.state === 'ERROR')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state ERROR',
            payment.errorMessage)
        Meteor.call('track', {tag: 'paymentError', category: 'payment',
            action: 'error'})
        $('#buyCreditsModal').modal('close')
        Materialize.toast(payment.errorMessage)
      }

      // else if payment is in rejected state
      else if(payment && (payment.state === 'REJECTED')) {
        Log.log(['debug', 'braintree'],
            'braintree dropin payment state REJECTED', payment.message)
        Meteor.call('track', {tag: 'paymentRejected', category: 'payment',
            action: 'rejected'})
        $('#buyCreditsModal').modal('close')
        Materialize.toast(payment.message)
      }

      // else if payment is in approved state
      else if(payment && (payment.state === 'SETTLED')) {
        Log.log(['debug', 'braintree'],
            'braintree dropin payment state SETTLED')

        // inform user of success
        Toast.show(['braintree'],'payment approved')

        // create tracking event
        Meteor.call('track', {tag: 'paymentSettled', category: 'payment',
            action: 'settled', value: payment.credits})

        // close modal
        $('#buyCreditsModal').modal('close')
      }

      // else if braintree client token exists
      else if(payment && (payment.state === 'TOKENIZED')) {
        Log.log(['debug', 'braintree'],
          'braintree dropin payment state TOKENIZED');

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
            if(error) {

              // log and inform user
              const msg = 'error creating braintree dropin'
              Log.log(['warning', 'braintree'], msg, error)
              Toast.show(['braintree'], msg)
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

  // pay button attributes
  payButtonAttr() {

    // pay button is disabled if no payment method is available
    const instance = Template.instance();
    const disabled = (!instance.paymentMethodRequestable.get()) ||
        instance.isProcessing.get();
    const baseClass = 'btn waves-effect waves-green js-submitPaymentButton'
    return {
      'class': disabled?baseClass+' disabled':baseClass,
      // 'type': 'submit'
    }
  }
})

// event handlers
Template.braintreeDropinModal.events({

  // on click pay button
  'click .js-submitPaymentButton'(event) {
    event.preventDefault();
    const instance = Template.instance();

    // if payment is tokenized
    if(instance.payment.get().state === 'TOKENIZED') {

      // if payment method can be requested
      if(instance.dropin.isPaymentMethodRequestable()) {
        instance.dropin.requestPaymentMethod(function (error, payload) {

          //if error
          if(error) {
            const msg = 'error obtaining payment method';
            Log.log(['warning', 'braintree'], msg, [error, payload]);
            Materialize.toast(msg);
          }

          //else - no error
          else {
            Log.log(['information', 'braintree'], 'braintree dropin payment method:', [payload]);

            // perform braintree payment with nonce
            BraintreeApi.payment({id: instance.paymentId.get(), nonce: payload.nonce});
          }
        })
      }
    }
  },

  // on click cancel button
  'click .js-cancelPaymentButton'(event, template) {
    const instance = Template.instance()
    event.preventDefault()

    // close the modal
    $('#buyCreditsModal').modal('close')

    // cancel the payment
    Meteor.call('payments.cancel', instance.paymentId.get())

    //show toast
    Toast.show(['braintree'], Locale.translate('toast-payment-cancelled'))
  }
})

// cleanup
Template.braintreeDropinModal.onDestroyed(() => {
  const instance = Template.instance();
  if(instance.dropin) {
    instance.dropin.teardown();
  }
});

// on creation of buy creadit button
Template.buyCreditsButton.onCreated(() => {
  const instance = Template.instance();
  instance.ready = new ReactiveVar(false);

  // subscribe to quotes
  instance.subscribe('quotes', () => {

    // get a quote - then
    Meteor.call('pricing.quote', instance.data.credits, instance.data.currency, (error, quoteId) => {

      //handle error
      if(error) {
        Log.log(['braintree', 'error', 'buyButton'], 'error getting pricing quote', error);
        Toast.show(['braintree'], Locale.translate('toast-connection-error'))
      }
      else {
        instance.data.quote = Quotes.findOne(quoteId);
        instance.ready.set(true);
      }
    })
  })
})

Template.buyCreditsButton.helpers({
  buyButtonAttr() {
    const instance = Template.instance();
    return {
      'href': '#!',
      'class': 'waves-effect waves-green btn js-dynaview-launcher',
      'style': instance.data.style?instance.data.style:''
    };
  },
  translation() {
    const instance = Template.instance();
    return Locale.translate('button-buy-credits', {
      credits: instance.data.quote.credits,
      amount: instance.data.quote.amount,
      currency: instance.data.quote.displayCurrency
    });
  },
  ready() {
    const instance = Template.instance();
    return instance.ready.get();
  }
});
