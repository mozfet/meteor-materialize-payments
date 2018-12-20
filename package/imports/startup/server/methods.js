// imports
import PaymentsApi from 'imports/api/server'

// methods
Meteor.methods({
  'payments.create': PaymentsApi.create,
  'payments.cancel': PaymentsApi.cancel,
  'payments.reset': PaymentsApi.reset
})
