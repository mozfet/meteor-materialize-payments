/* jshint esversion: 6 */
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Tracker } from 'meteor/tracker';
import { EJSON } from 'meteor/ejson';
import { chai } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';
import Sinon from 'sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import 'hammerjs';
import 'materialize-css/dist/js/materialize.js';

// import '../../../../../both/startup.js';
import './braintreeDropin.js';

const withDiv = function withDiv(callback) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

export const withRenderedTemplate = function withRenderedTemplate(template, data, callback) {
  withDiv((el) => {
    const ourTemplate = _.isString(template) ? Template[template] : template;
    Blaze.renderWithData(ourTemplate, data, el);
    Tracker.flush();
    callback(el);
  });
};

//client environment
if(Meteor.isClient) {
  describe('Braintree Dropin', function() {

    //before each test
    beforeEach(function() {
      Sinon.stub(Materialize, 'toast').callsFake(function () {
      });
      resetDatabase();
    });

    //after each test
    afterEach(function() {
      Materialize.toast.restore();
      resetDatabase();
    });

    //test display of the Dropin
    it('displays dropin', function (done) {

      //define template data
      const data = {
        type: 'BRAINTREE',
        amount: 1,
        currrency: 'EUR',
        credits: 1
      };

      //render template using sync function
      withRenderedTemplate('braintreeDropin', data, el => {
        console.log('test.el:', el);

        const q = $(el).find('#braintree-dropin-container').html();
        console.log('test.q:', q);

        //mark test as done
        done();
      });
    });
  });
}
