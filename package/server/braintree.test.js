// /* jshint esversion: 6 */
// import { Meteor } from 'meteor/meteor';
// import { Accounts } from 'meteor/accounts-base';
// import { EJSON } from 'meteor/ejson';
// import { chai } from 'meteor/practicalmeteor:chai';
// import { Factory } from 'meteor/dburles:factory';
// import Sinon from 'sinon';
// import { resetDatabase } from 'meteor/xolvio:cleaner';
// import {db, createChild} from '../../../../test/test-helpers';
// import Log from '../../../log';
//
// // import '../../both/startup';
// import '../../server/startup';
// import PaymentsApi from '../../server/api';
// import Braintree from './api';
//
// //user factory
// Factory.define('user', Meteor.users, {
//   profile: {},
// });
//
// //payment factory
// Factory.define('payment', Payments, {
//   type: () => 'BRAINTREE',
//   amount: () => 1,
//   currency: () => 'EUR',
//   credits: () => 1,
//   ownerId: () => Factory.get('user')
// });
//
// //server tests
// if(Meteor.isServer) {
//
//   describe('Braintree', function() {
//
//     //before each test
//     let paymentId;
//     const user = {
//       _id: '1234'
//     };
//     beforeEach(function() {
//
//       //create stubs
//       Sinon.stub(Meteor, 'userId').callsFake(function () {
//         return user._id;
//       });
//       Sinon.stub(Meteor, 'user').callsFake(function () {
//         return user;
//       });
//       Sinon.stub(Meteor.users, 'findOne').callsFake(function (args) {
//         return user;
//       });
//       Sinon.stub(Meteor.users, 'update').callsFake(function (args) {
//         return user;
//       });
//       Sinon.stub(Log, 'log').callsFake(function () {
//         return undefined;
//       });
//
//       //reset the database
//       resetDatabase();
//       Meteor._sleepForMs(50);
//
//       //create payment
//       paymentId = PaymentsApi.create({
//         type: 'BRAINTREE',
//         amount: 1,
//         currency: 'EUR',
//         credits: 1
//       });
//     });
//
//     //after each test
//     afterEach(function() {
//
//       //restore stubs
//       Meteor.userId.restore();
//       Meteor.user.restore();
//       Meteor.users.findOne.restore();
//       Meteor.users.update.restore();
//       Log.log.restore();
//
//       //reset the database
//       resetDatabase();
//       Meteor._sleepForMs(50);
//     });
//
//     //test gateway connection
//     it('connect gateway', function () {
//       // console.log('braintree gateway:', Braintree.gateway);
//       chai.assert.isObject(Braintree.gateway, 'braintree gateway must exist in order to do credit card payments');
//     });
//
//     //test async generate client token
//     it('generates client token', function (done) {
//       this.timeout(10000);
//       const clientToken = Braintree.generateClientToken({id: paymentId}, function (err, result) {
//         chai.assert.isString(result.clientToken, 'client token is a string');
//         done();
//       });
//     });
//
//     //test async make payment
//     it('make payment', function (done) {
//       this.timeout(10000);
//       const result = Braintree.payment({
//         id: paymentId,
//         nonce: 'fake-valid-nonce'
//       }, function (err, result) {
//         if(err) {
//           try {
//             chai.assert.fail(err);
//           } catch (e) {
//           } finally {
//             done();
//           }
//
//         }
//         else {
//           chai.assert.isObject(result, 'result is a object containg object transaction and boolean status');
//           const hasTransaction = _.contains(_.keys(result), 'transaction');
//           const hasSuccess = _.contains(_.keys(result), 'success');
//           chai.assert.isTrue(hasTransaction, 'sale response object has a transaction member');
//           chai.assert.isTrue(hasSuccess, 'sale response object has a success member');
//           chai.assert.isTrue(result.success, 'transaction should be a success if it is not a duplicate');
//
//           const creditsCount = Credits.find({paymentId: paymentId}).count();
//           chai.assert.equal(creditsCount, 1, 'purchased 1 token');
//           done();
//         }
//       });
//     });
//   });
// }
