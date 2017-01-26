import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { ProductsListComponent } from './products/products-list.component';
import { ProductDetailsComponent } from './products/product-details.component';

export const routes: Route[] = [
  { path: '', component: ProductsListComponent },
  { path: 'detail', component: ProductDetailsComponent }
];
