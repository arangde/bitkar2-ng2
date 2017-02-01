import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Products } from '../../../both/collections/products.collection';

Meteor.publish('products', function(options, filter) {
  const selector = {};

  if (filter.priceSort) {
    if(parseInt(filter.priceSort) == 1) {
      options.sort = { price: 1 };
    }
    else if(parseInt(filter.priceSort) == 2) {
      options.sort = { price: -1 };
    }
  }

  if (filter.vendorFilter) {
    selector['vendor'] = filter.vendorFilter;
  }

  if (filter.sessionId) {
    selector['sessionId'] = filter.sessionId;
  }

  Counts.publish(this, 'numberOfProducts', Products.collection.find(selector), {
    noReady: true
  });

  return Products.collection.find(selector, options);
});

Meteor.publish('product', function(productId: string) {
  return Products.collection.find({_id: productId});
});