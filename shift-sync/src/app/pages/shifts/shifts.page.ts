import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuController, IonicModule } from '@ionic/angular';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';

interface Shift {
  id?: number;
  name: string;
  departmentId: number;
  day: string;
  startTime: string;
  endTime: string;
  assignedEmployees?: any[];
}

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  selected?: boolean;
}

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MainMenuComponent]
})
export class ShiftsPage {
  departments: Department[] = [
    { id: 1, name: 'Sales' },
    { id: 2, name: 'Support' },
    { id: 3, name: 'HR' }
  ];

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  allEmployees: Employee[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Sarah Williams' },
    { id: 5, name: 'Tom Brown' }
  ];

  shifts: Shift[] = [
    {
      id: 1,
      name: 'Morning Shift',
      departmentId: 1,
      day: 'Monday',
      startTime: '09:00',
      endTime: '13:00',
      assignedEmployees: [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }]
    },
    {
      id: 2,
      name: 'Afternoon Shift',
      departmentId: 2,
      day: 'Tuesday',
      startTime: '13:00',
      endTime: '17:00',
      assignedEmployees: [{ id: 3, name: 'Mike Johnson' }]
    },
    {
      id: 3,
      name: 'Night Shift',
      departmentId: 3,
      day: 'Friday',
      startTime: '20:00',
      endTime: '00:00',
      assignedEmployees: [{ id: 4, name: 'Sarah Williams' }, { id: 5, name: 'Tom Brown' }]
    }
  ];

  filteredShifts: Shift[] = [];
  currentShift: Shift = this.getEmptyShift();
  showShiftModal = false;
  editingShift = false;
  selectedDepartment = '';
  selectedDay = '';

  constructor(private menuCtrl: MenuController) {
    this.filteredShifts = this.shifts;
  }

  getEmptyShift(): Shift {
    return { name: '', departmentId: 0, day: '', startTime: '', endTime: '', assignedEmployees: [] };
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
  }

  openAddShiftModal() {
    this.currentShift = this.getEmptyShift();
    this.showShiftModal = true;
    this.editingShift = false;
  }

  openEditShiftModal(shift: Shift) {
    this.currentShift = { ...shift };
    this.showShiftModal = true;
    this.editingShift = true;
  }

  closeShiftModal() {
    this.showShiftModal = false;
  }

  saveShift() {
    if (this.editingShift) {
      const index = this.shifts.findIndex(s => s.id === this.currentShift.id);
      if (index !== -1) {
        this.shifts[index] = { ...this.currentShift };
      }
    } else {
      this.currentShift.id = Date.now(); // Temporary ID
      this.shifts.push({ ...this.currentShift });
    }
    this.closeShiftModal();
    this.filterShifts();
  }

  confirmDelete(shift: Shift) {
    if (confirm(`Are you sure you want to delete the shift "${shift.name}"?`)) {
      this.shifts = this.shifts.filter(s => s.id !== shift.id);
      this.filterShifts();
    }
  }

  filterShifts() {
    this.filteredShifts = this.shifts.filter(shift => {
      const matchesDepartment = !this.selectedDepartment || shift.departmentId.toString() === this.selectedDepartment;
      const matchesDay = !this.selectedDay || shift.day === this.selectedDay;
      return matchesDepartment && matchesDay;
    });
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'Unknown';
  }
}
