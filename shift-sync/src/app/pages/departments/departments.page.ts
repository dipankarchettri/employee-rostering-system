import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuController } from '@ionic/angular';

// Define a simple Department interface based on template usage
interface Department {
  id?: number; // Optional ID
  name: string;
  description: string;
  employees: number;
}




@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DepartmentsPage {
  departments: any[] = [];
  employees: any[] = [];
  searchTerm = '';
  addModalOpen = false;
  newDepartment = { name: '', description: '' };

  constructor(private http: HttpClient) {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments() {
    const companyId = 7; // Use your dynamic company ID logic here

    if (!companyId) {
      console.error('Company ID not found. User might not be logged in.');
      return;
    }

    this.http.get<any[]>(`http://localhost:8000/api/departments/?company=${companyId}`)
      .subscribe({
        next: (data) => {
          this.departments = data.map(d => ({
            ...d,
            numEmployees: 0 // Initialize the employee count
          }));

          // Now count the employees for each department
          this.departments.forEach(department => {
            // Reset employee count before counting
            department.numEmployees = 0;
            this.employees.forEach(employee => {
              // Check if the employee belongs to the current department
              if (employee.departments.includes(department.name)) {
                department.numEmployees++;
              }
            });
          });
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
        }
      });
  }

  loadEmployees() {
    const companyId = 7; // Use your dynamic company ID logic here

    if (!companyId) {
      console.error('Company ID not found. User might not be logged in.');
      return;
    }

    this.http.get<any[]>(`http://localhost:8000/api/employees/?company=${companyId}`)
      .subscribe({
        next: (data) => {
          this.employees = data;
          // After loading employees, recalculate the department counts
          this.loadDepartments();
        },
        error: (err) => {
          console.error('Failed to load employees:', err);
        }
      });
  }

  filteredDepartments() {
    if (!this.searchTerm) return this.departments;
    const term = this.searchTerm.toLowerCase();
    return this.departments.filter(dep =>
      dep.name.toLowerCase().includes(term) ||
      dep.description?.toLowerCase().includes(term)
    );
  }

  openAddModal() {
    this.addModalOpen = true;
    this.newDepartment = { name: '', description: '' };
  }

  closeAddModal() {
    this.addModalOpen = false;
  }

  submitDepartment() {
    if (this.newDepartment.name.trim()) {
      this.departments.push({
        name: this.newDepartment.name,
        description: this.newDepartment.description,
        numEmployees: 0
      });
      this.closeAddModal();
    }
  }

  editDepartment(dep: any) {
    alert('Edit department: ' + dep.name);
  }

  deleteDepartment(dep: any) {
    if (confirm(`Delete department "${dep.name}"?`)) {
      this.departments = this.departments.filter(d => d !== dep);
    }
  }
}
