import { Meteor } from 'meteor/meteor';

import './imports/publications/parties';
import './imports/publications/users';
import '../both/methods/parties.methods';
import './imports/publications/images';

import './imports/publications/vendors';
import './imports/publications/baseitems';

// import AmazonApi from './imports/fixtures/amazon.api';
// import EbayApi from './imports/fixtures/ebay.api';

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

  // const ebayApi: EbayApi = new EbayApi();
  //
  // ebayApi.getItemsAdvanced(["audi"], {ebayPage: 1}, (amazonErr, amazonResult) => {
  //   console.log(amazonErr);
  //   console.log(amazonResult);
  // });

});
