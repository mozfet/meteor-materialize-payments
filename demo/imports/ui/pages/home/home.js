import { Template } from 'meteor/templating'
import Payment from 'meteor/mozfet:materialize-payments'
import './home.html'


Template.myPaymentButton.events({
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
