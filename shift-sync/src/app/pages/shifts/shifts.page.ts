import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD
import { MenuController, IonicModule } from '@ionic/angular';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';

interface Shift {
  id?: number;
  name: string;
  departmentId: number;
  day: string;
  startTime: string;
  endTime: string;
  assignedEmployees?: any[];
}

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  selected?: boolean;
}
=======
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
>>>>>>> 58330be2991d92ed08bcd420e8b1625bd4ffbe35

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule, IonicModule, MainMenuComponent]
})
export class ShiftsPage {
  departments: Department[] = [
    { id: 1, name: 'Sales' },
    { id: 2, name: 'Support' },
    { id: 3, name: 'HR' }
  ];

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  allEmployees: Employee[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Sarah Williams' },
    { id: 5, name: 'Tom Brown' }
  ];

  shifts: Shift[] = [
=======
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
>>>>>>> 58330be2991d92ed08bcd420e8b1625bd4ffbe35
    {
      id: 1,
      name: 'Morning Shift',
      departmentId: 1,
      day: 'Monday',
<<<<<<< HEAD
      startTime: '09:00',
      endTime: '13:00',
      assignedEmployees: [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }]
    },
    {
      id: 2,
      name: 'Afternoon Shift',
      departmentId: 2,
      day: 'Tuesday',
      startTime: '13:00',
      endTime: '17:00',
      assignedEmployees: [{ id: 3, name: 'Mike Johnson' }]
    },
    {
      id: 3,
      name: 'Night Shift',
      departmentId: 3,
      day: 'Friday',
      startTime: '20:00',
      endTime: '00:00',
      assignedEmployees: [{ id: 4, name: 'Sarah Williams' }, { id: 5, name: 'Tom Brown' }]
    }
  ];

  filteredShifts: Shift[] = [];
  currentShift: Shift = this.getEmptyShift();
  showShiftModal = false;
  editingShift = false;
  selectedDepartment = '';
  selectedDay = '';

  constructor(private menuCtrl: MenuController) {
    this.filteredShifts = this.shifts;
  }

  getEmptyShift(): Shift {
    return { name: '', departmentId: 0, day: '', startTime: '', endTime: '', assignedEmployees: [] };
=======
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
>>>>>>> 58330be2991d92ed08bcd420e8b1625bd4ffbe35
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
  }

  openAddShiftModal() {
    this.currentShift = this.getEmptyShift();
    this.showShiftModal = true;
    this.editingShift = false;
  }

  openEditShiftModal(shift: Shift) {
    this.currentShift = { ...shift };
    this.showShiftModal = true;
<<<<<<< HEAD
    this.editingShift = true;
=======
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
>>>>>>> 58330be2991d92ed08bcd420e8b1625bd4ffbe35
  }

  compareWith(o1: any, o2: any) {
    return o1 === o2;
  }
<<<<<<< HEAD

  saveShift() {
    if (this.editingShift) {
      const index = this.shifts.findIndex(s => s.id === this.currentShift.id);
      if (index !== -1) {
        this.shifts[index] = { ...this.currentShift };
      }
    } else {
      this.currentShift.id = Date.now(); // Temporary ID
      this.shifts.push({ ...this.currentShift });
    }
    this.closeShiftModal();
    this.filterShifts();
  }

  confirmDelete(shift: Shift) {
    if (confirm(`Are you sure you want to delete the shift "${shift.name}"?`)) {
      this.shifts = this.shifts.filter(s => s.id !== shift.id);
      this.filterShifts();
    }
  }

  filterShifts() {
    this.filteredShifts = this.shifts.filter(shift => {
      const matchesDepartment = !this.selectedDepartment || shift.departmentId.toString() === this.selectedDepartment;
      const matchesDay = !this.selectedDay || shift.day === this.selectedDay;
      return matchesDepartment && matchesDay;
    });
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'Unknown';
  }
}
=======
}
>>>>>>> 58330be2991d92ed08bcd420e8b1625bd4ffbe35
