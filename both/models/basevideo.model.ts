import { CollectionObject } from './collection-object.model';

export interface BaseVideo extends CollectionObject {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
  categoryId: string;
  vendor: string;
}
