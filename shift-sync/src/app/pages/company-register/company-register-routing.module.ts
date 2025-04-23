import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyRegisterPage } from './company-register.page';

const routes: Routes = [
  {
    path: '',
    component: CompanyRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRegisterPageRoutingModule {}
