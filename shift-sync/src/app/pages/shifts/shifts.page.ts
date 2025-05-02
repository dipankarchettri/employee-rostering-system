import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonBadge,
  IonDatetime,
  IonDatetimeButton
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';

interface Shift {
  id: number;
  department: number;
  day_of_week: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  date: string;
}

interface Department {
  id: number;
  name: string;
  color?: string;
}

interface Roster {
  id: number;
  shift_details: {
    id: number;
    date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    department: number;
    shift_type: string;
  };
  employee: number;
  assigned_manually: boolean;
}

interface Employee {
  id: number;
  name: string;
}

interface ShiftView {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  departmentColor: string;
  day: string;
  startTime: string;
  endTime: string;
  assigned: boolean;
  assignedTo: string;
  assignedManually: boolean;
  date: string;
}

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonLabel,
    IonBadge,
    IonDatetime,
    IonDatetimeButton
  ]
})
export class ShiftsPage {
  private readonly companyId = 19;
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  departments: Department[] = [];
  departmentColors: { [key: number]: string } = {};
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  shifts: Shift[] = [];
  rosters: Roster[] = [];
  employees: Employee[] = [];
  filteredShifts: ShiftView[] = [];

  selectedDepartment = '';
  selectedDay = '';

  showShiftModal = false;
  editingShift = false;

  currentShift: {
    id: number | null;
    departmentId: number | '';
    day: string;
    name: string;
    startTime: string;
    endTime: string;
    date: string;
  } = {
    id: null,
    departmentId: '',
    day: '',
    name: '',
    startTime: '',
    endTime: '',
    date: new Date().toISOString().split('T')[0] // Default to today's date in YYYY-MM-DD format
  };

  constructor(private http: HttpClient, private location: Location) {}

  ionViewWillEnter() {
    this.fetchData();
  }
  clearFilters() {
    this.selectedDepartment = '';
    this.selectedDay = '';
    this.applyFilters();
  }
  private fetchData() {
    this.fetchEmployees().then(() => {
      this.fetchDepartments();
      this.fetchShifts();
      this.fetchRosters();
    });
  }

  private fetchEmployees(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Employee[]>(`${this.baseUrl}/employees/?company=${this.companyId}`).subscribe({
        next: data => {
          this.employees = data;
          resolve();
        },
        error: err => {
          console.error('Error fetching employees:', err);
          reject(err);
        }
      });
    });
  }

  private fetchDepartments() {
    this.http.get<Department[]>(`${this.baseUrl}/departments/?company=${this.companyId}`).subscribe({
      next: data => {
        this.departments = data;
        const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F8B195'];
        this.departments.forEach((dept, index) => {
          this.departmentColors[dept.id] = colors[index % colors.length];
        });
        this.applyFilters();
      },
      error: err => console.error('Error fetching departments:', err)
    });
  }

  private fetchShifts() {
    this.http.get<Shift[]>(`${this.baseUrl}/shifts/?company=${this.companyId}`).subscribe({
      next: data => {
        this.shifts = data;
        this.applyFilters();
      },
      error: err => console.error('Error fetching shifts:', err)
    });
  }

  private fetchRosters() {
    this.http.get<{ rosters: Roster[] }>(`${this.baseUrl}/rosters/weekly_roster/?company=${this.companyId}`).subscribe({
      next: data => {
        this.rosters = data.rosters;
        this.applyFilters();
      },
      error: err => console.error('Error fetching rosters:', err)
    });
  }

  onModalChange(isOpen: boolean) {
    this.showShiftModal = isOpen;
    if (!isOpen) {
      this.resetCurrentShift();
    }
  }

  resetCurrentShift() {
    this.currentShift = {
      id: null,
      departmentId: '',
      day: '',
      name: '',
      startTime: '',
      endTime: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  getEmployeeName(id: number): string {
    return this.employees.find(e => e.id === id)?.name || `Employee ${id}`;
  }

  getDepartmentName(id: number): string {
    return this.departments.find(d => d.id === id)?.name || 'Unknown Department';
  }

  getDepartmentColor(id: number): string {
    return this.departmentColors[id] || '#CCCCCC';
  }

  applyFilters() {
    this.filteredShifts = this.shifts.map(shift => {
      const roster = this.rosters.find(r => r.shift_details.id === shift.id);
      return {
        id: shift.id,
        name: this.getShiftName(shift.shift_type),
        departmentId: shift.department,
        departmentName: this.getDepartmentName(shift.department),
        departmentColor: this.getDepartmentColor(shift.department),
        day: this.getDayName(shift.day_of_week),
        startTime: this.formatTime(shift.start_time),
        endTime: this.formatTime(shift.end_time),
        assigned: !!roster,
        assignedTo: roster ? this.getEmployeeName(roster.employee) : 'Unassigned',
        assignedManually: roster?.assigned_manually || false,
        date: shift.date
      };
    }).filter(shift =>
      (!this.selectedDepartment || shift.departmentId === +this.selectedDepartment) &&
      (!this.selectedDay || shift.day === this.selectedDay)
    );
  }

  formatTime(time: string): string {
    if (!time) return '';
    const timePart = time.includes('T') ? time.split('T')[1] : time;
    const [hours, minutes] = timePart.split(':');
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  }

  getShiftName(type: string): string {
    const map: { [key: string]: string } = {
      morning: 'Morning Shift',
      afternoon: 'Afternoon Shift',
      evening: 'Evening Shift',
      night: 'Night Shift',
      custom: 'Custom Shift'
    };
    return map[type.toLowerCase()] || type;
  }

  getDayName(code: string): string {
    const map: { [key: string]: string } = {
      mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
      thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
      monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
      thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
    };
    return map[code.toLowerCase()] || code;
  }

  getDayCode(name: string): string {
    const map: { [key: string]: string } = {
      monday: 'mon', tuesday: 'tue', wednesday: 'wed',
      thursday: 'thu', friday: 'fri', saturday: 'sat', sunday: 'sun'
    };
    return map[name.toLowerCase()] || name.toLowerCase();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openAddShiftModal() {
    this.editingShift = false;
    this.currentShift = {
      id: null,
      departmentId: this.departments[0]?.id || '',
      day: this.days[0] || '',
      name: '',
      startTime: '09:00', // Default start time
      endTime: '17:00',   // Default end time
      date: new Date().toISOString().split('T')[0]
    };
    this.showShiftModal = true;
  }

  openEditShiftModal(shift: ShiftView) {
    this.editingShift = true;
    this.currentShift = {
      id: shift.id,
      departmentId: shift.departmentId,
      day: shift.day,
      name: shift.name,
      startTime: this.convertDisplayTimeTo24Hour(shift.startTime),
      endTime: this.convertDisplayTimeTo24Hour(shift.endTime),
      date: shift.date
    };
    this.showShiftModal = true;
  }

  convertDisplayTimeTo24Hour(displayTime: string): string {
    if (!displayTime) return '';
    const [timePart, period] = displayTime.split(' ');
    const [hours, minutes] = timePart.split(':');
    let h = parseInt(hours, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes}`;
  }

  closeShiftModal() {
    this.showShiftModal = false;
  }

  saveShift() {
    if (!this.currentShift.name || !this.currentShift.date || !this.currentShift.startTime || !this.currentShift.endTime || !this.currentShift.departmentId) {
      alert('Please fill all shift details.');
      return;
    }
  
    // Format the date and time for the API
    const dateStr = this.currentShift.date;
    const startTimeISO = `${dateStr}T${this.currentShift.startTime}:00`;
    const endTimeISO = `${dateStr}T${this.currentShift.endTime}:00`;
  
    const payload = {
      day_of_week: this.getDayCode(this.currentShift.day),
      date: dateStr,
      shift_type: this.currentShift.name.toLowerCase(),
      start_time: startTimeISO,
      end_time: endTimeISO,
      assigned: false,
      company: this.companyId,
      department: this.currentShift.departmentId
    };
  
    const url = this.editingShift && this.currentShift.id
      ? `${this.baseUrl}/shifts/${this.currentShift.id}/`
      : `${this.baseUrl}/shifts/`;
  
    const method = this.editingShift ? this.http.put : this.http.post;
  
    method.call(this.http, url, payload).subscribe({
      next: () => {
        this.closeShiftModal();
        this.fetchShifts();
      },
      error: err => {
        console.error(this.editingShift ? 'Error updating shift:' : 'Error creating shift:', err);
        alert('Failed to save shift. Please check all fields and try again.');
      }
    });
  }

  confirmDelete(shift: ShiftView) {
    if (confirm(`Are you sure you want to delete shift "${shift.name}"?`)) {
      this.http.delete(`${this.baseUrl}/shifts/${shift.id}/`).subscribe({
        next: () => this.fetchShifts(),
        error: err => {
          console.error('Error deleting shift:', err);
          alert('Failed to delete shift.');
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}