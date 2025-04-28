import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Shift {
  id: number;
  department: number;
  day_of_week: string;
  shift_type: string;
  start_time: string;
  end_time: string;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MainMenuComponent, HttpClientModule]
})
export class ShiftsPage {
  departments: Department[] = [
    { id: 17, name: 'Sales' },
    { id: 18, name: 'Support' },
    { id: 19, name: 'HR' }
  ];

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  shifts: Shift[] = [];
  filteredShifts: any[] = [];

  selectedDepartment = '';
  selectedDay = '';

  constructor(private menuCtrl: MenuController, private http: HttpClient) {}

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
    this.fetchShifts();
  }

  fetchShifts() {
    const companyId = 7; // Change if needed
    this.http.get<Shift[]>(`http://127.0.0.1:8000/api/shifts/?company=${companyId}`).subscribe(data => {
      this.shifts = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredShifts = this.shifts
      .filter(shift => 
        (!this.selectedDepartment || shift.department == +this.selectedDepartment) &&
        (!this.selectedDay || this.getDayName(shift.day_of_week) === this.selectedDay)
      )
      .map(shift => ({
        id: shift.id,
        name: this.getShiftName(shift.shift_type),
        departmentId: shift.department,
        day: this.getDayName(shift.day_of_week),
        startTime: shift.start_time,
        endTime: shift.end_time,
        assignedEmployees: [] // later you can fetch assigned employees if needed
      }));
  }

  getShiftName(shiftType: string): string {
    switch (shiftType) {
      case 'morning': return 'Morning Shift';
      case 'evening': return 'Evening Shift';
      case 'night': return 'Night Shift';
      default: return shiftType;
    }
  }

  getDayName(dayCode: string): string {
    const dayMap: { [key: string]: string } = {
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday'
    };
    return dayMap[dayCode] || dayCode;
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown';
  }

  onFilterChange() {
    this.applyFilters();
  }

  openAddShiftModal() {
    // Logic to open modal
  }

  openEditShiftModal(shift: any) {
    // Logic to edit shift
  }

  confirmDelete(shift: any) {
    // Logic to delete shift
  }

  closeShiftModal() {
    // Logic to close modal
  }

  saveShift() {
    // Logic to save shift
  }
}
