import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { ProductsListComponent } from './products/products-list.component';
import { ProductDetailsComponent } from './products/product-details.component';
// import {SignupComponent} from "./auth/signup.component";
// import {RecoverComponent} from "./auth/recover.component";
// import {LoginComponent} from "./auth/login.component.web";

export const routes: Route[] = [
  { path: '', component: ProductsListComponent },
  { path: 'detail', component: ProductDetailsComponent }
  // { path: 'login', component: LoginComponent },
  // { path: 'signup', component: SignupComponent },
  // { path: 'recover', component: RecoverComponent }
];
