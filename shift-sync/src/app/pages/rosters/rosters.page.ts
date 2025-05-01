import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DatePipe, CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonSpinner,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  documentOutline,
  documentTextOutline,
  notificationsOutline,
  calendarOutline
} from 'ionicons/icons';

// Interfaces
export interface Roster {
  id: number;
  date: string;
  is_conflict: boolean;
  assigned_manually: boolean;
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
}

export interface EmployeeSchedule {
  id: number;
  name: string;
  department: string;
  departmentId: number;
  initial: string;
  schedule: {
    [day: string]: {
      shift?: string;
      dept?: string;
      deptId?: number;
      startTime?: string;
      endTime?: string;
    }
  };
}

export interface Employee {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  color?: string;
}

@Component({
  selector: 'app-roster',
  templateUrl: './rosters.page.html',
  styleUrls: ['./rosters.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonButton,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonSpinner,
    IonBackButton
  ],
  providers: [DatePipe]
})
export class RostersPage implements OnInit {
  startDate: Date = new Date();
  endDate: Date = new Date();
  applyPreferences = true;
  balanceWorkload = true;
  isLoading = true;

  weekdayLabels: { short: string; full: string }[] = [
    { short: 'Mon', full: 'Monday' },
    { short: 'Tue', full: 'Tuesday' },
    { short: 'Wed', full: 'Wednesday' },
    { short: 'Thu', full: 'Thursday' },
    { short: 'Fri', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' },
    { short: 'Sun', full: 'Sunday' }
  ];

  employees: EmployeeSchedule[] = [];
  rosterData: Roster[] = [];
  allEmployees: Employee[] = [];
  allDepartments: Department[] = [];
  departmentColors: string[] = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F06292', '#7986CB', '#9575CD'
  ];

  constructor(private http: HttpClient, private datePipe: DatePipe) {
    addIcons({
      mailOutline,
      documentOutline,
      documentTextOutline,
      notificationsOutline,
      calendarOutline
    });

    this.setDefaultDateRange();
  }

  ngOnInit() {
    this.loadInitialData();
  }

  setDefaultDateRange() {
    const today = new Date();
    this.startDate = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Monday
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.startDate.getDate() + 6); // Sunday
  }

  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour} ${period}`;
  }

  getDayDate(dayIndex: number): Date {
    const date = new Date(this.startDate);
    date.setDate(date.getDate() + dayIndex);
    return date;
  }

  loadInitialData() {
    const companyId = 1;
    this.isLoading = true;
  
    Promise.all([
      firstValueFrom(this.http.get<Employee[]>(`http://127.0.0.1:8000/api/employees/?company=${companyId}`)),
      firstValueFrom(this.http.get<Department[]>(`http://127.0.0.1:8000/api/departments/?company=${companyId}`))
    ])
    .then(([employees, departments]) => {
      this.allEmployees = employees;
      this.allDepartments = departments.map((dept, index) => ({
        ...dept,
        color: this.departmentColors[index % this.departmentColors.length]
      }));
      this.loadRosterData();
    })
    .catch(err => {
      console.error('Error loading employees/departments:', err);
      this.isLoading = false;
    });
  }

  loadRosterData() {
    const companyId = 1;
    const startDate = this.formatDateForAPI(this.startDate);
    const endDate = this.formatDateForAPI(this.endDate);

    this.http.get<any>(`http://127.0.0.1:8000/api/rosters/weekly_roster/?company=${companyId}`)
      .subscribe({
        next: (response) => {
          this.rosterData = response.rosters;
          this.processRosterData();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading roster data:', err);
          this.isLoading = false;
        }
      });
  }

  processRosterData() {
    const employeeMap = new Map<number, EmployeeSchedule>();

    this.rosterData.forEach(roster => {
      if (!employeeMap.has(roster.employee)) {
        const employeeInfo = this.allEmployees.find(e => e.id === roster.employee);
        const deptInfo = this.allDepartments.find(d => d.id === roster.shift_details.department);

        employeeMap.set(roster.employee, {
          id: roster.employee,
          name: employeeInfo ? employeeInfo.name : `Employee ${roster.employee}`,
          department: deptInfo ? deptInfo.name : `Dept ${roster.shift_details.department}`,
          departmentId: roster.shift_details.department,
          initial: employeeInfo ? employeeInfo.name.charAt(0) : `E${roster.employee}`,
          schedule: {}
        });
      }
    });

    employeeMap.forEach(employee => {
      this.weekdayLabels.forEach(day => {
        employee.schedule[day.full.toLowerCase()] = {};
      });
    });

    this.rosterData.forEach(roster => {
      const employee = employeeMap.get(roster.employee);
      if (employee) {
        const day = roster.shift_details.day_of_week.toLowerCase();
        const deptInfo = this.allDepartments.find(d => d.id === roster.shift_details.department);
        
        employee.schedule[day] = {
          shift: roster.shift_details.shift_type.replace(' Shift', ''),
          dept: deptInfo?.name || `Dept ${roster.shift_details.department}`,
          deptId: roster.shift_details.department,
          startTime: this.formatTime(roster.shift_details.start_time),
          endTime: this.formatTime(roster.shift_details.end_time)
        };
      }
    });

    this.employees = Array.from(employeeMap.values());
  }

  getDepartmentColor(deptId?: number): string {
    if (!deptId) return '#CCCCCC';
    const dept = this.allDepartments.find(d => d.id === deptId);
    return dept?.color || '#CCCCCC';
  }
  generateRoster() {
    console.log('Generating roster with options:', {
      applyPreferences: this.applyPreferences,
      balanceWorkload: this.balanceWorkload,
      dateRange: {
        start: this.startDate,
        end: this.endDate
      }
    });
    this.loadRosterData();
  }

  exportRoster(format: string) {
    console.log(`Exporting roster as ${format}`);
    // Implement actual export logic
  }
}