import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, 
  IonItem, IonLabel, IonButton, IonIcon, IonBadge,
  IonItemSliding, IonItemOptions, IonItemOption, IonModal,
  IonInput, IonTextarea, IonSearchbar, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, createOutline, trashOutline, 
  businessOutline, closeOutline, peopleOutline
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Department {
  id?: number;
  name: string;
  description: string;
  numEmployees: number;
}

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonButton, IonIcon,
    IonBadge, IonItemSliding, IonItemOptions, IonItemOption,
    IonModal, IonInput, IonTextarea, IonSearchbar, IonButtons
  ]
})
export class DepartmentsPage {
  departments: Department[] = [
    {
      id: 1,
      name: 'Human Resources',
      description: 'Handles recruitment, employee relations, and benefits',
      numEmployees: 8
    },
    {
      id: 2,
      name: 'Engineering',
      description: 'Software development and product engineering',
      numEmployees: 24
    },
    {
      id: 3,
      name: 'Marketing',
      description: 'Brand management and digital marketing',
      numEmployees: 12
    },
    {
      id: 4,
      name: 'Sales',
      description: 'Customer acquisition and revenue generation',
      numEmployees: 18
    },
    {
      id: 5,
      name: 'Customer Support',
      description: 'Client assistance and issue resolution',
      numEmployees: 15
    },
    {
      id: 6,
      name: 'Finance',
      description: 'Accounting, budgeting and financial planning',
      numEmployees: 6
    },
    {
      id: 7,
      name: 'Operations',
      description: 'Business processes and logistics',
      numEmployees: 10
    }
  ];
  
  searchTerm = '';
  addModalOpen = false;
  editingDepartment = false;
  currentDepartmentId: number | null = null;
  newDepartment: Department = {
    name: '',
    description: '',
    numEmployees: 0
  };

  constructor(private http: HttpClient) {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      businessOutline,
      closeOutline,
      peopleOutline
    });
    // Comment out the API call if using dummy data
    // this.loadDepartments();
  }

  // ... rest of the methods remain the same ...
  filteredDepartments() {
    if (!this.searchTerm) return this.departments;
    const term = this.searchTerm.toLowerCase();
    return this.departments.filter(dep =>
      dep.name.toLowerCase().includes(term) ||
      (dep.description && dep.description.toLowerCase().includes(term))
    );
  }

  openAddModal() {
    this.addModalOpen = true;
    this.editingDepartment = false;
    this.currentDepartmentId = null;
    this.resetForm();
  }

  editDepartment(department: Department) {
    this.addModalOpen = true;
    this.editingDepartment = true;
    this.currentDepartmentId = department.id || null;
    this.newDepartment = { ...department };
  }

  deleteDepartment(department: Department) {
    if (confirm(`Delete department "${department.name}"?`)) {
      this.departments = this.departments.filter(d => d.id !== department.id);
    }
  }

  closeAddModal() {
    this.addModalOpen = false;
    this.resetForm();
  }

  submitDepartment() {
    if (this.editingDepartment && this.currentDepartmentId) {
      // Update existing department
      const index = this.departments.findIndex(d => d.id === this.currentDepartmentId);
      if (index !== -1) {
        this.departments[index] = {
          ...this.departments[index],
          ...this.newDepartment
        };
      }
    } else {
      // Create new department
      const newId = Math.max(...this.departments.map(d => d.id || 0), 0) + 1;
      this.departments.push({
        ...this.newDepartment,
        id: newId
      });
    }
    this.closeAddModal();
  }

  private resetForm() {
    this.newDepartment = {
      name: '',
      description: '',
      numEmployees: 0
    };
  }
}