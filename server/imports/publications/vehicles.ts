import { Meteor } from 'meteor/meteor';
import { Vehicles } from '../../../both/collections/vehicles.collection';

Meteor.publish('vehicles', function(options) {
  const selector = {};

  if(options.year) {
    selector["Year"] = options.year;
  }
  if(options.make) {
    selector["Make"] = options.make;
  }

  return Vehicles.find(selector);
});