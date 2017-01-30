import { Meteor } from 'meteor/meteor';

import './imports/publications/parties';
import './imports/publications/users';
import '../both/methods/parties.methods';
import './imports/publications/images';
import './imports/publications/vendors';
import './imports/fixtures/amazon';

import { AccessLogs } from '../both/collections/accesslogs.collection';

Meteor.startup(() => {

  Meteor.onConnection(function(conn) {
    var now = new Date();
    AccessLogs.insert({
      lastActivity: now.getTime(),
      clientAddress: conn.clientAddress,
      httpHeaders: conn.httpHeaders,
      dateTime: now
    });
  });

});
