import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';

interface Employee {
  id?: number;
  name: string;
  contact_info: string;
  employment_type: 'permanent' | 'casual' | null;
  departments: string[];
  company: number;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon
  ]
})
export class EmployeesPage {
  employees: Employee[] = [];
  departments: Department[] = [];
  filteredEmployees: Employee[] = [];
  
  selectedDepartment = '';
  selectedType = '';
  
  showEmployeeModal = false;
  editingEmployee = false;
  currentEmployee: Employee = {
    name: '',
    contact_info: '',
    employment_type: null,
    departments: [],
    company: 1,
    id: 0
  };

  constructor(
    private http: HttpClient,
    private location: Location
  ) {
    this.loadData();
  }

  // Add back navigation method
  goBack() {
    this.location.back();
  }

  loadData() {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments() {
    this.http.get<Department[]>(`http://127.0.0.1:8000/api/departments/?company=1`)
      .subscribe({
        next: (data) => {
          this.departments = data;
        },
        error: (err) => {
          console.error('Error loading departments:', err);
        }
      });
  }

  loadEmployees() {
    this.http.get<Employee[]>(`http://127.0.0.1:8000/api/employees/?company=1`)
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.filteredEmployees = [...data];
        },
        error: (err) => {
          console.error('Error loading employees:', err);
        }
      });
  }

  onFilterChange() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesDept = !this.selectedDepartment || 
        emp.departments.includes(this.selectedDepartment);
      const matchesType = !this.selectedType || 
        emp.employment_type === this.selectedType;
      return matchesDept && matchesType;
    });
  }

  openAddEmployeeModal() {
    this.currentEmployee = {
      name: '',
      contact_info: '',
      employment_type: null,
      departments: [],
      company: 1,
      id: 0
    };
    this.editingEmployee = false;
    this.showEmployeeModal = true;
  }

  openEditEmployeeModal(employee: Employee) {
    this.currentEmployee = { ...employee };
    this.editingEmployee = true;
    this.showEmployeeModal = true;
  }

  closeEmployeeModal() {
    this.showEmployeeModal = false;
  }

  onDepartmentChange(event: Event, deptId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const deptIdStr = deptId.toString();
    
    if (!this.currentEmployee.departments) {
      this.currentEmployee.departments = [];
    }

    if (isChecked) {
      if (!this.currentEmployee.departments.includes(deptIdStr)) {
        this.currentEmployee.departments.push(deptIdStr);
      }
    } else {
      this.currentEmployee.departments = this.currentEmployee.departments.filter(id => id !== deptIdStr);
    }
  }

  saveEmployee() {
    if (!this.currentEmployee.name) {
      alert('Name is required');
      return;
    }

    const apiCall = this.editingEmployee && this.currentEmployee.id ?
      this.http.put(`http://127.0.0.1:8000/api/employees/${this.currentEmployee.id}/`, this.currentEmployee) :
      this.http.post('http://127.0.0.1:8000/api/employees/', this.currentEmployee);

    apiCall.subscribe({
      next: () => {
        this.loadEmployees();
        this.closeEmployeeModal();
      },
      error: (err) => {
        console.error('Error saving employee:', err);
      }
    });
  }

  confirmDelete(employee: Employee) {
    if (confirm(`Delete employee "${employee.name}"?`)) {
      this.http.delete(`http://127.0.0.1:8000/api/employees/${employee.id}/`)
        .subscribe({
          next: () => {
            this.employees = this.employees.filter(e => e.id !== employee.id);
            this.filteredEmployees = this.filteredEmployees.filter(e => e.id !== employee.id);
          },
          error: (err) => {
            console.error('Error deleting employee:', err);
          }
        });
    }
  }
}