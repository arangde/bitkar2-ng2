import { CollectionObject } from './collection-object.model';

export interface Vehicle extends CollectionObject {
  LegacyVehicleID: number;
  VehicleID: number;
  Year: number;
  Make: string;
  Model: string;
  Submodel: string
  EngineLegacyID: number;
  Country?: string;
}
