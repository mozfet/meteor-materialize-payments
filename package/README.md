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

## Usage - client side

Click and buy button template js:
```js
import Payment from 'meteor/mozfet:materialize-payments'

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
```

Click and buy button template html:
```html
<template name="myPaymentButton" >
  <button class="btn">Pay $5</button>
</template>
```

Show the payment button in any client template html
```html
{{> myPaymentButton}}
```
