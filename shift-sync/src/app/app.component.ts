import { Component } from '@angular/core';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonicModule,
    MainMenuComponent
  ],
  template: `
    <app-main-menu></app-main-menu>
    <ion-router-outlet></ion-router-outlet>
  `
})
export class AppComponent {}
