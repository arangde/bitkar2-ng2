import { CollectionObject } from './collection-object.model';

export interface Video extends CollectionObject {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  sessionId?: string;
  publishedAt?: string;
  lastActivity?: number;
  categoryId?: string;
  vendor?: string;
}
