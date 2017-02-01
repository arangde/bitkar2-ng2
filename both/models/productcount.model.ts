import { CollectionObject } from './collection-object.model';

export interface ProductCount extends CollectionObject {
  sessionId: number;
  total: {
    pageNumber?: any;
    entriesPerPage?: any;
    totalPages?: any;
    totalEntries?: any;
  }
  feed?: string;
  vendor: string;
  lastActivity: number;
}
