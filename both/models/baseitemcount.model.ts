import { CollectionObject } from './collection-object.model';

export interface BaseItemCount extends CollectionObject {
  categoryId: string;
  total: {
    totalEntries?: any;
    totalPages?: any;
    pageNumber?: any;
    entriesPerPage?: any;
  };
  vendor: string;
}
