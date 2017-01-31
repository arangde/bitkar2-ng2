import { CollectionObject } from './collection-object.model';

export interface BaseVideoCount extends CollectionObject {
  totalResults: number;
  resultsPerPage: number;
  totalPages: number;
  nextPageToken?: string;
  prevPageToken?: string;
  categoryId: string;
  vendor: string;
}
