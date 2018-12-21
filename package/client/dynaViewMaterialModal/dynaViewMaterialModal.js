// imports
import { Template } from 'meteor/templating'
import './dynaViewMaterialModal.html'

// when created
Template.DynaViewMaterialModal.onRendered(() => {

  // init modal
  const instance = Template.instance()
  const selector = '#'+instance.data.id
  Log.log(['debug', 'dyna'], 'DynaViewMaterialModal selector:', selector)
  $(selector).modal({
    dismissible: true,
    complete() {
      Session.set('DynaView', undefined)
    }
  })
  $(selector).modal('open')
})
