import { Component, OnInit } from '@angular/core';
import { MenuController, IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface DashboardData {
  company: {
    id: number;
    name: string;
  };
  stats: {
    total_employees: number;
    shifts_this_week: number;
    pending_assignments: number;
    shift_coverage: number;
  };
  departments: {
    id: number;
    name: string;
    employee_count: number;
    shift_count: number;
    coverage: number;
  }[];
  week_summary: {
    day: string;
    date: string;
    coverage: number;
  }[];
  notifications: {
    id: number;
    message: string;
    created_at: string;
    is_read: boolean;
  }[];
  unavailabilities: {
    id: number;
    employee: {
      id: number;
      name: string;
      avatar: string;
    };
    start: string;
    end: string;
    type: string;
    reason?: string;
  }[];
}

interface Shift {
  id: number;
  department: number;
  day_of_week: string;
  shift_type: string;
  start_time: string;
  end_time: string;
}

interface Employee {
  id: number;
  name: string;
  departments: number[];
}

interface RosterResponse {
  rosters: {
    id: number;
    shift: number;
    shift_details: {
      id: number;
      date: string;
      day_of_week: string;
      start_time: string;
      end_time: string;
      department: number;
      shift_type: string;
    };
    date: string;
    is_conflict: boolean;
    assigned_manually: boolean;
    company: number;
    employee: number;
  }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MainMenuComponent, FormsModule],
  providers: [DatePipe]
})
export class DashboardPage implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading = true;
  companyId = 19;
  currentDate = new Date();
  
  // Assignment modal properties
  showAssignmentModal = false;
  unassignedShifts: Shift[] = [];
  availableEmployees: Employee[] = [];
  selectedShift: Shift | null = null;
  selectedEmployeeId: number | null = null;
  isLoadingShifts = false;
  isLoadingEmployees = false;

  constructor(
    private menuCtrl: MenuController,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    setInterval(() => this.currentDate = new Date(), 1000);
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
  }

  loadDashboardData() {
    this.isLoading = true;
    this.http.get<DashboardData>(`http://127.0.0.1:8000/api/dashboard/${this.companyId}/`)
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoading = false;
        }
      });
  }

  // Week summary methods
  getOrderedWeekSummary() {
    if (!this.dashboardData?.week_summary) return [];
    
    // Find Sunday and reorder the array to start with Sunday
    const sundayIndex = this.dashboardData.week_summary.findIndex(day => day.day === 'Sun');
    if (sundayIndex === -1) return this.dashboardData.week_summary;
    
    return [
      ...this.dashboardData.week_summary.slice(sundayIndex),
      ...this.dashboardData.week_summary.slice(0, sundayIndex)
    ];
  }

  isToday(dayName: string): boolean {
    const today = new Date();
    const todayName = this.datePipe.transform(today, 'EEE');
    return dayName === todayName;
  }

  isCurrentDay(dayDate: string): boolean {
    if (!dayDate) return false;
    
    const today = new Date();
    const compareDate = new Date(dayDate);
    return today.getDate() === compareDate.getDate() && 
           today.getMonth() === compareDate.getMonth() && 
           today.getFullYear() === compareDate.getFullYear();
  }

  // Shift assignment methods
  async generateWeeklyRoster() {
    try {
      await this.http.get(`http://127.0.0.1:8000/api/rosters/generate-weekly-roster/?company=${this.companyId}`)
        .toPromise();
      this.loadDashboardData();
    } catch (err) {
      console.error('Error generating roster:', err);
    }
  }

  async openAssignmentModal() {
    this.showAssignmentModal = true;
    this.isLoadingShifts = true;
    
    try {
      // Get all shifts
      const shiftsResponse = await this.http.get<Shift[]>(
        `http://127.0.0.1:8000/api/shifts/?company=${this.companyId}`
      ).toPromise();

      // Get assigned shifts - note the response structure
      const rostersResponse = await this.http.get<RosterResponse>(
        `http://127.0.0.1:8000/api/rosters/weekly_roster/?company=${this.companyId}`
      ).toPromise();

      // Extract the rosters array from the response
      const rosters = rostersResponse?.rosters || [];
      const shifts = shiftsResponse || [];

      // Get assigned shift IDs - use the shift property (not shift_details.id)
      const assignedShiftIds = rosters.map(r => r.shift);
      console.log('Assigned shift IDs:', assignedShiftIds);
      console.log('All shifts:', shifts.map(s => s.id));

      // Filter unassigned shifts
      this.unassignedShifts = shifts.filter(shift => 
        !assignedShiftIds.includes(shift.id)
      );
      
      console.log('Unassigned shifts count:', this.unassignedShifts.length);
      console.log('Unassigned shifts:', this.unassignedShifts);
      
      this.isLoadingShifts = false;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      this.isLoadingShifts = false;
    }
  }

  async onShiftSelect(shift: Shift) {
    this.selectedShift = shift;
    this.selectedEmployeeId = null;
    this.isLoadingEmployees = true;
    
    try {
      // Get all employees
      const employees = await this.http.get<Employee[]>(
        `http://127.0.0.1:8000/api/employees/?company=${this.companyId}`
      ).toPromise();

      // Filter employees in the same department
      this.availableEmployees = (employees || []).filter(employee => 
        employee.departments.includes(shift.department)
      );
      
      console.log('Available employees:', this.availableEmployees);
      
      this.isLoadingEmployees = false;
    } catch (error) {
      console.error('Error fetching employees:', error);
      this.isLoadingEmployees = false;
    }
  }

  async assignShift() {
    if (!this.selectedShift || !this.selectedEmployeeId) return;

    try {
      const assignment = {
        company: this.companyId,
        employee: this.selectedEmployeeId,
        shift: this.selectedShift.id,
        date: new Date().toISOString().split('T')[0],
        assigned_manually: true
      };

      await this.http.post(
        `http://127.0.0.1:8000/api/rosters/`,
        assignment
      ).toPromise();

      // Refresh data
      this.loadDashboardData();
      this.closeModal();
    } catch (error) {
      console.error('Error assigning shift:', error);
    }
  }

  closeModal() {
    this.showAssignmentModal = false;
    this.selectedShift = null;
    this.selectedEmployeeId = null;
    this.unassignedShifts = [];
    this.availableEmployees = [];
  }

  // Helper methods
  getShiftName(shiftType: string): string {
    switch(shiftType) {
      case 'morning': return 'Morning Shift';
      case 'afternoon': return 'Afternoon Shift';
      case 'evening': return 'Evening Shift';
      case 'night': return 'Night Shift';
      default: return shiftType;
    }
  }

  getDayName(dayCode: string): string {
    const days: {[key: string]: string} = {
      'mon': 'Monday', 'tue': 'Tuesday', 'wed': 'Wednesday',
      'thu': 'Thursday', 'fri': 'Friday', 'sat': 'Saturday',
      'sun': 'Sunday'
    };
    return days[dayCode.toLowerCase()] || dayCode;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minutes} ${period}`;
  }

  getDepartmentName(departmentId: number): string {
    if (!this.dashboardData) return 'Department';
    const dept = this.dashboardData.departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Department';
  }
}