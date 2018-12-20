import { check, Match } from 'meteor/check';

import Access from '/imports/api/access';

// before payment insert
Payments.before.insert(function (userId, doc) {

  // set owner id
  doc.ownerId = userId;

  // set initial state
  doc.state = 'CREATED';

  // set creation and update time
  doc.createdAt = doc.updatedAt = new Date();

  // set credit validity days
  doc.creditValidityDays = 365;
});

// before payment update
Payments.before.update(function (userId, doc, fieldNames, modifier, options) {

  // set update time
  doc.updatedAt = new Date();
});

// client permissions - only admin users can mutate payments
Payments.allow(Access.adminCreateUpdateRemove);

// publications
Meteor.publish('payments', function () {
  const userId = Meteor.userId();

  // if user is admin
  if(Access.isAdmin(userId)) {

    // publish all payments
    return Payments.find({});
  }

  // all other users
  else {

    // publish all payments user sent or recieved or is owner of
    return Payments.find({$or: [
      {ownerId: userId}, {senderId: userId}, {recieverId: userId}
    ]});
  }
});

// publications
Meteor.publish('payments.session', function (sessionId) {
  check(sessionId, String);
  const userId = Meteor.userId();

  // if user is admin
  if(Access.isAdmin()) {

    return Payments.find({
      'meta.sessionId': sessionId
    });
  }

  // all other users
  else {

    // publish all payments user sent or recieved
    return Payments.find({
      'meta.sessionId': sessionId,
      $or: [{senderId: userId}, {recieverId: userId}]
    });
  }
});
