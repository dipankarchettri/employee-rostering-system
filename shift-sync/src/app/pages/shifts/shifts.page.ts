import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonIcon, 
  IonAvatar, 
  IonItemSliding, 
  IonItemOptions, 
  IonItemOption, 
  IonModal,
  IonInput,
  IonDatetime,
  IonDatetimeButton,
  MenuController,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  createOutline, 
  trashOutline, 
  timeOutline,
  closeOutline
} from 'ionicons/icons';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MainMenuComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonAvatar,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonModal,
    IonInput,
    IonDatetime,
    IonDatetimeButton,
    IonButtons
  ]
})
export class ShiftsPage {
  departments = ['Sales', 'Support', 'HR'];
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDepartment = '';
  selectedDay = '';
  showShiftModal = false;
  editingShift = false;
  currentShiftId: number | null = null;

  allEmployees = [
    { id: 1, name: 'John Doe', avatar: 'assets/avatar1.png' },
    { id: 2, name: 'Jane Smith', avatar: 'assets/avatar2.png' },
    { id: 3, name: 'Mike Johnson', avatar: 'assets/avatar3.png' },
    { id: 4, name: 'Sarah Williams', avatar: 'assets/avatar4.png' },
    { id: 5, name: 'Tom Brown', avatar: 'assets/avatar5.png' }
  ];

  shifts = [
    {
      id: 1,
      name: 'Morning Shift',
      department: 'Sales',
      day: 'Monday',
      startTime: '08:00',
      endTime: '16:00',
      employees: [this.allEmployees[0], this.allEmployees[1]]
    },
    {
      id: 2,
      name: 'Evening Shift',
      department: 'Support',
      day: 'Monday',
      startTime: '16:00',
      endTime: '00:00',
      employees: [this.allEmployees[2], this.allEmployees[3]]
    }
  ];

  shiftForm = {
    name: '',
    department: '',
    day: '',
    startTime: '',
    endTime: '',
    assignedEmployees: [] as number[]
  };

  constructor(private menuCtrl: MenuController) {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      timeOutline,
      closeOutline
    });
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
  }

  filteredShifts() {
    return this.shifts.filter(shift =>
      (!this.selectedDepartment || shift.department === this.selectedDepartment) &&
      (!this.selectedDay || shift.day === this.selectedDay)
    );
  }

  openAddShiftModal() {
    this.showShiftModal = true;
    this.editingShift = false;
    this.currentShiftId = null;
    this.resetForm();
  }

  editShift(shift: any) {
    this.showShiftModal = true;
    this.editingShift = true;
    this.currentShiftId = shift.id;
    
    this.shiftForm = {
      name: shift.name,
      department: shift.department,
      day: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      assignedEmployees: shift.employees.map((emp: any) => emp.id)
    };
  }

  deleteShift(shift: any) {
    this.shifts = this.shifts.filter(s => s.id !== shift.id);
  }

  saveShift() {
    if (this.editingShift && this.currentShiftId) {
      // Update existing shift
      const index = this.shifts.findIndex(s => s.id === this.currentShiftId);
      if (index !== -1) {
        this.shifts[index] = {
          ...this.shifts[index],
          ...this.shiftForm,
          employees: this.allEmployees.filter(emp => 
            this.shiftForm.assignedEmployees.includes(emp.id)
          )
        };
      }
    } else {
      // Add new shift
      const newId = Math.max(...this.shifts.map(s => s.id), 0) + 1;
      this.shifts.push({
        id: newId,
        name: this.shiftForm.name,
        department: this.shiftForm.department,
        day: this.shiftForm.day,
        startTime: this.shiftForm.startTime,
        endTime: this.shiftForm.endTime,
        employees: this.allEmployees.filter(emp => this.shiftForm.assignedEmployees.includes(emp.id))
      });
    }
    
    this.closeShiftModal();
  }

  closeShiftModal() {
    this.showShiftModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.shiftForm = {
      name: '',
      department: '',
      day: '',
      startTime: '',
      endTime: '',
      assignedEmployees: []
    };
  }

  compareWith(o1: any, o2: any) {
    return o1 === o2;
  }
}