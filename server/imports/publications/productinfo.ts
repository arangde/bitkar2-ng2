import { Meteor } from 'meteor/meteor';
import { ProductInfo } from '../../../both/collections/productinfo.collection';

Meteor.publish('productinfo', function() {
  return ProductInfo.collection.find({});
});