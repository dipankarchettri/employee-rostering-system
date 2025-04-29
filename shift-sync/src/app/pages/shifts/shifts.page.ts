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

  // Modal state and shift being edited/added
  showShiftModal = false;
  editingShift = false;
  currentShift: any = {
    id: null,
    departmentId: '',
    day: '',
    name: '',
    startTime: '',
    endTime: ''
  };

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
        endTime: shift.end_time
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

  getDayCode(dayName: string): string {
    const dayMap: { [key: string]: string } = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return dayMap[dayName] || dayName;
  }

  getShiftType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('morning')) return 'morning';
    if (lower.includes('evening')) return 'evening';
    if (lower.includes('night')) return 'night';
    return name.toLowerCase();
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown';
  }

  onFilterChange() {
    this.applyFilters();
  }

  openAddShiftModal() {
    this.editingShift = false;
    this.currentShift = {
      id: null,
      departmentId: this.departments.length ? this.departments[0].id : '',
      day: this.days.length ? this.days[0] : '',
      name: '',
      startTime: '',
      endTime: ''
    };
    this.showShiftModal = true;
  }

  openEditShiftModal(shift: any) {
    this.editingShift = true;
    this.currentShift = {
      id: shift.id,
      departmentId: shift.departmentId,
      day: shift.day,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime
    };
    this.showShiftModal = true;
  }

  closeShiftModal() {
    this.showShiftModal = false;
  }

  saveShift() {
    if (this.editingShift) {
      // Update existing shift
      const idx = this.shifts.findIndex(s => s.id === this.currentShift.id);
      if (idx > -1) {
        this.shifts[idx] = {
          ...this.shifts[idx],
          department: +this.currentShift.departmentId,
          day_of_week: this.getDayCode(this.currentShift.day),
          shift_type: this.getShiftType(this.currentShift.name),
          start_time: this.currentShift.startTime,
          end_time: this.currentShift.endTime
        };
      }
    } else {
      // Add new shift (mock, in real app you would POST to backend)
      const newId = this.shifts.length ? Math.max(...this.shifts.map(s => s.id)) + 1 : 1;
      this.shifts.push({
        id: newId,
        department: +this.currentShift.departmentId,
        day_of_week: this.getDayCode(this.currentShift.day),
        shift_type: this.getShiftType(this.currentShift.name),
        start_time: this.currentShift.startTime,
        end_time: this.currentShift.endTime
      });
    }
    this.applyFilters();
    this.closeShiftModal();
  }

  confirmDelete(shift: any) {
    if (confirm('Are you sure you want to delete this shift?')) {
      this.shifts = this.shifts.filter(s => s.id !== shift.id);
      this.applyFilters();
    }
  }
}