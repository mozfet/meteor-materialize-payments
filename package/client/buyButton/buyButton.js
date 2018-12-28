// imports
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Log } from 'meteor/mozfet:meteor-logs'
import '../spinner/spinner'
import 'meteor/mozfet:dynaview'
import '../braintreeDropinModal/braintreeDropinModal'
import './buyButton.html'

// helpers
Template.buyButton.helpers({
  transaction() {
    const instance = Template.instance()
    Log.log(['debug', 'payments', 'buyButton'],
        'Payment button instance data:', instance.data)
    return instance.data
  },
  buttonText() {
    const instance = Template.instance()
    const texts = instance.data.texts?instance.data.texts:{'buy-button':'Buy'}
    Log.log(['debug', 'payments', 'buyButton'],
        'Texts:', texts)
    return texts['buy-button']
  },
  buttonClass() {
    const instance = Template.instance()
    return instance.data.buyButtonClass?instance.data.buyButtonClass:
        'btn'
  }
})
