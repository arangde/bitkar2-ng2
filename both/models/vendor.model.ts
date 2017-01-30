import { CollectionObject } from './collection-object.model';

export interface Vendor extends CollectionObject {
  name: string;
  label: string;
  key: string;
  feed?: string;
  sortKey: string;
}
