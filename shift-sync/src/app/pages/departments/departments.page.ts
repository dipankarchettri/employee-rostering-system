import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DepartmentsPage {
  departments = [
    { name: 'HR', description: 'Human Resources', numEmployees: 12 },
    { name: 'IT', description: 'Tech & Support', numEmployees: 8 },
    { name: 'Finance', description: 'Accounting', numEmployees: 5 }
  ];
  searchTerm = '';
  addModalOpen = false;
  newDepartment = { name: '', description: '' };

  filteredDepartments() {
    if (!this.searchTerm) return this.departments;
    const term = this.searchTerm.toLowerCase();
    return this.departments.filter(dep =>
      dep.name.toLowerCase().includes(term) ||
      dep.description.toLowerCase().includes(term)
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