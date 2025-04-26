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
  IonLabel,
  IonSelect,
  IonSelectOption
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
    [key: string]: string;
  };
}

@Component({
  selector: 'app-availability',
  templateUrl: './availability.page.html',
  styleUrls: ['./availability.page.scss'],
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
    IonLabel,
    IonSelect,
    IonSelectOption
  ]
})
export class AvailabilityPage implements OnInit {
  // Weekday labels and keys
  weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Time slots for the availability matrix
  timeSlots = ['Morning', 'Afternoon', 'Evening'];
  
  // Selected employee
  selectedEmployee: Employee | null = null;
  
  // Sample employee data (same as in the roster page)
  employees: Employee[] = [
    {
      name: 'Sarah Johnson',
      initial: 'SJ',
      department: 'HR Department',
      schedule: {
        monday: 'M',
        tuesday: 'M',
        wednesday: '',
        thursday: 'A',
        friday: 'A',
        saturday: '',
        sunday: ''
      }
    },
    {
      name: 'Michael Chen',
      initial: 'MC',
      department: 'IT Support',
      schedule: {
        monday: '',
        tuesday: 'A',
        wednesday: 'A',
        thursday: 'M',
        friday: 'M',
        saturday: '',
        sunday: ''
      }
    },
    {
      name: 'Lisa Rodriguez',
      initial: 'LR',
      department: 'Operations',
      schedule: {
        monday: '',
        tuesday: '',
        wednesday: 'M',
        thursday: 'M',
        friday: '',
        saturday: 'A',
        sunday: 'A'
      }
    },
    {
      name: 'James Wilson',
      initial: 'JW',
      department: 'Customer Service',
      schedule: {
        monday: 'A',
        tuesday: 'A',
        wednesday: '',
        thursday: '',
        friday: 'M',
        saturday: 'M',
        sunday: ''
      }
    },
    {
      name: 'Emily Parker',
      initial: 'EP',
      department: 'HR Department',
      schedule: {
        monday: 'M',
        tuesday: '',
        wednesday: '',
        thursday: 'A',
        friday: 'A',
        saturday: '',
        sunday: 'M'
      }
    }
  ];

  // Availability matrix data structure
  availabilityMatrix: {
    [timeSlot: string]: {
      [day: string]: boolean;
    };
  } = {};

  constructor() {
    // Register the icons
    addIcons({
      mailOutline,
      documentOutline,
      documentTextOutline,
      notificationsOutline,
      calendarOutline
    });
    
    // Initialize the availability matrix
    this.initializeAvailabilityMatrix();
  }

  ngOnInit() {
    // Initialization code
  }
  
  initializeAvailabilityMatrix() {
    // Create an empty matrix for each time slot and day
    this.timeSlots.forEach(timeSlot => {
      this.availabilityMatrix[timeSlot] = {};
      this.weekdays.forEach(day => {
        this.availabilityMatrix[timeSlot][day] = false;
      });
    });
  }

  saveAvailability() {
    console.log('Saving availability for:', this.selectedEmployee?.name);
    console.log('Availability data:', this.availabilityMatrix);
    // Implementation for saving availability data
  }

  exportAvailability(format: string) {
    console.log(`Exporting availability in ${format} format`);
    // Implementation for export logic
  }
}