import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor(private router: Router, private alertCtrl: AlertController) {}

  // Mock login function
  async login(credentials: {email: string, password: string}) {
    this.isAuthenticated = true;
    return true;
  }

  // Mock logout function
  async logout() {
    this.isAuthenticated = false;
    this.router.navigateByUrl('/login');
    return true;
  }

  // Check auth status
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}