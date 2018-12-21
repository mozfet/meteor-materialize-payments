// imports
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import './braintreeDropinModal'
import './buyButton.html'

// on created
Template.buyButton.onCreated(() => {
  const instance = Template.instance()
})

// on rendered
Template.buyButton.onRendered(() => {
  const instance = Template.instance()
})

// helpers
Template.buyButton.helpers({
  helper() {
    const instance = Template.instance()
    return 'help'
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
