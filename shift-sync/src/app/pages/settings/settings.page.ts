import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonButton, IonIcon, IonToggle, IonInput, IonSelect, 
  IonSelectOption, IonItem, IonLabel, IonDatetime, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonList, 
  IonMenuButton, IonCheckbox 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, cloudUploadOutline, trashOutline, 
  calendarOutline 
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface Holiday {
  date: string;
  name: string;
  isRecurring: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
    IonButton, IonIcon, IonToggle, IonInput, IonSelect, 
    IonSelectOption, IonItem, IonLabel, IonDatetime, IonCard, 
    IonCardHeader, IonCardTitle, IonCardContent, IonList,
    IonMenuButton, IonCheckbox
  ]
})
export class SettingsPage {
  activeTab = 'company';
  logoPreview: string | null = null;
  
  businessHours: BusinessHour[] = [
    { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Saturday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
    { day: 'Sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
  ];
  
  holidays: Holiday[] = [
    { date: new Date(2025, 0, 1).toISOString(), name: 'New Year\'s Day', isRecurring: true },
    { date: new Date(2025, 11, 25).toISOString(), name: 'Christmas Day', isRecurring: true },
  ];
  
  newHoliday: Holiday = {
    date: new Date().toISOString(),
    name: '',
    isRecurring: false
  };
  
  language = 'en';
  dateFormat = 'MM/DD/YYYY';
  timeFormat = '12h';
  currency = 'USD';
  
  defaultShiftLength = 8;
  maxWeeklyHours = 40;
  
  timezone = 'UTC-5';
  weekStartDay = '0';
  darkMode = false;
  
  twoFactorAuth = false;

  constructor(private alertController: AlertController) {
    addIcons({ 
      notificationsOutline, 
      cloudUploadOutline, 
      trashOutline, 
      calendarOutline 
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  handleLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeLogo(event: Event) {
    event.stopPropagation();
    this.logoPreview = null;
  }

  addHoliday() {
    if (this.newHoliday.name.trim()) {
      this.holidays.push({...this.newHoliday});
      this.newHoliday = {
        date: new Date().toISOString(),
        name: '',
        isRecurring: false
      };
    }
  }

  removeHoliday(holiday: Holiday) {
    this.holidays = this.holidays.filter(h => h !== holiday);
  }

  async exportData() {
    const alert = await this.alertController.create({
      header: 'Export Data',
      message: 'Your data has been exported successfully',
      buttons: ['OK']
    });
    await alert.present();
  }

  async confirmReset() {
    const alert = await this.alertController.create({
      header: 'Confirm Reset',
      message: 'Are you sure you want to reset all settings to default?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          handler: () => {
            // Implement reset logic
          }
        }
      ]
    });
    await alert.present();
  }

  requestDataDeletion() {
    // Implement GDPR deletion request
  }
}