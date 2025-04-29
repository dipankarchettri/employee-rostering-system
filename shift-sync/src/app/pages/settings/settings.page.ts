import { Component } from '@angular/core';
import { IonicModule, ModalController, AlertController } from '@ionic/angular'; // Import ModalController & AlertController
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
  emailNotifications: boolean = true; // Default value for the toggle
  defaultShiftLength: string = '8';   // Default value for select
  defaultDepartment: string = 'emergency'; // Default value for select
  timeZone: string = 'UTC-05:00'; // Default value for select

  // --- Tab Management ---
  // Define possible tab names, matching the *ngIf conditions in HTML
  activeTab: 'notifications' | 'preferences' | 'accessControl' = 'notifications'; // Default active tab

  // --- User Management ---
  // Define users array with the User interface type
  users: User[] = [
    { id: 1, name: 'John Doe', role: 'Admin', avatar: 'assets/avatar.png' },
    { id: 2, name: 'Jane Smith', role: 'Scheduler', avatar: 'assets/avatar-female.png' },
    { id: 3, name: 'Peter Jones', role: 'Employee', avatar: 'assets/avatar-male.png' }
    // In a real app, fetch this data from a service
  ];

  // Inject ModalController for opening modals and AlertController for confirmations
  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  // --- Methods ---

  /**
   * Sets the currently active tab based on the clicked title.
   * @param tabName The name of the tab to activate ('notifications', 'preferences', 'accessControl').
   */
  selectTab(tabName: 'notifications' | 'preferences' | 'accessControl') {
    this.activeTab = tabName;
    console.log('Active tab set to:', this.activeTab);
  }

  /**
   * Opens a modal for adding a new user.
   * Replace 'AddUserModalComponent' with your actual modal component.
   */
  async openAddUserModal() {
    console.log('Attempting to open Add User Modal');
    // Example using Ionic ModalController:
    // const modal = await this.modalCtrl.create({
    //   component: AddUserModalComponent, // Replace with your actual modal component name
    // });
    // await modal.present();
    // const { data, role } = await modal.onDidDismiss();
    // if (role === 'confirm' && data) {
    //   // Add the new user to the list (or handle via service)
    //   this.users.push(data); // Make sure 'data' matches the User interface
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
    //   component: EditUserModalComponent, // Replace with your actual modal component name
    //   componentProps: {
    //     userData: { ...user } // Pass a copy of the user data
    //   }
    // });
    // await modal.present();
    // const { data, role } = await modal.onDidDismiss();
    // if (role === 'confirm' && data) {
    //   // Update the user in the list (or handle via service)
    //   const index = this.users.findIndex(u => u.id === data.id);
    //   if (index > -1) {
    //     this.users[index] = data; // Make sure 'data' matches the User interface
    //     console.log('User updated:', data);
    //   }
    // }
  }

  /**
   * Handles the deletion of a user.
   * Shows a confirmation prompt before deleting.
   * @param user The user object to delete.
   */
  async deleteUser(user: User) {
    console.log('Attempting to delete user:', user);
    // Example: Show a confirmation alert using Ionic AlertController
    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Delete cancelled');
          }
        }, {
          text: 'Delete',
          role: 'confirm', // Use role 'confirm' for the primary action
          cssClass: 'danger', // Optional: style the delete button
          handler: () => {
            // Perform the deletion (e.g., filter the array or call a service)
            this.users = this.users.filter(u => u.id !== user.id);
            console.log('User deleted:', user);
            // Add logic here to call an API endpoint if necessary
          }
        }
      ]
    });

    await alert.present();
  }

  // --- Lifecycle Hooks (Optional) ---
  ionViewWillEnter() {
    // This is a good place to fetch initial data if needed when the view becomes active
    console.log('Settings page will enter. Current active tab:', this.activeTab);
    // Example: Fetch users if the array is empty
    // if (this.users.length === 0) {
    //   this.fetchUsers();
    // }
  }

  // Example data fetching function (replace with your actual service call)
  // fetchUsers() {
  //   console.log('Fetching users...');
  //   // Replace with actual API call using HttpClient or a service
  //   // this.userService.getUsers().subscribe(data => this.users = data);
  // }
}