import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common'
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
  mailOutline, 
  documentOutline, 
  documentTextOutline, 
  notificationsOutline,
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
      
  ],  providers: [Location]
})
export class ReportsPage implements OnInit {
  
  // Date range
  startDate: Date = new Date();
  endDate: Date = new Date();
  
  // Filter options
  selectedDepartment: string = 'all';
  selectedReportType: string = 'summary';
  
  // Report data
  reportData: any[] = [];
  summaryStats = {
    totalShifts: 0,
    employeesAssigned: 0,
    coverageConflicts: 0
  };
  departments: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private location: Location
  ) {
    addIcons({
      mailOutline,
      documentOutline,
      documentTextOutline,
      notificationsOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    // Initialize with current week
    const today = new Date();
    this.setDefaultDateRange(today);
    this.loadDepartments();
    this.generateReport();
  }

  setDefaultDateRange(date: Date) {
    // Find Monday of the current week
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
    this.http.get('http://127.0.0.1:8000/api/departments/?company=19').subscribe({
      next: (data: any) => {
        this.departments = data;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  generateReport() {
    this.isLoading = true;
    
    const params = {
      start_date: this.startDate.toISOString().split('T')[0],
      end_date: this.endDate.toISOString().split('T')[0],
      department: this.selectedDepartment,
      type: this.selectedReportType
    };

    this.http.get('http://127.0.0.1:8000/api/companies/19/reports/', { params }).subscribe({
      next: (data: any) => {
        this.reportData = data.report_data || [];
        this.summaryStats = {
          totalShifts: data.summary_stats?.total_shifts || 0,
          employeesAssigned: data.summary_stats?.employees_assigned || 0,
          coverageConflicts: data.summary_stats?.coverage_conflicts || 0
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.isLoading = false;
      }
    });
  }

  exportReport(format: string) {
    const params = {
      start_date: this.startDate.toISOString().split('T')[0],
      end_date: this.endDate.toISOString().split('T')[0],
      department: this.selectedDepartment,
      type: this.selectedReportType
    };

    this.http.get(`http://127.0.0.1:8000/api/companies/19/reports/export/${format}/`, { 
      params,
      responseType: 'blob' 
    }).subscribe({
      next: (blob) => {
        // Handle file download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}