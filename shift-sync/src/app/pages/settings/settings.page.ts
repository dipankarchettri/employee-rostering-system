import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonSegment, IonSegmentButton, IonLabel, IonText,
  IonRow, IonCol, IonItem, IonList, IonSelect, 
  IonSelectOption, IonButton, IonRadio, IonRadioGroup,
  IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonNote,
  IonToggle, IonInput, IonIcon, IonButtons, IonMenuButton, IonApp
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { informationCircleOutline, notificationsOutline } from 'ionicons/icons';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';

interface TimeZone {
  value: string;
  label: string;
}

interface ScheduleSettings {
  minBreak: number;
  maxWorkdays: number;
  defaultShiftLength: number;
  firstDayOfWeek: string;
}

interface PolicySettings {
  autoApproveTimeOff: boolean;
  enableOvertimeAlerts: boolean;
}

interface NotificationSettings {
  emailEnabled: boolean;
  emailAddress: string;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

interface NotificationEvents {
  shiftChanges: boolean;
  timeOffRequests: boolean;
  schedulePublish: boolean;
}

interface Integrations {
  googleCalendar: boolean;
  slackConnected: boolean;
  slackWorkspaceUrl: string;
  teamsConnected: boolean;
  teamsWebhookUrl: string;
  discordConnected: boolean;
  discordWebhookUrl: string;
  whatsappConnected: boolean;
  whatsappAccountId: string;
  whatsappApiKey: string;
}

interface AuditLog {
  action: string;
  user: string;
  date: string;
  details: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel, IonText,
    IonRow, IonCol, IonItem, IonList, IonSelect,
    IonSelectOption, IonButton, IonRadio, IonRadioGroup,
    IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonNote,
    IonToggle, IonInput, IonIcon, IonButtons, IonMenuButton, IonApp,
    MainMenuComponent
  ]
})
export class SettingsPage implements OnInit {
  currentSegment = 'general';
  
  // Company Information
  companyName = 'RosterHub Inc.';
  timeZone = 'UTC+0';
  timeZones: TimeZone[] = [
    { value: 'UTC+0', label: 'Greenwich Mean Time (UTC+0)' },
    { value: 'UTC+1', label: 'Central European Time (UTC+1)' },
    { value: 'UTC+2', label: 'Eastern European Time (UTC+2)' },
    { value: 'UTC+3', label: 'Moscow Time (UTC+3)' },
    { value: 'UTC+4', label: 'Gulf Standard Time (UTC+4)' },
    { value: 'UTC+5', label: 'Pakistan Standard Time (UTC+5)' },
    { value: 'UTC+5:30', label: 'Indian Standard Time (UTC+5:30)' },
    { value: 'UTC+7', label: 'Indochina Time (UTC+7)' },
    { value: 'UTC+8', label: 'China Standard Time (UTC+8)' },
    { value: 'UTC+9', label: 'Japan Standard Time (UTC+9)' },
    { value: 'UTC+10', label: 'Eastern Australia Time (UTC+10)' },
    { value: 'UTC+12', label: 'New Zealand Time (UTC+12)' },
    { value: 'UTC-3', label: 'Argentina Time (UTC-3)' },
    { value: 'UTC-4', label: 'Atlantic Time (UTC-4)' },
    { value: 'UTC-5', label: 'Eastern Time (UTC-5)' },
    { value: 'UTC-6', label: 'Central Time (UTC-6)' },
    { value: 'UTC-7', label: 'Mountain Time (UTC-7)' },
    { value: 'UTC-8', label: 'Pacific Time (UTC-8)' }
  ];

  // Regional Settings
  language = 'English';
  languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  dateFormat = 'MM/DD/YYYY';
  dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
  timeFormat = '12-hour';

  // Work Schedule Settings
  scheduleSettings: ScheduleSettings = {
    minBreak: 8,
    maxWorkdays: 5,
    defaultShiftLength: 8,
    firstDayOfWeek: 'monday'
  };

  regionalSettings = {
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour'
  };

  // Policy Settings
  policySettings: PolicySettings = {
    autoApproveTimeOff: false,
    enableOvertimeAlerts: true
  };

  // Notification Settings
  notificationSettings: NotificationSettings = {
    emailEnabled: true,
    emailAddress: 'admin@rosterhub.com',
    pushEnabled: true,
    inAppEnabled: true
  };

  // Notification Events
  notificationEvents: NotificationEvents = {
    shiftChanges: true,
    timeOffRequests: true,
    schedulePublish: true
  };

  // Integration Settings
  integrations: Integrations = {
    googleCalendar: false,
    slackConnected: false,
    slackWorkspaceUrl: '',
    teamsConnected: false,
    teamsWebhookUrl: '',
    discordConnected: false,
    discordWebhookUrl: '',
    whatsappConnected: false,
    whatsappAccountId: '',
    whatsappApiKey: ''
  };

  // Audit Logs
  auditLogs: AuditLog[] = [
    {
      action: 'Settings Updated',
      user: 'Admin User',
      date: '2025-04-29 14:32:15',
      details: 'Updated company business hours'
    },
    {
      action: 'Employee Added',
      user: 'HR Manager',
      date: '2025-04-29 10:15:22',
      details: 'Added new employee: John Smith'
    },
    {
      action: 'Holiday Added',
      user: 'Admin User',
      date: '2025-04-28 16:45:39',
      details: 'Added new holiday: Independence Day'
    },
    {
      action: 'Data Exported',
      user: 'Finance Manager',
      date: '2025-04-28 13:20:11',
      details: 'Exported financial reports'
    },
    {
      action: 'Settings Updated',
      user: 'Admin User',
      date: '2025-04-27 09:05:47',
      details: 'Updated localization settings'
    },
    {
      action: 'Employee Updated',
      user: 'HR Manager',
      date: '2025-04-27 11:30:05',
      details: 'Updated employee schedule: Sarah Johnson'
    },
    {
      action: 'Login',
      user: 'Admin User',
      date: '2025-04-26 08:45:32',
      details: 'Admin login from IP: 12.168.1.105'
    },
    {
      action: 'Password Reset',
      user: 'Marketing User',
      date: '2025-04-26 10:22:18',
      details: 'Password reset requested'
    },
    {
      action: 'Settings Updated',
      user: 'Admin User',
      date: '2025-04-25 15:37:09',
      details: 'Updated system display settings'
    },
    {
      action: 'Logout',
      user: 'HR Manager',
      date: '2025-04-25 17:15:00',
      details: 'User logged out'
    }
  ];

  constructor(private toastController: ToastController) {
    addIcons({ informationCircleOutline, notificationsOutline });
  }

  ngOnInit() {
    // Load saved settings from storage or API
    this.loadSettings();
  }

  async loadSettings() {
    try {
      // TODO: Implement loading settings from backend/storage
      // For now using default values
    } catch (error) {
      console.error('Error loading settings:', error);
      await this.showToast('Error loading settings', 'danger');
    }
  }

  async saveCompanySettings() {
    try {
      // TODO: Implement saving to backend
      await this.showToast('Company settings saved successfully');
    } catch (error) {
      console.error('Error saving company settings:', error);
      await this.showToast('Error saving company settings', 'danger');
    }
  }

  async saveRegionalSettings() {
    try {
      // TODO: Implement saving regional settings to backend/storage
      await this.showToast('Regional settings saved successfully');
    } catch (error) {
      console.error('Error saving regional settings:', error);
      await this.showToast('Error saving regional settings', 'danger');
    }
  }

  async saveScheduleSettings() {
    try {
      // TODO: Implement saving schedule settings to backend/storage
      await this.showToast('Schedule settings saved successfully');
    } catch (error) {
      console.error('Error saving schedule settings:', error);
      await this.showToast('Error saving schedule settings', 'danger');
    }
  }

  async savePolicySettings() {
    try {
      // TODO: Implement saving policy settings to backend/storage
      await this.showToast('Policy settings saved successfully');
    } catch (error) {
      console.error('Error saving policy settings:', error);
      await this.showToast('Error saving policy settings', 'danger');
    }
  }

  async saveNotificationSettings() {
    try {
      // TODO: Implement saving notification settings to backend/storage
      await this.showToast('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      await this.showToast('Error saving notification settings', 'danger');
    }
  }

  async saveNotificationEvents() {
    try {
      // TODO: Implement saving notification events to backend/storage
      await this.showToast('Notification events saved successfully');
    } catch (error) {
      console.error('Error saving notification events:', error);
      await this.showToast('Error saving notification events', 'danger');
    }
  }

  async toggleGoogleCalendarConnection() {
    try {
      if (this.integrations.googleCalendar) {
        // TODO: Implement disconnect from Google Calendar
        this.integrations.googleCalendar = false;
        await this.showToast('Disconnected from Google Calendar');
      } else {
        // TODO: Implement Google Calendar OAuth flow
        this.integrations.googleCalendar = true;
        await this.showToast('Connected to Google Calendar');
      }
    } catch (error) {
      console.error('Error toggling Google Calendar connection:', error);
      await this.showToast('Error connecting to Google Calendar', 'danger');
    }
  }

  async toggleSlackConnection() {
    try {
      if (this.integrations.slackConnected) {
        // TODO: Implement disconnect from Slack
        this.integrations.slackConnected = false;
        this.integrations.slackWorkspaceUrl = '';
        await this.showToast('Disconnected from Slack');
      } else {
        if (!this.integrations.slackWorkspaceUrl) {
          await this.showToast('Please enter a Slack workspace URL', 'warning');
          return;
        }
        // TODO: Implement Slack OAuth flow
        this.integrations.slackConnected = true;
        await this.showToast('Connected to Slack');
      }
    } catch (error) {
      console.error('Error toggling Slack connection:', error);
      await this.showToast('Error connecting to Slack', 'danger');
    }
  }

  async toggleTeamsConnection() {
    try {
      if (this.integrations.teamsConnected) {
        // Implement disconnect from Teams
        this.integrations.teamsConnected = false;
        this.integrations.teamsWebhookUrl = '';
        await this.showToast('Disconnected from Microsoft Teams');
      } else {
        if (!this.integrations.teamsWebhookUrl) {
          await this.showToast('Please enter a Teams webhook URL', 'warning');
          return;
        }
        // Implement Teams webhook connection
        this.integrations.teamsConnected = true;
        await this.showToast('Connected to Microsoft Teams');
      }
    } catch (error) {
      console.error('Error toggling Teams connection:', error);
      await this.showToast('Error connecting to Microsoft Teams', 'danger');
    }
  }

  async toggleDiscordConnection() {
    try {
      if (this.integrations.discordConnected) {
        // Implement disconnect from Discord
        this.integrations.discordConnected = false;
        this.integrations.discordWebhookUrl = '';
        await this.showToast('Disconnected from Discord');
      } else {
        if (!this.integrations.discordWebhookUrl) {
          await this.showToast('Please enter a Discord webhook URL', 'warning');
          return;
        }
        // Implement Discord webhook connection
        this.integrations.discordConnected = true;
        await this.showToast('Connected to Discord');
      }
    } catch (error) {
      console.error('Error toggling Discord connection:', error);
      await this.showToast('Error connecting to Discord', 'danger');
    }
  }

  async toggleWhatsAppConnection() {
    try {
      if (this.integrations.whatsappConnected) {
        // Implement disconnect from WhatsApp
        this.integrations.whatsappConnected = false;
        this.integrations.whatsappAccountId = '';
        this.integrations.whatsappApiKey = '';
        await this.showToast('Disconnected from WhatsApp Business');
      } else {
        if (!this.integrations.whatsappAccountId || !this.integrations.whatsappApiKey) {
          await this.showToast('Please enter both Account ID and API Key', 'warning');
          return;
        }
        // Implement WhatsApp Business API connection
        this.integrations.whatsappConnected = true;
        await this.showToast('Connected to WhatsApp Business');
      }
    } catch (error) {
      console.error('Error toggling WhatsApp connection:', error);
      await this.showToast('Error connecting to WhatsApp Business', 'danger');
    }
  }

  async exportData(format: 'json' | 'excel') {
    try {
      // Collect all data to export
      const exportData = {
        companyInformation: {
          companyName: this.companyName,
          timeZone: this.timeZone
        },
        regionalSettings: {
          language: this.language,
          dateFormat: this.dateFormat,
          timeFormat: this.timeFormat
        },
        scheduleSettings: this.scheduleSettings,
        policySettings: this.policySettings,
        notificationSettings: this.notificationSettings,
        notificationEvents: this.notificationEvents,
        integrations: {
          ...this.integrations,
          // Remove sensitive information
          whatsappApiKey: undefined
        }
      };

      if (format === 'json') {
        // Create JSON file
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shiftsync-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        await this.showToast('Settings exported successfully as JSON');
      } else {
        // For Excel export, you would typically want to format the data appropriately
        // This is a simplified version - in a real app, you might want to use a library like xlsx
        const csvRows = [];
        
        // Convert the data to CSV format
        for (const [section, data] of Object.entries(exportData)) {
          csvRows.push([section.toUpperCase()]);
          for (const [key, value] of Object.entries(data)) {
            csvRows.push([key, JSON.stringify(value)]);
          }
          csvRows.push([]); // Empty row between sections
        }

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shiftsync-settings-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        await this.showToast('Settings exported successfully as CSV');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      await this.showToast('Error exporting settings', 'danger');
    }
  }

  async viewAllAuditLogs() {
    // TODO: Navigate to full audit logs page or open modal
    console.log('Viewing all audit logs');
    // This would typically navigate to a dedicated audit logs page
    // For now, we'll show a toast
    await this.showToast('Navigating to full audit logs view');
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}