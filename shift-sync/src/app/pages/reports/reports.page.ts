import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonBackButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetimeButton,
  IonModal,
  IonDatetime  
} from '@ionic/angular/standalone';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';
import { addIcons } from 'ionicons';
import { 
  documentOutline,
  calendarOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainMenuComponent,
    IonApp,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonIcon,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
  ],  
  providers: [Location]
})
export class ReportsPage implements OnInit {
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedDepartment: string = 'all';
  selectedStatus: string = 'all';
  
  allShifts: any[] = [];
  filteredShifts: any[] = [];
  departments: any[] = [];
  
  summaryStats = {
    total_shifts: 0,
    assigned_shifts: 0,
    completed_shifts: 0,
    unassigned_shifts: 0,
    coverage_conflicts: 0
  };

  constructor(
    private http: HttpClient,
    private location: Location
  ) {
    addIcons({
      documentOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    const today = new Date();
    this.setDefaultDateRange(today);
    this.loadDepartments();
    this.loadShifts();
  }

  setDefaultDateRange(date: Date) {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const monday = new Date(date);
    monday.setDate(diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    this.startDate = monday;
    this.endDate = sunday;
  }

  loadDepartments() {
    this.http.get('http://127.0.0.1:8000/api/departments/?company=1').subscribe({
      next: (data: any) => {
        this.departments = data;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadShifts() {
    const params = {
      start_date: this.startDate.toISOString().split('T')[0],
      end_date: this.endDate.toISOString().split('T')[0],
      company: '1'
    };

    this.http.get('http://127.0.0.1:8000/api/shifts/', { params }).subscribe({
      next: (data: any) => {
        this.allShifts = this.processShiftData(data);
        this.filterShifts();
        this.calculateSummaryStats();
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
      }
    });
  }

  processShiftData(shifts: any[]): any[] {
    return shifts.map(shift => {
      const now = new Date();
      const shiftEnd = new Date(shift.end_time);
      const isCompleted = shiftEnd < now;
      
      return {
        ...shift,
        date: new Date(shift.start_time),
        start_time: new Date(shift.start_time),
        end_time: new Date(shift.end_time),
        shift_type_display: this.getShiftTypeDisplay(shift.shift_type),
        department_name: this.getDepartmentName(shift.department),
        status: shift.assigned ? (isCompleted ? 'completed' : 'assigned') : 'unassigned'
      };
    });
  }

  getDepartmentName(departmentId: number): string {
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  }

  getShiftTypeDisplay(shiftType: string): string {
    const shiftTypes: {[key: string]: string} = {
      'morning': 'Morning Shift',
      'afternoon': 'Afternoon Shift',
      'evening': 'Evening Shift',
      'night': 'Night Shift',
      'custom': 'Custom Shift'
    };
    return shiftTypes[shiftType] || shiftType;
  }

  filterShifts() {
    this.filteredShifts = this.allShifts.filter(shift => {
      // Filter by department
      if (this.selectedDepartment !== 'all' && shift.department !== parseInt(this.selectedDepartment)) {
        return false;
      }
      
      // Filter by status
      if (this.selectedStatus !== 'all' && shift.status !== this.selectedStatus) {
        return false;
      }
      
      return true;
    });
  }

  calculateSummaryStats() {
    this.summaryStats = {
      total_shifts: this.allShifts.length,
      assigned_shifts: this.allShifts.filter(s => s.assigned && s.status !== 'completed').length,
      completed_shifts: this.allShifts.filter(s => s.status === 'completed').length,
      unassigned_shifts: this.allShifts.filter(s => !s.assigned).length,
      coverage_conflicts: 0 // You can calculate this based on your business logic
    };
  }

  getStatusClass(shift: any): string {
    const statusMap: {[key: string]: string} = {
      'assigned': 'status-assigned',
      'completed': 'status-complete',
      'unassigned': 'status-unassigned'
    };
    return statusMap[shift.status] || '';
  }

  getStatusText(shift: any): string {
    const statusMap: {[key: string]: string} = {
      'assigned': 'Assigned',
      'completed': 'Completed',
      'unassigned': 'Not Assigned'
    };
    return statusMap[shift.status] || '';
  }

  generateReport() {
    this.loadShifts();
  }

  exportReport() {
    // Placeholder for future PDF export functionality
    console.log('Export functionality will be implemented later');
  }

  openDatePicker(type: 'start' | 'end') {
    // Implement date picker logic here
    console.log(`Open ${type} date picker`);
  }

  goBack() {
    this.location.back();
  }
}