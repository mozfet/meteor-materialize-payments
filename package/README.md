# MaterializeCSS Payments for Braintree

## Thank you

This package was created and is maintained by [The Expert Box](https://www.ExpertBox.com) as a thank you to the open source community.

## Installation - server side

Create settings-developement.json with your Braintree sandbox credentials and settings-production.json with your production credentials. Remember that these credentials should be protected, and thus not uploaded to your repo.

```json
{
  "braintree": {
    "environment": "Braintree.Environment.Sandbox",
    "merchantId": "your merchant id",
    "publicKey": "your public key",
    "privateKey": "your private key"
  }
}
```

## Installation - client side

This package makes use of lazy loading and supports dynamic imports, thus before
using the ```buyButton``` template, it must be imported.

Static import
```javascript
import 'meteor/mozfet:materialize-payments'
```

Dynamic import
```javascript
FlowRouter.route('/', {
  name: 'App.home',
  action: async function(params, queryParams) {
    await import('/imports/ui/pages/home/home')
    BlazeLayout.render('App_body', { main: 'App_home' })
  },
})
```

## Usage - client side

Create DynaView inside top level container html; this is used to anchor dialogs to.
Create buyButtons anywhere in template code.
```html
<template name="App_home">
  <div class="container">
    <div class="row">
      <div class="col s12">
        <h1>Materialize Payment Demo</h1>
        {{> loginButtons}}
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        {{> buyButton amount=3 currency='EUR'}}
        {{> buyButton transactionBasic}}
        {{> buyButton transactionIntermediate}}
        {{> buyButton transactionAdvanced}}
      </div>
    </div>
    {{> DynaView}}
  </div>
</template>
```

Define template helpers with transaction data to customise modal text and payment data.

```js
import { Template } from 'meteor/templating'
import 'meteor/mozfet:materialize-payments'
import './home.html'

Template.App_home.helpers({
  transactionBasic() {
    const instance = Template.instance()
    return {
      amount: 14,
      currency: 'EUR'
    }
  },
  transactionIntermediate() {
    const instance = Template.instance()
    return {
      amount: 7,
      currency: 'EUR',
      productCode: 'SUBSCRIPTION',
      texts: {
        'product-name': 'Professional Account',
        'buy-button': 'Buy 1 year Subscription'
      }
    }
  },
  transactionAdvanced() {
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
```
