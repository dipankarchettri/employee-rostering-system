import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  IonBackButton, // Added
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetimeButton,  // Add this import
  IonModal,          // Add this import
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

// Define the Report interface
interface ReportItem {
  date: Date;
  department: string;
  shiftName: string;
  employeeCount: number;
  status: 'Complete' | 'Pending';
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MainMenuComponent,
    IonApp,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton, // Added
    IonMenuButton,
    IonIcon,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetimeButton,  // Add to imports
    IonModal,          // Add to imports
    IonDatetime  
  ]
})
export class ReportsPage implements OnInit {
  // Date range
  startDate: Date = new Date();
  endDate: Date = new Date();
  
  // Filter options
  selectedDepartment: string = 'all';
  selectedReportType: string = 'summary';
  
  // Sample report data
  reportData: ReportItem[] = [
    {
      date: new Date(2025, 3, 20),
      department: 'HR Department',
      shiftName: 'Morning Shift',
      employeeCount: 3,
      status: 'Complete'
    },
    {
      date: new Date(2025, 3, 20),
      department: 'IT Support',
      shiftName: 'Afternoon Shift',
      employeeCount: 2,
      status: 'Complete'
    },
    {
      date: new Date(2025, 3, 21),
      department: 'Operations',
      shiftName: 'Morning Shift',
      employeeCount: 2,
      status: 'Complete'
    },
    {
      date: new Date(2025, 3, 21),
      department: 'Customer Service',
      shiftName: 'Afternoon Shift',
      employeeCount: 4,
      status: 'Complete'
    },
    {
      date: new Date(2025, 3, 22),
      department: 'HR Department',
      shiftName: 'Morning Shift',
      employeeCount: 1,
      status: 'Pending'
    }
  ];

  constructor(private location: Location) { // Modified
    addIcons({
      mailOutline,
      documentOutline,
      documentTextOutline,
      notificationsOutline,
      calendarOutline
    });
  }

  // Add back navigation method
  goBack() {
    this.location.back();
  }

  ngOnInit() {
    // Initialize with current week
    const today = new Date();
    this.setDefaultDateRange(today);
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

  generateReport() {
    console.log('Generating report for date range:', this.startDate, 'to', this.endDate);
    console.log('Filters:', {
      department: this.selectedDepartment,
      reportType: this.selectedReportType
    });
    // Implementation for report generation logic
  }

  exportReport(format: string) {
    console.log(`Exporting report in ${format} format`);
    // Implementation for export logic
  }
}