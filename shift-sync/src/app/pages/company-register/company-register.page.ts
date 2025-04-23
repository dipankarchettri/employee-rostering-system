import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-company-register',
  templateUrl: './company-register.page.html',
  styleUrls: ['./company-register.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class CompanyRegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    this.registerForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(3)]],
      industry: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.menuCtrl.enable(false); // Disable menu when page loads
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true); // Re-enable menu when leaving page
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('adminPassword')?.value === form.get('confirmPassword')?.value 
      ? null 
      : { mismatch: true };
  }

  registerCompany() {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      console.log('Registering company:', this.registerForm.value);
      
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/company-select']);
      }, 1500);
    }
  }
}