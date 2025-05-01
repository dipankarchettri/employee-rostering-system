import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Replace IonicModule import with specific components
import { 
  IonBackButton,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonInput,
  IonLabel,
  IonButtons,
 
} from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Location } from '@angular/common';

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
  company: number;
  company_name: string;
  name: string;
  description: string;
  num_employees: number;
}

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    // Add Ionic components individually
    IonBackButton,
    IonButtons,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonInput,
    IonLabel
  ]
})
export class ShiftsPage {
  departments: Department[] = [];
  departmentMap: { [key: number]: string } = {};

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  shifts: Shift[] = [];
  filteredShifts: any[] = [];

  selectedDepartment = '';
  selectedDay = '';

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

  constructor(
    private http: HttpClient,
    private location: Location
  ) {}

  ionViewWillEnter() {
    this.fetchDepartments();
    this.fetchShifts();
  }

  // Navigation handler
  goBack() {
    this.location.back();
  }

  fetchDepartments() {
    const companyId = 1;
    this.http.get<Department[]>(`http://127.0.0.1:8000/api/departments/?company=${companyId}`).subscribe(data => {
      this.departments = data;
      this.departmentMap = data.reduce((map: { [key: number]: string }, dept) => {
        map[dept.id] = dept.name;
        return map;
      }, {});
      this.applyFilters();
    });
  }
  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  }

  fetchShifts() {
    const companyId = 1;
    this.http.get<Shift[]>(`http://127.0.0.1:8000/api/shifts/?company=${companyId}`).subscribe(data => {
      this.shifts = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    const departmentMap: { [key: number]: string } = {};
    this.departments.forEach(dept => departmentMap[dept.id] = dept.name);

    this.filteredShifts = this.shifts
      .filter(shift => 
        (!this.selectedDepartment || shift.department == +this.selectedDepartment) &&
        (!this.selectedDay || this.getDayName(shift.day_of_week) === this.selectedDay)
      )
      .map(shift => ({
        id: shift.id,
        name: this.getShiftName(shift.shift_type),
        departmentId: shift.department,
        departmentName: departmentMap[shift.department],
        day: this.getDayName(shift.day_of_week),
        startTime: shift.start_time,
        endTime: shift.end_time,
        assignedEmployees: []
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
      'mon': 'Monday', 'tue': 'Tuesday', 'wed': 'Wednesday',
      'thu': 'Thursday', 'fri': 'Friday', 'sat': 'Saturday',
      'sun': 'Sunday', 'monday': 'Monday', 'tuesday': 'Tuesday',
      'wednesday': 'Wednesday', 'thursday': 'Thursday',
      'friday': 'Friday', 'saturday': 'Saturday', 'sunday': 'Sunday'
    };
    return dayMap[dayCode.toLowerCase()] || dayCode;
  }

  getDayCode(dayName: string): string {
    const dayMap: { [key: string]: string } = {
      'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
      'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat',
      'sunday': 'sun'
    };
    return dayMap[dayName.toLowerCase()] || dayName.toLowerCase();
  }

  getShiftType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('morning')) return 'morning';
    if (lower.includes('evening')) return 'evening';
    if (lower.includes('night')) return 'night';
    return lower;
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
    this.currentShift = { ...shift };
    this.showShiftModal = true;
  }

  closeShiftModal() {
    this.showShiftModal = false;
  }

  saveShift() {
    if (this.editingShift) {
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