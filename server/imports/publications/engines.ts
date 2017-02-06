import { Meteor } from 'meteor/meteor';
import { Engines } from '../../../both/collections/engines.collection';
import { Vehicles } from '../../../both/collections/vehicles.collection';

Meteor.publish('engines', function(options) {
  let selector = {};

  if(options.year) {
    selector["Year"] = options.year;
  }
  if(options.make) {
    selector["Make"] = options.make;
  }
  if(options.model) {
    selector["Model"] = options.model;
  }

  const engineIds: Array<any> = [];

  Vehicles.collection.find(selector).forEach(function(vehicle) {
    if(engineIds.indexOf(vehicle['EngineLegacyID']) === -1) {
      engineIds.push(vehicle['EngineLegacyID']);
    }
  });

  if(engineIds.length) {
    return Engines.find({"EngineLegacyID": {"$in": engineIds}});
  }
  else {
    this.ready();
  }
});