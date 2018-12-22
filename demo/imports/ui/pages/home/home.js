import './home.html'

Template.App_home.helpers({
  transaction() {
    const instance = Template.instance()
    return {
      amount: 5,
      currency: 'EUR',
      meta: {
        product: 'PREMIUM_ACCOUNT'
      },
      title: 'Pay for your stuff!',
      intro: 'Any additional information to remind user what they are paying for.',
      translations: {
        'toast-payment-cancelled': 'Cancelleroo',
        'toast-payment-success': 'Okidoki',
        'toast-payment-error-create': 'Crap',
        'toast-payment-error-method': 'Other Crap',
        'payment-modal-submit-button': 'Pay the man',
        'payment-modal-cancel-button': 'Run away',
        'toast-payment-processing': 'Please wait',
        'toast-payment-approved': 'You won!',
        'toast-payment-cancelled': 'Chicken!',
        'modal-title': 'Time to pay the bill'
      }
    }
  }
})
