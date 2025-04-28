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
import { HttpClient } from '@angular/common/http';

// Define the Employee interface
interface Employee {
  id: number;
  name: string;
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
  
  // Employees and availabilities
  employees: Employee[] = [];
  availabilities: any[] = []; // full API response
  
  // Availability matrix data structure
  availabilityMatrix: {
    [timeSlot: string]: {
      [day: string]: boolean;
    };
  } = {};

  constructor(private http: HttpClient) {
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
    this.fetchAvailabilities();
  }

  // Fetch availabilities from API
  fetchAvailabilities() {
    const companyId = 7; // or make it dynamic
    this.http.get<any[]>(`http://127.0.0.1:8000/api/availabilities/?company=${companyId}`)
      .subscribe(data => {
        this.availabilities = data;
        this.employees = this.extractUniqueEmployees(data);
      });
  }

  // Helper method to extract unique employees from API response
  extractUniqueEmployees(data: any[]): Employee[] {
    const employeeMap = new Map<number, Employee>();
    data.forEach(entry => {
      if (!employeeMap.has(entry.employee)) {
        employeeMap.set(entry.employee, {
          id: entry.employee,
          name: entry.employee_name
        });
      }
    });
    return Array.from(employeeMap.values());
  }

  // Initialize availability matrix
  initializeAvailabilityMatrix() {
    this.timeSlots.forEach(timeSlot => {
      this.availabilityMatrix[timeSlot] = {};
      this.weekdays.forEach(day => {
        this.availabilityMatrix[timeSlot][day] = false; // Default to false (unchecked)
      });
    });
  }

  // When an employee is selected, update the availability matrix
  onEmployeeSelected() {
    if (this.selectedEmployee) {
      this.updateAvailabilityMatrix();
    }
  }

  // Update availability matrix based on selected employee's availability data
  updateAvailabilityMatrix() {
    this.timeSlots.forEach(timeSlot => {
      this.weekdays.forEach(day => {
        const availability = this.availabilities.find(
          avail => avail.employee === this.selectedEmployee?.id &&
                  avail.shift_type.toLowerCase() === timeSlot.toLowerCase() &&
                  avail.day_of_week.toLowerCase() === day.toLowerCase()
        );
        this.availabilityMatrix[timeSlot][day] = availability ? availability.is_available : false;
      });
    });
  }

  // Save availability data (just logs for now)
  saveAvailability() {
    console.log('Saving availability for:', this.selectedEmployee?.name);
    console.log('Availability data:', this.availabilityMatrix);
    // Implementation for saving availability data
  }

  // Export availability data
  exportAvailability(format: string) {
    console.log(`Exporting availability in ${format} format`);
    // Implementation for export logic
  }
}
