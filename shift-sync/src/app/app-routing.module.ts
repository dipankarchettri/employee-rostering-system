import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'company-register',
    loadComponent: () => import('./pages/company-register/company-register.page').then(m => m.CompanyRegisterPage)
  },
  { 
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  { 
    path: 'departments',
    loadComponent: () => import('./pages/departments/departments.page').then(m => m.DepartmentsPage)
  },
  { 
    path: 'shifts',
    loadComponent: () => import('./pages/shifts/shifts.page').then(m => m.ShiftsPage)
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/employees/employees.page').then(m => m.EmployeesPage)
  },
  {
    path: 'rosters',
    loadComponent: () => import('./pages/rosters/rosters.page').then( m => m.RostersPage)
  },
  {
    path: 'availability',
    loadComponent: () => import('./pages/availability/availability.page').then( m => m.AvailabilityPage)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.page').then( m => m.ReportsPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}