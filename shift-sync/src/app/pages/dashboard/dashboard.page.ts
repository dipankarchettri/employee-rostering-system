import { Component, OnInit } from '@angular/core';
import { MenuController, IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';
import { HttpClient } from '@angular/common/http';

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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MainMenuComponent],
  providers: [DatePipe]
})
export class DashboardPage implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading = true;
  companyId = 19; // Set your company ID
  userName = 'Admin';
  currentDate = new Date();

  constructor(
    private menuCtrl: MenuController,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    // Update time every second
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
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

  generateWeeklyRoster() {
    this.http.get(`http://127.0.0.1:8000/api/rosters/generate-weekly-roster/?company=${this.companyId}`)
      .subscribe({
        next: () => this.loadDashboardData(),
        error: (err) => console.error('Error generating roster:', err)
      });
  }

  isToday(dayName: string): boolean {
    const today = new Date();
    const todayName = this.datePipe.transform(today, 'EEE');
    return dayName === todayName;
  }

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

  isCurrentDay(dayDate: string): boolean {
    if (!dayDate) return false;
    
    const today = new Date();
    const compareDate = new Date(dayDate);
    return today.getDate() === compareDate.getDate() && 
           today.getMonth() === compareDate.getMonth() && 
           today.getFullYear() === compareDate.getFullYear();
  }
}