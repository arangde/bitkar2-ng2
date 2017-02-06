import { CollectionObject } from './collection-object.model';

export interface BaseItem extends CollectionObject {
  itemId: any;
  categoryId?: any;
  viewItemURL: string;
  galleryURL: string;
  title: string;
  subtitle?: string;
  seoURL: string;
  vendor: string;
  price: number;
  priceFormatted: string;
}
