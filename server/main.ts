import { Meteor } from 'meteor/meteor';

import './imports/publications/parties';
import './imports/publications/users';
import '../both/methods/parties.methods';
import './imports/publications/images';

import './imports/publications/vendors';
import './imports/publications/baseitems';
import './imports/publications/baseitemcounts';
import './imports/publications/basevideos';
import './imports/publications/basevideocounts';
import './imports/publications/brands';
import './imports/publications/categories';
import './imports/publications/engines';
import './imports/publications/vehicles';
import './imports/publications/globalparts';


// import AmazonApi from './imports/fixtures/amazon.api';
// import EbayApi from './imports/fixtures/ebay.api';
// import LocalFeedApi from './imports/fixtures/localfeed.api';

import { CJFeeds, PJFeeds } from './imports/collections/localfeeds.collection';
import { AccessLogs } from './imports/collections/accesslogs.collection';

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


  // const localfeedApi: LocalFeedApi = new LocalFeedApi();
  //
  // localfeedApi.getCJItem("5855576c847e136b4e5709b6", (amazonErr, amazonResult) => {
  //   console.log(amazonErr);
  //   console.log(amazonResult);
  // });

});
