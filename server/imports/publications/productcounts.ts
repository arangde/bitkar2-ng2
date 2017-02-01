import { Meteor } from 'meteor/meteor';
import { ProductCounts } from '../../../both/collections/productcounts.collection';

Meteor.publish('productcounts', function(filter, options) {
  if(options.vendor) {
    filter.vendor = options.vendor;
  }

  return ProductCounts.collection.find(filter);
});