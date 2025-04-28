import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

// Utility function to get CSRF token from cookies
function getCSRFToken(): string | null {
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, HttpClientModule] // Add HttpClientModule here
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private menu: MenuController,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      console.log('Logging in with:', email, password, rememberMe);
  
      const body = {
        email: email,
        password: password
      };
  
      const csrfToken = getCSRFToken();
  
      if (csrfToken) {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        });
  
        this.http.post<any>('http://localhost:8000/api/login/', body, {
          withCredentials: true,
          headers: headers
        })
        .subscribe({
          next: (response) => {
            console.log('Login successful', response);
  
            // Store company_id
            if (response.company_id) {
              if (rememberMe) {
                localStorage.setItem('company_id', response.company_id);
              } else {
                sessionStorage.setItem('company_id', response.company_id);
              }
            }
  
            this.showToast('Login successful!', 'success');
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Login failed', error);
            this.showToast('Login failed. Please check your credentials.', 'danger');
          }
        });
      } else {
        this.showToast('CSRF token missing. Please try again.', 'danger');
      }
    } else {
      this.showToast('Please fill out the form correctly.', 'danger');
    }
  }
}
