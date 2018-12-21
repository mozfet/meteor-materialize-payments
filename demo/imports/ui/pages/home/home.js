import './home.html'

Template.App_home.helpers({
  transaction() {
    const instance = Template.instance()
    return {
      amount: 5,
      currency: 'EUR',
      meta: {
        product: 'PREMIUM_ACCOUNT'
      }
    }
  }
})
