import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Ionic components
import {
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { MainMenuComponent } from '../../components/main-menu/main-menu.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MainMenuComponent,
    HttpClientModule,
    IonApp,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonButton
  ]
})
export class EmployeesPage implements OnInit {
  employees: any[] = [];
  filteredEmployees: any[] = [];

  departments: any[] = [];
  employeeTypes = [
    'permanent',
    'casual',
  ];

  selectedDepartment: string = '';
  selectedType: string = '';

  companyId = 7; 

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadEmployees() {
    this.http.get<any[]>(`http://127.0.0.1:8000/api/employees/?company=${this.companyId}`)
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.filteredEmployees = [...this.employees];
        },
        error: (err) => {
          console.error('Failed to load employees:', err);
        }
      });
  }

  loadDepartments() {
    this.http.get<any[]>(`http://127.0.0.1:8000/api/departments/?company=${this.companyId}`)
      .subscribe({
        next: (data) => {
          this.departments = data;
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
        }
      });
  }

  addNewEmployee() {
    console.log('Adding new employee');
  }

  editEmployee(employee: any) {
    console.log('Editing employee:', employee);
  }

  deleteEmployee(employee: any) {
    console.log('Deleting employee:', employee);
  }

  filterEmployees() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesDepartment = this.selectedDepartment
        ? emp.departments.some((dept: string) => dept.split(' (')[0] === this.selectedDepartment) // Split dept name for comparison
        : true;
      const matchesType = this.selectedType
        ? emp.employment_type.toLowerCase() === this.selectedType.toLowerCase()
        : true;
      return matchesDepartment && matchesType;
    });
  }

  getDepartmentNames(departmentNames: string[]): string[] {
    return departmentNames
      .map(name => name.split(' (')[0]) // Split by ' (' and take the first part (department name)
      .filter(name => name);
  }
}
