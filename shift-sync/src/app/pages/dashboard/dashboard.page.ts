import { Component } from '@angular/core';
import { MenuController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MainMenuComponent]
})
export class DashboardPage {
  constructor(private menuCtrl: MenuController) {}

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'main-menu');
  }
}