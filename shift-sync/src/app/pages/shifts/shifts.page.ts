import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Shift {
  id: number;
  department: number;
  day_of_week: string;
  shift_type: string;
  start_time: string;
  end_time: string;
}

interface Department {
  id: number;
  company: number;
  company_name: string;
  name: string;
  description: string;
  num_employees: number;
}

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MainMenuComponent, HttpClientModule]
})
export class ShiftsPage {
  departments: Department[] = [];  // Will store departments fetched from the API
  departmentMap: { [key: number]: string } = {};  // Map to quickly access department name by id

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  shifts: Shift[] = [];
  filteredShifts: any[] = [];

  selectedDepartment = '';
  selectedDay = '';

  constructor(private menuCtrl: MenuController, private http: HttpClient) {}

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
    this.fetchDepartments();  // Fetch departments first
    this.fetchShifts();  // Fetch shifts data
  }

  fetchDepartments() {
    const companyId = 7; // Use company ID
    this.http.get<Department[]>(`http://127.0.0.1:8000/api/departments/?company=${companyId}`).subscribe(data => {
      this.departments = data;
      
      // Type the map explicitly
      this.departmentMap = data.reduce((map: { [key: number]: string }, dept) => {
        map[dept.id] = dept.name;
        return map;
      }, {} as { [key: number]: string }); // Explicitly type the map here
      
      this.applyFilters();  // Reapply filters once departments are fetched
    });
  }
  

  fetchShifts() {
    const companyId = 7; // Use company ID
    this.http.get<Shift[]>(`http://127.0.0.1:8000/api/shifts/?company=${companyId}`).subscribe(data => {
      this.shifts = data;
      this.applyFilters();  // Apply filters after shifts are fetched
    });
  }

  applyFilters() {
    // Define the map as an object with number keys and string values
    const departmentMap: { [key: number]: string } = {};
  
    // Populate the map with department data
    this.departments.forEach(dept => {
      departmentMap[dept.id] = dept.name;
    });
  
    this.filteredShifts = this.shifts
      .filter(shift => 
        (!this.selectedDepartment || shift.department == +this.selectedDepartment) &&
        (!this.selectedDay || this.getDayName(shift.day_of_week) === this.selectedDay)
      )
      .map(shift => ({
        id: shift.id,
        name: this.getShiftName(shift.shift_type),
        departmentId: shift.department,
        departmentName: departmentMap[shift.department],  // Use the department name from the map
        day: this.getDayName(shift.day_of_week),
        startTime: shift.start_time,
        endTime: shift.end_time,
        assignedEmployees: [] // You can fetch assigned employees here if needed
      }));
  }
  

  getShiftName(shiftType: string): string {
    switch (shiftType) {
      case 'morning': return 'Morning Shift';
      case 'evening': return 'Evening Shift';
      case 'night': return 'Night Shift';
      default: return shiftType;
    }
  }

  getDayName(dayCode: string): string {
    const dayMap: { [key: string]: string } = {
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday'
    };
    return dayMap[dayCode] || dayCode;
  }

  onFilterChange() {
    this.applyFilters();
  }

  openAddShiftModal() {
    // Logic to open modal
  }

  openEditShiftModal(shift: any) {
    // Logic to edit shift
  }

  confirmDelete(shift: any) {
    // Logic to delete shift
  }

  closeShiftModal() {
    // Logic to close modal
  }

  saveShift() {
    // Logic to save shift
  }
}
