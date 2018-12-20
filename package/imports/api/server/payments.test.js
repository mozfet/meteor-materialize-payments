// /* jshint esversion: 6 */
// import { Meteor } from 'meteor/meteor';
// import { Accounts } from 'meteor/accounts-base';
// import { EJSON } from 'meteor/ejson';
// import { chai } from 'meteor/practicalmeteor:chai';
// import { Factory } from 'meteor/dburles:factory';
// import Sinon from 'sinon';
// import { resetDatabase } from 'meteor/xolvio:cleaner';
// import {db, createChild} from '../../../test/test-helpers';
// import Log from '../../log';
//
// // import '../both/startup';
// import './startup';
// import PaymentsApi from './api';
//
// //server tests
// if(Meteor.isServer) {
//
//   describe('Payments', function() {
//
//     //before each test
//     beforeEach(function() {
//
//       Sinon.stub(Log, 'log').callsFake(function () {
//         return undefined;
//       });
//       resetDatabase();
//     });
//
//     //after each test
//     afterEach(function() {
//
//       Log.log.restore();
//       resetDatabase();
//     });
//
//     //test payment creation
//     it('create payment', function (done) {
//       const paymentId = PaymentsApi.create({
//         type: 'BRAINTREE',
//         amount: 1,
//         currency: 'EUR',
//         credits: 1
//       });
//       const payment = Payments.findOne(paymentId);
//       chai.assert.equal(payment.type, 'BRAINTREE');
//       done();
//     });
//
//   });
// }
