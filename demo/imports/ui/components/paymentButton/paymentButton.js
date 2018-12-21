import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Payment } from 'meteor/mozfet:materialize-payments'
import './paymentButton.html'

Template.paymentButton.onCreated(() => {
  const instance = Template.instance()
  instance.state = {
    paymentId: new ReactiveVar()
  }
})

Template.paymentButton.events({
  'click .btn'(event, instance) {
    Payment.create(
      {
        type: 'BRAINTREE',
        amount: 5,
        currency: 'EUR',
        meta: {
          productId: '1234'
        }
      },
      (error, paymentId) => {
        if (error) {
          Log.log(['error', 'payment'], error)
        }
        else {
          Log.log(['information', 'payment'], 'Payment created:', paymentId)
          instance.state.paymentId.set(paymentId)
        }

      }
    )
  }
})

Template.paymentButton.helpers({
  paymentId() {
    const instance = Template.instance()
    return instance.state.paymentId.get()
  }
})
