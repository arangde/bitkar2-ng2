import { CollectionObject } from './collection-object.model';

export interface VideoCount extends CollectionObject {
  sessionId: string;
  totalResults: number;
  resultsPerPage: number;
  totalPages: number;
  nextPageToken?: string;
  prevPageToken?: string;
  categoryId: string;
  vendor: string;
}
