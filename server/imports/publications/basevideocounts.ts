import { Meteor } from 'meteor/meteor';
import { BaseVideoCounts } from '../../../both/collections/basevideocounts.collection';

Meteor.publish('basevideocounts', (options) => {
  const selector = {};

  return BaseVideoCounts.find(selector);
});