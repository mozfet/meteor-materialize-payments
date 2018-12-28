import { Template } from 'meteor/templating'
import 'meteor/mozfet:materialize-payments'
import 'meteor/mozfet:subscriptions'
import './home.html'

Template.App_home.helpers({
  transactionBasic() {
    const instance = Template.instance()
    return {
      amount: 14,
      currency: 'EUR'
    }
  },
  transactionSubscription() {
    const instance = Template.instance()
    return {
      amount: 7,
      currency: 'EUR',
      productCode: 'PROFESSIONAL_ACCOUNT',
      meta: {
        subscription: {
          duration: {
            years: 1,
            months: 6
          }
        }
      },
      texts: {
        'product-name': '18 Month Professional Account',
        'buy-button': 'Buy a 1 year Subscription, get 6 months Free!'
      }
    }
  },
  transactionCustomized() {
    const instance = Template.instance()
    return {
      amount: 5,
      currency: 'EUR',
      productCode: 'PREMIUM_ACCOUNT',
      buyButtonClass: 'btn-large orange waves-dark black-text',
      title: 'Pay for your stuff!',
      texts: {
        'product-name': 'Premium Account',
        'buy-button': 'Buy Premium Account',
        'modal-title': 'Time to pay the bill',
        'modal-intro': 'You are buying a one year premium account subscription.',
        'modal-submit-button': 'Pay the man',
        'modal-cancel-button': 'Run away',
        'toast-payment-cancelled': 'Cancelleroo',
        'toast-payment-success': 'Okidoki',
        'toast-payment-error-create': 'Crap',
        'toast-payment-error-method': 'Other Crap',
        'toast-payment-processing': 'Please wait',
        'toast-payment-approved': 'You won!',
        'toast-payment-cancelled': 'Chicken!',
      }
    }
  }
})
