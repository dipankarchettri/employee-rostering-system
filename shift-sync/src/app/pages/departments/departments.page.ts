import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Define a simple Department interface based on template usage
interface Department {
  id?: number; // Optional ID
  name: string;
  description: string;
  employees: number;
}

interface Employee {
  id?: number;
  name: string;
  departments: string[];
  // Add other employee properties as needed
}

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class DepartmentsPage {
  departments: Department[] = [];
  employees: Employee[] = [];
  searchTerm = '';
  addModalOpen = false;
  newDepartment = { name: '', description: '', employees: 0 };
  showAddSection = false; // Added missing property

  constructor(private http: HttpClient) {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments() {
    const companyId = 16; // Use your dynamic company ID logic here

    if (!companyId) {
      console.error('Company ID not found. User might not be logged in.');
      return;
    }

    this.http.get<Department[]>(`http://localhost:8000/api/departments/?company=${companyId}`)
      .subscribe({
        next: (data: Department[]) => {
          this.departments = data.map(d => ({
            ...d,
            employees: 0 // Initialize the employee count
          }));

          // Now count the employees for each department
          this.departments.forEach(department => {
            // Reset employee count before counting
            department.employees = 0;
            this.employees.forEach(employee => {
              // Check if the employee belongs to the current department
              if (employee.departments.includes(department.name)) {
                department.employees++;
              }
            });
          });
        },
        error: (err: any) => {
          console.error('Failed to load departments:', err);
        }
      });
  }

  loadEmployees() {
    const companyId = 16; // Use your dynamic company ID logic here

    if (!companyId) {
      console.error('Company ID not found. User might not be logged in.');
      return;
    }

    this.http.get<Employee[]>(`http://localhost:8000/api/employees/?company=${companyId}`)
      .subscribe({
        next: (data: Employee[]) => {
          this.employees = data;
          // After loading employees, recalculate the department counts
          this.loadDepartments();
        },
        error: (err: any) => {
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

  toggleAddSection() {
    this.showAddSection = !this.showAddSection;
  }

  cancelAdd() {
    this.showAddSection = false;
    this.newDepartment = { name: '', description: '', employees: 0 };
  }

  saveDepartment() {
    if (this.newDepartment.name.trim()) {
      this.departments.push({
        name: this.newDepartment.name,
        description: this.newDepartment.description,
        employees: this.newDepartment.employees
      });
      this.cancelAdd();
    }
  }

  editDepartment(dep: Department) {
    alert('Edit department: ' + dep.name);
  }

  deleteDepartment(dep: Department) {
    if (confirm(`Delete department "${dep.name}"?`)) {
      this.departments = this.departments.filter(d => d !== dep);
    }
  }
}