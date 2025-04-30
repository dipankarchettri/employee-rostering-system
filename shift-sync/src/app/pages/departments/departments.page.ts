import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Department {
  id?: number;
  name: string;
  description: string;
  employees: number;
  company: number;
}

interface Employee {
  id?: number;
  name: string;
  departments: string[];
}

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DepartmentsPage {
  departments: Department[] = [];
  employees: Employee[] = [];
  filteredDepartments: Department[] = [];
  searchTerm = '';
  
  showDepartmentModal = false;
  editingDepartment = false;
  currentDepartment: Department = {
    name: '',
    description: '',
    employees: 0,
    company: 19
  };

  constructor(private http: HttpClient) {
    this.loadEmployees();
  }

  loadDepartments() {
    const companyId = 19;
    this.http.get<Department[]>(`http://127.0.0.1:8000/api/departments/?company=${companyId}`)
      .subscribe({
        next: (data) => {
          this.departments = data.map(d => ({
            ...d,
            employees: this.countEmployeesInDepartment(d.name)
          }));
          this.filteredDepartments = [...this.departments];
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
        }
      });
  }

  loadEmployees() {
    const companyId = 19;
    this.http.get<Employee[]>(`http://127.0.0.1:8000/api/employees/?company=${companyId}`)
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.loadDepartments();
        },
        error: (err) => {
          console.error('Failed to load employees:', err);
        }
      });
  }

  countEmployeesInDepartment(departmentName: string): number {
    return this.employees.filter(emp => 
      emp.departments?.includes(departmentName)
    ).length;
  }

  onSearchChange() {
    if (!this.searchTerm) {
      this.filteredDepartments = [...this.departments];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredDepartments = this.departments.filter(dep =>
      dep.name.toLowerCase().includes(term) ||
      (dep.description && dep.description.toLowerCase().includes(term))
    );
  }

  openAddDepartmentModal() {
    this.currentDepartment = {
      name: '',
      description: '',
      employees: 0,
      company: 19
    };
    this.editingDepartment = false;
    this.showDepartmentModal = true;
  }

  openEditDepartmentModal(department: Department) {
    this.currentDepartment = { ...department };
    this.editingDepartment = true;
    this.showDepartmentModal = true;
  }

  closeDepartmentModal() {
    this.showDepartmentModal = false;
  }

  saveDepartment() {
    const apiCall = this.editingDepartment && this.currentDepartment.id ?
      this.http.put(`http://127.0.0.1:8000/api/departments/${this.currentDepartment.id}/`, this.currentDepartment) :
      this.http.post('http://127.0.0.1:8000/api/departments/', this.currentDepartment);

    apiCall.subscribe({
      next: () => {
        this.loadDepartments();
        this.closeDepartmentModal();
      },
      error: (err) => {
        console.error('Error saving department:', err);
      }
    });
  }

  confirmDelete(department: Department) {
    if (confirm(`Delete department "${department.name}"?`)) {
      this.http.delete(`http://127.0.0.1:8000/api/departments/${department.id}/`)
        .subscribe({
          next: () => {
            this.departments = this.departments.filter(d => d.id !== department.id);
            this.filteredDepartments = this.filteredDepartments.filter(d => d.id !== department.id);
          },
          error: (err) => {
            console.error('Error deleting department:', err);
          }
        });
    }
  }
}