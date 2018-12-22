// imports
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import '../braintreeDropinModal/braintreeDropinModal'
import './buyButton.html'

// on created
Template.buyButton.onCreated(() => {
  const instance = Template.instance()
  console.log('buyButton instance data', instance.data)
})

// on rendered
Template.buyButton.onRendered(() => {
  const instance = Template.instance()
})

// helpers
Template.buyButton.helpers({
  transaction() {
    const instance = Template.instance()
    return {
      amount: instance.data.amount,
      currency: instance.data.currency,
      meta: instance.data.meta,
      title: instance.data.title,
      intro: instance.data.intro,
      translations: instance.data.translations
    }
  }
})

// events
Template.buyButton.events({

  //on click class
  'click .className'(event, instance) {
  }
})

// on destroyed
Template.buyButton.onDestroyed(() => {
  const instance = Template.instance()
})
