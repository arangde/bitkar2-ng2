import { CollectionObject } from './collection-object.model';

export interface Video extends CollectionObject {
  sessionId: string;
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  lastActivity: number;
}
