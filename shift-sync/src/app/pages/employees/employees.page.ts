import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Import ALL Ionic components used in template
import { 
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,  // <-- Add this
  IonIcon,       // <-- Add this
  IonButton,
  
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
    
    // Ionic components
    IonApp,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,    // <-- Add this
    IonMenuButton, // <-- Add this
    IonIcon,       // <-- Add this
    IonButton,
    IonMenuButton,
  ]
})
export class EmployeesPage implements OnInit {
  employees = [
    {
      name: 'Sarah Johnson',
      contact: 'sarah.j@company.com',
      department: 'HR Department',
      type: 'Full Time'
    },
    {
      name: 'Michael Chen',
      contact: 'm.chen@company.com',
      department: 'IT Support',
      type: 'Full Time'
    },
    {
      name: 'Lisa Rodriguez',
      contact: 'l.rodriguez@company.com',
      department: 'Operations',
      type: 'Part Time'
    },
    {
      name: 'James Wilson',
      contact: 'j.wilson@company.com',
      department: 'Customer Service',
      type: 'Full Time'
    },
    {
      name: 'Emily Parker',
      contact: 'e.parker@company.com',
      department: 'HR Department',
      type: 'Contract'
    },
    {
      name: 'David Kim',
      contact: 'd.kim@company.com',
      department: 'IT Support',
      type: 'Full Time'
    }
  ];
  
  departments = [
    'HR Department',
    'IT Support',
    'Operations',
    'Customer Service'
  ];
  
  employeeTypes = [
    'Full Time',
    'Part Time',
    'Contract',
    'Seasonal'
  ];
  
  selectedDepartment: string = '';
  selectedType: string = '';

  constructor() { }

  ngOnInit() { }

  addNewEmployee() {
    console.log('Adding new employee');
    // Implement employee addition logic
  }
  
  editEmployee(employee: any) {
    console.log('Editing employee:', employee);
    // Implement employee editing logic
  }
  
  deleteEmployee(employee: any) {
    console.log('Deleting employee:', employee);
    // Implement employee deletion logic
  }
  
  filterEmployees() {
    // Implementation for filtering based on selectedDepartment and selectedType
    console.log('Filtering by:', this.selectedDepartment, this.selectedType);
  }
}