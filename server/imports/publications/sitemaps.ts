import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Sitemaps } from '../../../both/collections/sitemaps.collection';

Meteor.publish('sitemaps', function(options, filter) {
  if(filter.dir == 'categories') {
    options = {};
  }
  else if(filter.dir == 'merged') {
    options.sort = {"file": 1};
  }
  else {
    options.sort = {"dirId": 1};
  }

  Counts.publish(this, 'numberOfSitemaps', Sitemaps.collection.find(filter), {
    noReady: true
  });

  return Sitemaps.collection.find(filter, options);
});