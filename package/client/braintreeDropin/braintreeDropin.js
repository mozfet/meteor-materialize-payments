/*jshint esversion: 6 */
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import PaymentsApi from '../../../../../client/api';
import BraintreeApi from '../../../api';
import BraintreeDropin from 'braintree-web-drop-in';
import Braintree from 'braintree-web';
import './braintreeDropin.html';

Log.log(['debug', 'braintree'], 'Initialised braindtree web component.', Braintree);

//define templates
Template.braintreeDropin.onCreated(() => {
  const instance = Template.instance();

  //subscribe to payments publication
  instance.subscribe('payments');

  //define reactive vars
  instance.paymentId = new ReactiveVar();
  instance.payment = new ReactiveVar();
  instance.paymentMethodRequestable= new ReactiveVar(false);
  instance.paymentOptionSelected= new ReactiveVar(false);
  instance.nonce = new ReactiveVar();
  instance.token = new ReactiveVar();
  instance.isProcessing = new ReactiveVar(false);

  //create a payment
  const args = {
    type: 'BRAINTREE',
    amount: instance.data.amount,
    currency: instance.data.currency,
    credits: instance.data.credits
  };
  const callback = (error, result) => {
    if(error) {
      const msg = 'error creating payment id';
      Materialize.toast(msg);
      Log.log(['error', 'braintree', 'dropin'], msg);
    }
    else {
      Log.log(['information', 'braintree'], 'braintree dropin payment id', result);
      instance.paymentId.set(result);
    }
  };

  Meteor.call('payments.create', args, callback);
  // PaymentsApi.create(args, callback);

  //prevent client token from being called more than once
  // const getClientToken = _.once(BraintreeApi.getClientToken);

});

Template.braintreeDropin.onRendered(() => {
  const instance = Template.instance();

  //autorun
  instance.autorun(() => {

    //when payment id changes
    const paymentId = instance.paymentId.get();

    //if payment id is defined
    if(paymentId) {

      //get payment
      const payment = Payments.findOne(paymentId);
      Log.log(['debug', 'braintree'], 'braintree dropin payment', payment);
      instance.payment.set(payment);

      //if payment is in created state
      if(payment && payment.state==='CREATED') {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state CREATED', []);

        //get the client token from the server
        Meteor.call('braintree.generateClientToken', {id: payment._id}, (error, response) => {
          Log.log(['debug', 'braintree'], 'braintree client token generated', [error, response]);
        });
      }

      //else if payment is in processing state
      else if(payment && (payment.state === 'PROCESSING')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state PROCESSING');
        instance.isProcessing.set(true);
        Materialize.toast('payment processing', 5000);
      }

      //else if payment is in error state
      else if(payment && (payment.state === 'ERROR')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state ERROR', payment.errorMessage);
        Materialize.toast(payment.errorMessage);
      }

      //else if payment is in rejected state
      else if(payment && (payment.state === 'REJECTED')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state REJECTED', payment.message);
        Materialize.toast(payment.message);
      }

      //else if payment is in approved state
      else if(payment && (payment.state === 'APPROVED')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state APPROVED');
        Materialize.toast('payment approved', 5000);
      }

      //else if braintree client token exists
      else if(payment && (payment.state === 'TOKENIZED')) {
        Log.log(['debug', 'braintree'], 'braintree dropin payment state TOKENIZED');

        //create dropin using token as authorization
        BraintreeDropin.create(
          {
            authorization: payment.braintree.clientToken,
            container: '#braintree-dropin-container',
            paypal: {
              flow: 'vault'
            }
          },
          function (error, dropinInstance) {

            //if error
            if(error) {

              //log and inform user
              const msg = 'error creating braintree dropin';
              Log.log(['warning', 'braintree'], msg, error);
              Materialize.toast(msg, 10000);
            }

            //else - no error
            else {
              Log.log(['information', 'braintree'], 'braintree dropin instance created');

              //assign dropin instance to template
              instance.dropin = dropinInstance;

              if (instance.dropin.isPaymentMethodRequestable()) {
                // This will be true if you generated the client token
                // with a customer ID and there is a saved payment method
                // available to tokenize with that customer.
                instance.paymentMethodRequestable.set(true);
              }

              //when payment method is requestable
              instance.dropin.on('paymentMethodRequestable', (event) => {

                //mark reactive var
                Log.log(['information', 'braintree'], 'braintree dropin payment method is requestable');
                instance.paymentMethodRequestable.set(true);
              });

              //when payment method is set
              instance.dropin.on('paymentOptionSelected', (event) => {

                //mark reactive var
                Log.log(['information', 'braintree'], 'braintree dropin payment option is selected');
                instance.paymentOptionSelected.set(true);
              });
            }
          }
        );
      }
    }
  });
});

Template.braintreeDropin.helpers({
  ready() {
    const instance = Template.instance();
    if(instance.payment.get() && (instance.payment.get().status === 'TOKENIZED')) {
      return true;
    }
    return false;
  },
  payButtonAttr() {

    //pay button is disabled if no payment method is available
    const instance = Template.instance();
    const disabled = (!instance.paymentMethodRequestable.get()) || instance.isProcessing.get();
    return {
      'class': disabled?'btn disabled':'btn',
      'type': 'submit'
    };
  }
});

Template.braintreeDropin.events({
  'submit .braintreeDropinForm'(event) {
    event.preventDefault();
    const instance = Template.instance();

    if(instance.payment.get().state === 'TOKENIZED') {
      if(instance.dropin.isPaymentMethodRequestable()) {
        instance.dropin.requestPaymentMethod(function (error, payload) {

          //if error
          if(error) {
            const msg = 'error obtaining payment method';
            Log.log(['warning', 'braintree'], msg, error, payload);
            Materialize.toast(msg);
          }

          //else - no error
          else {
            Log.log(['information', 'braintree'], 'braintree dropin payment method:', payload);

            //braintree payment with nonce
            BraintreeApi.payment({id: instance.paymentId.get(), nonce: payload.nonce});
          }
        });
      }
    }
  }
});

Template.braintreeDropin.onDestroyed(() => {
  const instance = Template.instance();
  if(instance.dropin) {
    instance.dropin.teardown();
  }
});
