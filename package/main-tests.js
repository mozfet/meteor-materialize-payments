// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by meteor-materialize-braintree.js.
import { name as packageName } from "meteor/meteor-materialize-payments";

// Write your tests here!
// Here is an example.
Tinytest.add('meteor-materialize-braintree - example', function (test) {
  test.equal(packageName, "meteor-materialize-payments");
});
