import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular'; // Import ModalController
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor, *ngIf

// Define an interface for the User structure (optional but good practice)
interface User {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Ensure CommonModule is imported
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsPage {
  // --- Properties for Data Binding ---
  emailNotifications: boolean = true; // Default value
  defaultShiftLength: string = '8';
  defaultDepartment: string = 'emergency';
  timeZone: string = 'UTC-05:00';

  // --- Tab Management ---
  // Define possible tab names
  activeTab: 'notifications' | 'preferences' | 'accessControl' = 'notifications'; // Default active tab

  // --- User Management ---
  // Define users array with the User interface type
  users: User[] = [
    { id: 1, name: 'John Doe', role: 'Admin', avatar: 'assets/avatar.png' },
    { id: 2, name: 'Jane Smith', role: 'Scheduler', avatar: 'assets/avatar-female.png' },
    { id: 3, name: 'Peter Jones', role: 'Employee', avatar: 'assets/avatar-male.png' }
    // In a real app, fetch this data from a service
  ];

  // Inject ModalController for opening modals
  constructor(private modalCtrl: ModalController) {}

  // --- Methods ---

  /**
   * Sets the currently active tab.
   * @param tabName The name of the tab to activate.
   */
  selectTab(tabName: 'notifications' | 'preferences' | 'accessControl') {
    this.activeTab = tabName;
    console.log('Active tab set to:', this.activeTab);
    // You might fetch data specific to the tab here if needed
  }

  /**
   * Opens a modal for adding a new user.
   * Replace 'AddUserModalComponent' with your actual modal component.
   */
  async openAddUserModal() {
    console.log('Attempting to open Add User Modal');
    // Example using Ionic ModalController
    // const modal = await this.modalCtrl.create({
    //   component: AddUserModalComponent, // Replace with your modal component
    // });
    // await modal.present();
    // const { data, role } = await modal.onDidDismiss();
    // if (role === 'confirm' && data) {
    //   // Add the new user to the list (or handle via service)
    //   this.users.push(data);
    //   console.log('New user added:', data);
    // }
  }

  /**
   * Handles the editing of a user.
   * Typically opens an edit modal or navigates to an edit page.
   * @param user The user object to edit.
   */
  async editUser(user: User) {
    console.log('Editing user:', user);
    // Example: Open an edit modal, passing the user data
    // const modal = await this.modalCtrl.create({
    //   component: EditUserModalComponent, // Replace with your modal component
    //   componentProps: {
    //     userData: user
    //   }
    // });
    // await modal.present();
    // const { data, role } = await modal.onDidDismiss();
    // if (role === 'confirm' && data) {
    //   // Update the user in the list (or handle via service)
    //   const index = this.users.findIndex(u => u.id === data.id);
    //   if (index > -1) {
    //     this.users[index] = data;
    //     console.log('User updated:', data);
    //   }
    // }
  }

  /**
   * Handles the deletion of a user.
   * Typically shows a confirmation prompt before deleting.
   * @param user The user object to delete.
   */
  async deleteUser(user: User) {
    console.log('Attempting to delete user:', user);
    // Example: Show a confirmation alert
    // const alert = await this.alertCtrl.create({ // Inject AlertController if using alerts
    //   header: 'Confirm Deletion',
    //   message: `Are you sure you want to delete ${user.name}?`,
    //   buttons: [
    //     { text: 'Cancel', role: 'cancel' },
    //     {
    //       text: 'Delete',
    //       role: 'confirm',
    //       handler: () => {
    //         // Perform the deletion (e.g., filter the array or call a service)
    //         this.users = this.users.filter(u => u.id !== user.id);
    //         console.log('User deleted:', user);
    //       }
    //     }
    //   ]
    // });
    // await alert.present();

    // Simple deletion for now (without confirmation)
     this.users = this.users.filter(u => u.id !== user.id);
     console.log('User deleted:', user.id);
  }

  // --- Lifecycle Hooks (Optional) ---
  ionViewWillEnter() {
    // Fetch initial data if needed when the view becomes active
    console.log('Settings page will enter');
  }
}