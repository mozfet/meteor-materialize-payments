import { Template } from 'meteor/templating'
import Payment from 'meteor/mozfet:materialize-payments'
import './paymentButton.html'

Template.paymentButton.events({
  'click .btn'(event, instance) {
    Payment.create({
      type: 'BRAINTREE',
      amount: 5,
      currency: 'EUR',
      meta: {
        productId: '1234'
      }
    })
  }
})
