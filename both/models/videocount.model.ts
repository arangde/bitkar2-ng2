import { CollectionObject } from './collection-object.model';

export interface VideoCount extends CollectionObject {
  sessionId: string;
  totalResults: any;
  resultsPerPage: any;
  totalPages: any;
  nextPageToken?: string;
  prevPageToken?: string;
  lastActivity: number;
}
