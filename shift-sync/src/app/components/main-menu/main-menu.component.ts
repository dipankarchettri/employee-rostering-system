import { Component } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class MainMenuComponent {
  constructor(private menuCtrl: MenuController) {}

  closeMenu() {
    this.menuCtrl.close('main-menu');
  }
}