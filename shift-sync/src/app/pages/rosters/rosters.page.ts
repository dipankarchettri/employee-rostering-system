import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  IonCheckbox,
  IonItem,
  IonLabel
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

// Define the Employee interface
interface Employee {
  name: string;
  initial: string;
  department: string;
  schedule: {
    [key: string]: {
      shift?: 'morning' | 'evening' | 'night';
      dept?: 'dept1' | 'dept2';
      reason?: string;
    };
  };
}

@Component({
  selector: 'app-rosters',
  templateUrl: './rosters.page.html',
  styleUrls: ['./rosters.page.scss'],
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
    IonMenuButton,
    IonIcon,
    IonButton,
    IonCheckbox,
    IonItem,
    IonLabel
  ]
})
export class RostersPage implements OnInit {
  // Weekday labels for display in the table header
  weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Weekday keys for accessing the schedule object
  weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Sample employee data with updated structure
  employees: Employee[] = [
    {
      name: 'John',
      initial: 'J',
      department: 'HR Department & IT',
      schedule: {
        monday: { shift: 'morning', dept: 'dept1' },
        tuesday: { shift: 'morning', dept: 'dept1' },
        wednesday: { reason: 'Day off' },
        thursday: { shift: 'evening', dept: 'dept2' },
        friday: { shift: 'evening', dept: 'dept2' },
        saturday: { reason: 'Weekend' },
        sunday: { reason: 'Weekend' }
      }
    },
    {
      name: 'Firas',
      initial: 'F',
      department: 'IT & DevOps ',
      schedule: {
        monday: { reason: 'Training' },
        tuesday: { shift: 'evening', dept: 'dept1' },
        wednesday: { shift: 'evening', dept: 'dept1' },
        thursday: { shift: 'morning', dept: 'dept2' },
        friday: { shift: 'morning', dept: 'dept2' },
        saturday: { reason: 'On call' },
        sunday: { reason: 'Weekend' }
      }
    },
    {
      name: 'Kavya',
      initial: 'K',
      department: 'Operations',
      schedule: {
        monday: { reason: 'Vacation' },
        tuesday: { reason: 'Vacation' },
        wednesday: { shift: 'morning', dept: 'dept1' },
        thursday: { shift: 'morning', dept: 'dept1' },
        friday: { reason: 'Medical leave' },
        saturday: { shift: 'night', dept: 'dept2' },
        sunday: { shift: 'night', dept: 'dept2' }
      }
    }
  ];


  // Form control properties
  startDate: Date = new Date();
  endDate: Date = new Date();
  applyPreferences: boolean = true;
  balanceWorkload: boolean = true;

  constructor() {
    // Register the icons
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

  generateRoster() {
    console.log('Generating roster for date range:', this.startDate, 'to', this.endDate);
    console.log('Options:', {
      applyPreferences: this.applyPreferences,
      balanceWorkload: this.balanceWorkload
    });
    // Implementation for roster generation logic
  }

  exportRoster(format: string) {
    console.log(`Exporting roster in ${format} format`);
    // Implementation for export logic
  }
}