import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { 
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { addIcons } from 'ionicons';
import { notificationsOutline, add } from 'ionicons/icons';

interface Employee {
  id: number;
  name: string;
}

interface Unavailability {
  id?: number;
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
    IonBackButton,
    IonButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption
  ]
})
export class AvailabilityPage implements OnInit {
  employees: Employee[] = [];
  availabilities: Unavailability[] = [];
  filteredAvailabilities: Unavailability[] = [];
  selectedEmployee: Employee | null = null;
  
  showUnavailabilityModal = false;
  editingUnavailability = false;
  currentUnavailability: Unavailability = {
    employee: 0,
    type: 'vacation',
    reason: '',
    start: '',
    end: '',
    company: 19
  };

  constructor(
    private http: HttpClient,
    private location: Location
  ) {
    addIcons({ notificationsOutline, add });
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    const companyId = 19;
  
    forkJoin({
      employees: this.http.get<Employee[]>(`http://127.0.0.1:8000/api/employees/?company=${companyId}`),
      unavailabilities: this.http.get<Unavailability[]>(`http://127.0.0.1:8000/api/unavailabilities/?company=${companyId}`)
    }).subscribe({
      next: (response: { employees: Employee[]; unavailabilities: Unavailability[] }) => {
        const { employees, unavailabilities } = response;
        this.employees = employees;
        this.availabilities = unavailabilities;
        this.filteredAvailabilities = [...unavailabilities];
  
        if (this.employees.length > 0) {
          this.selectedEmployee = this.employees[0];
        }
      },
      error: (err: any) => {
        console.error('Error fetching data:', err);
      }
    });
  }
  

  onEmployeeSelected() {
    if (this.selectedEmployee) {
      this.filteredAvailabilities = this.availabilities.filter(
        u => u.employee === this.selectedEmployee?.id
      );
    } else {
      this.filteredAvailabilities = [...this.availabilities];
    }
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openAddUnavailabilityModal() {
    this.currentUnavailability = {
      employee: this.employees[0]?.id || 0,
      type: 'vacation',
      reason: '',
      start: '',
      end: '',
      company: 19
    };
    this.editingUnavailability = false;
    this.showUnavailabilityModal = true;
  }

  openEditUnavailabilityModal(unavailability: Unavailability) {
    this.currentUnavailability = { ...unavailability };
    this.editingUnavailability = true;
    this.showUnavailabilityModal = true;
  }

  closeUnavailabilityModal() {
    this.showUnavailabilityModal = false;
  }

  saveUnavailability() {
    if (!this.currentUnavailability.employee || !this.currentUnavailability.start || !this.currentUnavailability.end) {
      alert('Employee, start date, and end date are required');
      return;
    }

    const apiCall = this.editingUnavailability && this.currentUnavailability.id ?
      this.http.put(`http://127.0.0.1:8000/api/unavailabilities/${this.currentUnavailability.id}/`, this.currentUnavailability) :
      this.http.post('http://127.0.0.1:8000/api/unavailabilities/', this.currentUnavailability);

    apiCall.subscribe({
      next: () => {
        this.fetchData();
        this.closeUnavailabilityModal();
      },
      error: (err) => {
        console.error('Error saving unavailability:', err);
      }
    });
  }

  confirmDelete(unavailability: Unavailability) {
    if (!unavailability.id) return;
    
    if (confirm(`Delete this unavailability record?`)) {
      this.http.delete(`http://127.0.0.1:8000/api/unavailabilities/${unavailability.id}/`)
        .subscribe({
          next: () => {
            this.availabilities = this.availabilities.filter(u => u.id !== unavailability.id);
            this.filteredAvailabilities = this.filteredAvailabilities.filter(u => u.id !== unavailability.id);
          },
          error: (err) => {
            console.error('Error deleting unavailability:', err);
          }
        });
    }
  }

  goBack() {
    this.location.back();
  }
}