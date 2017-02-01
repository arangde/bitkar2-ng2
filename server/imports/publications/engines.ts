import { Meteor } from 'meteor/meteor';
import { Engines } from '../../../both/collections/engines.collection';
import { Vehicles } from '../../../both/collections/vehicles.collection';

Meteor.publish('engines', function(options, filter) {
  let selector = {};

  if(filter.year) {
    selector["Year"] = filter.year;
  }
  if(filter.make) {
    selector["Make"] = filter.make;
  }
  if(filter.model) {
    selector["Model"] = filter.model;
  }

  const engineIds: Array<any> = [];

  Vehicles.find(selector).forEach(function(vehicle) {
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