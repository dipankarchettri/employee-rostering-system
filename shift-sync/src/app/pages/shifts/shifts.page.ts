import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuController, IonicModule } from '@ionic/angular';  // Import MenuController
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';  // Import MainMenuComponent

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MainMenuComponent]  // Add MainMenuComponent and IonicModule
})
export class ShiftsPage {
  departments = ['Sales', 'Support', 'HR'];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDepartment = '';
  selectedDay = '';
  showShiftModal = false;
  allEmployees = [
    { name: 'John Doe', avatar: 'assets/avatar1.png' },
    { name: 'Jane Smith', avatar: 'assets/avatar2.png' },
    { name: 'Mike Johnson', avatar: 'assets/avatar3.png' },
    { name: 'Sarah Williams', avatar: 'assets/avatar4.png' },
    { name: 'Tom Brown', avatar: 'assets/avatar5.png' }
  ];
  shifts = [
    {
      name: 'Morning Shift',
      department: 'Sales',
      day: 'Monday',
      employees: [this.allEmployees[0], this.allEmployees[1]]
    },
    {
      name: 'Evening Shift',
      department: 'Support',
      day: 'Monday',
      employees: [this.allEmployees[2], this.allEmployees[3]]
    }
  ];
  shiftForm = {
    name: '',
    department: '',
    day: '',
    startTime: '',
    endTime: '',
    assignedEmployees: []
  };

  constructor(private menuCtrl: MenuController) {}

  // Enable menu when the page enters
  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
  }

  filteredShifts() {
    return this.shifts.filter(shift =>
      (!this.selectedDepartment || shift.department === this.selectedDepartment) &&
      (!this.selectedDay || shift.day === this.selectedDay)
    );
  }

  openAddShiftModal() {
    this.showShiftModal = true;
    this.shiftForm = {
      name: '',
      department: '',
      day: '',
      startTime: '',
      endTime: '',
      assignedEmployees: []
    };
  }

  closeShiftModal() {
    this.showShiftModal = false;
  }

  saveShift() {
    // Add logic to save shift
    this.closeShiftModal();
  }

  editShift(shift: any) {
    // Add logic to edit shift
  }

  deleteShift(shift: any) {
    // Add logic to delete shift
  }
}
