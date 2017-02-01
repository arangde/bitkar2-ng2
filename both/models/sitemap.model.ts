import { CollectionObject } from './collection-object.model';

export interface Sitemap extends CollectionObject {
  dir: string;
  file: string;
  dirId: number;
}
