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
import { forkJoin } from 'rxjs';

interface Employee {
  id: number;
  name: string;
}

interface Unavailability {
  id: number;
  employee: number;
  type: string;
  reason: string;
  start: string;
  end: string;
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
  employees: Employee[] = [];
  availabilities: Unavailability[] = [];
  selectedEmployee: Employee | null = null;
  isLoading = true;

  constructor(private http: HttpClient) {
    addIcons({
      mailOutline,
      documentOutline,
      documentTextOutline,
      notificationsOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    const companyId = 19;
    
    // Fetch both employees and unavailabilities simultaneously
    forkJoin({
      employees: this.http.get<Employee[]>(`http://127.0.0.1:8000/api/employees/?company=${companyId}`),
      unavailabilities: this.http.get<Unavailability[]>(`http://127.0.0.1:8000/api/unavailabilities/?company=${companyId}`)
    }).subscribe({
      next: ({employees, unavailabilities}) => {
        this.employees = employees;
        this.availabilities = unavailabilities;
        
        if (this.employees.length > 0) {
          this.selectedEmployee = this.employees[0];
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.isLoading = false;
      }
    });
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  }

  formatDate(date: string): string {
    const newDate = new Date(date);
    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  onEmployeeSelected() {
    // Filter logic can be added here if needed
  }
}