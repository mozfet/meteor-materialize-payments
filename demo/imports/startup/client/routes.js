// imports
import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import '../../ui/layouts/body/body'

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action: async function(params, queryParams) {
    await import('/imports/ui/pages/home/home')
    BlazeLayout.render('App_body', { main: 'App_home' })
  },
})

FlowRouter.notFound = {
  action: async function(params, queryParams) {
    await import('/imports/ui/pages/notFound/notFound')
    BlazeLayout.render('App_body', { main: 'App_notFound' })
  },
}
