import { MongoObservable } from 'meteor-rxjs';

import { Vehicle } from '../models/vehicle.model';

export const Vehicles = new MongoObservable.Collection<Vehicle>('legacyvehicles');

function checkAvailable() {
  return true;
}

Vehicles.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});

export function getVehicleKeywords(vehicle) {
  return [ vehicle.Year, vehicle.Make, vehicle.Model ];
}