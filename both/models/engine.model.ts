import { CollectionObject } from './collection-object.model';

export interface Engine extends CollectionObject {
  EngineLegacyID: number;
  EngType?: any;
  Liter?: any;
  CC?: any;
  CID?: any;
  Fuel?: any;
  FuelDel?: any;
  Asp?: any;
  EngVIN?: any;
  EngDesg?: any;
}
