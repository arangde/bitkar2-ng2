import { CollectionObject } from './collection-object.model';

export interface Product extends CollectionObject {
  itemId: any;
  viewItemURL: string;
  galleryURL: string;
  title: string;
  subtitle?: string;
  seoURL: string;
  vendor: string;
  price?: number;
  sessionId: string;
}
