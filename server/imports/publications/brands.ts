import { Meteor } from 'meteor/meteor';
import { Brands } from '../../../both/collections/brands.collection';

Meteor.publish('brands', function() {
  const selector = {};

  return Brands.collection.find(selector);
});