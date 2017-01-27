import { Meteor } from 'meteor/meteor';

import { getValueOfKey } from './imports/fixtures/utils';
import { AccessLogs } from '../both/collections/accesslogs.collection';

import './imports/publications/parties';
import './imports/publications/users';
import '../both/methods/parties.methods';
import './imports/publications/images';

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
