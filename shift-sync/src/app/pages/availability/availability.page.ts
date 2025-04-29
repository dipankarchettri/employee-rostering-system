import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
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
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Define the Employee interface
interface Employee {
  id: number;
  name: string;
}

interface Availability {
  id: number;
  employee: number;
  employee_name: string;
  day_of_week: string;
  shift_type: string;
  is_available: boolean;
  company: number;
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
    HttpClientModule,
    MainMenuComponent,
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
  timeSlots = ['morning', 'evening', 'night'];
  
  // Selected employee
  selectedEmployee: Employee | null = null;
  
  // Employees and availabilities
  employees: Employee[] = [];
  availabilities: Availability[] = [];
  
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

  // Initialize availability matrix with all false values
  initializeAvailabilityMatrix() {
    this.timeSlots.forEach(timeSlot => {
      this.availabilityMatrix[timeSlot] = {};
      this.weekdays.forEach(day => {
        this.availabilityMatrix[timeSlot][day] = false;
      });
    });
  }

  // Fetch availabilities from API
  fetchAvailabilities() {
    const companyId = 7;
    this.http.get<Availability[]>(`http://127.0.0.1:8000/api/availabilities/?company=${companyId}`)
      .subscribe({
        next: (data) => {
          this.availabilities = data;
          this.employees = this.extractUniqueEmployees(data);
          
          // Select first employee by default if available
          if (this.employees.length > 0) {
            this.selectedEmployee = this.employees[0];
            this.updateAvailabilityMatrix();
          }
        },
        error: (err) => {
          console.error('Error fetching availabilities:', err);
        }
      });
  }

  // Extract unique employees from availability data
  extractUniqueEmployees(data: Availability[]): Employee[] {
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

  // Update availability matrix when employee is selected
  onEmployeeSelected() {
    if (this.selectedEmployee) {
      this.updateAvailabilityMatrix();
    }
  }

  // Map API days and shifts to the matrix
  updateAvailabilityMatrix() {
    this.initializeAvailabilityMatrix(); // Reset all checkboxes to false
    
    if (!this.selectedEmployee) return;

    const dayMapping: {[key: string]: string} = {
      Mon: "monday",
      Tue: "tuesday",
      Wed: "wednesday",
      Thu: "thursday",
      Fri: "friday",
      Sat: "saturday",
      Sun: "sunday",
    };

    const employeeAvailabilities = this.availabilities.filter(
      avail => avail.employee === this.selectedEmployee?.id
    );

    employeeAvailabilities.forEach(avail => {
      const timeSlot = avail.shift_type.toLowerCase().trim(); 
      const apiDay = avail.day_of_week.trim(); 
      const mappedDay = dayMapping[apiDay]; 

      if (this.availabilityMatrix[timeSlot] && mappedDay in this.availabilityMatrix[timeSlot]) {
        this.availabilityMatrix[timeSlot][mappedDay] = avail.is_available;
      }
    });
  }

  // Save availability to API
  saveAvailability() {
    if (!this.selectedEmployee) return;

    const updates = [];
    
    // Prepare update data
    for (const timeSlot of this.timeSlots) {
      for (const day of this.weekdays) {
        const currentValue = this.availabilityMatrix[timeSlot][day];
        
        // Find existing availability record
        const existing = this.availabilities.find(
          a => a.employee === this.selectedEmployee?.id &&
               a.shift_type.toLowerCase() === timeSlot &&
               a.day_of_week.toLowerCase() === day
        );

        if (existing) {
          // Update existing if changed
          if (existing.is_available !== currentValue) {
            updates.push(
              this.http.patch(`http://127.0.0.1:8000/api/availabilities/${existing.id}/`, {
                is_available: currentValue
              })
            );
          }
        } else {
          // Create new if doesn't exist
          updates.push(
            this.http.post('http://127.0.0.1:8000/api/availabilities/', {
              employee: this.selectedEmployee.id,
              day_of_week: day,
              shift_type: timeSlot,
              is_available: currentValue,
              company: 7
            })
          );
        }
      }
    }

    // Execute all updates
    Promise.all(updates)
      .then(() => {
        console.log('All availability updates saved successfully');
        this.fetchAvailabilities(); // Refresh data
      })
      .catch(err => {
        console.error('Error saving availability:', err);
      });
  }

  // Export availability data
  exportAvailability(format: string) {
    console.log(`Exporting availability in ${format} format`);
    // Implement export functionality here
  }
}
