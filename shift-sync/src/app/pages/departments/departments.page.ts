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
  showAddSection = false; // Controls visibility of the add section

  // Sample initial data (replace with actual data loading if needed)
  departments: Department[] = [
    { id: 1, name: 'Human Resources', description: 'Manages employee relations and recruitment', employees: 15 },
    { id: 2, name: 'Marketing', description: 'Handles company promotion and branding', employees: 12 },
    { id: 3, name: 'Finance', description: 'Manages company finances and payroll', employees: 8 },
    { id: 4, name: 'IT', description: 'Maintains IT infrastructure and support', employees: 10 },
    { id: 5, name: 'Sales', description: 'Handles sales and client relationships', employees: 14 },
    { id: 6, name: 'Operations', description: 'Oversees daily business operations', employees: 9 },
    { id: 7, name: 'Customer Support', description: 'Provides customer service and support', employees: 11 },
    { id: 8, name: 'Legal', description: 'Manages legal affairs and compliance', employees: 4 },
    { id: 9, name: 'Research & Development', description: 'Drives innovation and product development', employees: 7 },
    { id: 10, name: 'Procurement', description: 'Handles purchasing and vendor management', employees: 6 }
  ];

  // Object to hold data for the new department form
  newDepartment: Department = this.getEmptyDepartment();

  constructor(private alertController: AlertController) {} // Inject AlertController for delete confirmation

  // Helper function to create an empty department object
  private getEmptyDepartment(): Department {
    return { name: '', description: '', employees: 0 };
  }

  // Toggles the visibility of the "Add Department" section
  toggleAddSection() {
    this.showAddSection = !this.showAddSection;
    if (!this.showAddSection) {
      this.clearForm(); // Clear form if section is hidden
    }
  }

  // Saves the new department data
  saveDepartment() {
    if (!this.newDepartment.name.trim()) {
      // Basic validation: Ensure name is not empty
      this.presentAlert('Validation Error', 'Department Name cannot be empty.');
      return;
    }
    // Add a temporary ID for demo purposes (replace with real ID logic)
    const departmentToAdd = { ...this.newDepartment, id: Date.now() };
    this.departments.push(departmentToAdd);
    console.log('Saved department:', departmentToAdd);
    this.clearForm();
    this.showAddSection = false; // Hide section after saving
  }

  // Cancels adding a new department
  cancelAdd() {
    this.showAddSection = false;
    this.clearForm();
  }

  // Resets the new department form
  clearForm() {
    this.newDepartment = this.getEmptyDepartment();
  }

  // Placeholder for edit functionality
  editDepartment(department: Department) {
    // Implement edit logic here (e.g., open a modal, populate a form)
    console.log('Edit department:', department);
    this.presentAlert('Edit', `Editing department: ${department.name}`);
    // Example: You might want to populate the 'newDepartment' form with the selected department's data
    // this.newDepartment = { ...department };
    // this.showAddSection = true; // Show the form for editing
    // You'd likely need an 'isEditMode' flag as well to change the save logic
  }

  // Deletes a department after confirmation
  async deleteDepartment(departmentToDelete: Department) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the department "${departmentToDelete.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.departments = this.departments.filter(d => d.id !== departmentToDelete.id);
            console.log('Deleted department:', departmentToDelete);
          }
        }
      ]
    });
    await alert.present();
  }

  // Helper to show simple alerts
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}