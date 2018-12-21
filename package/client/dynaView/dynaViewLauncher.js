import { Session } from 'meteor/session'
import { EJSON } from 'meteor/ejson'
import './dynaViewLauncher.html'

Template.DynaViewLauncher.events({
  "click .js-dynaview-launcher": function(event, instance){
    Log.log(['debug', 'dyna'], 'DynaView launcher template:', instance.data.dvTemplate)
    Log.log(['debug', 'dyna'], 'DynaView launcher data:', instance.data.dvData)
    Session.set('DynaView', EJSON.stringify({
      template: instance.data.dvTemplate,
      data: instance.data.dvData
    }))
  }
})
