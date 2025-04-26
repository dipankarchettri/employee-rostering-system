import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // ✅ Corrected
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // ✅ API support

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule] // ✅ Include HttpClientModule
})
export class DepartmentsPage {
  departments: any[] = [];
  searchTerm = '';
  addModalOpen = false;
  newDepartment = { name: '', description: '' };

  constructor(private http: HttpClient) {
    this.loadDepartments();
  }

  loadDepartments() {
    const companyId = 1;
    this.http.get<any[]>(`http://localhost:8000/api/departments/?company=${companyId}`)
      .subscribe({
        next: (data) => {
          this.departments = data.map(d => ({
            ...d,
            numEmployees: 0 // or fetch from another endpoint if needed
          }));
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
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
