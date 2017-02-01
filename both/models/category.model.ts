import { CollectionObject } from './collection-object.model';

export interface Category extends CollectionObject {
  CategoryID: string;
  CategoryLevel: string;
  CategoryName: string;
  CategoryParentID: string;
  CategoryNamePath: string;
  CategoryIDPath: string;
  LeafCategory: string;
}
