import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class DashboardPage implements OnInit {
  // ... your existing component code

  quickActions = [
    { label: 'Add Employee', icon: 'person-add', link: '/employees/add' },
    { label: 'Create Shift', icon: 'add-circle', link: '/shifts/create' },
    { label: 'Generate Roster', icon: 'calendar', link: '/rosters/generate' },
    { label: 'View Reports', icon: 'document-text', link: '/reports' }
  ];

  constructor(private menuCtrl: MenuController) {}

  ngOnInit() {
    // Enable the side menu when dashboard loads
    this.menuCtrl.enable(true, 'main-menu');
  }

  // Optional: Toggle menu programmatically
  toggleMenu() {
    this.menuCtrl.toggle('main-menu');
  }
}