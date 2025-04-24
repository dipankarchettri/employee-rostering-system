import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-company-register',
  templateUrl: './company-register.page.html',
  styleUrls: ['./company-register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class CompanyRegisterPage implements OnInit, OnDestroy {
  registerForm: FormGroup;
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
    this.menuCtrl.enable(false);
  }

  ngOnDestroy() {
    this.menuCtrl.enable(true);
  }

  // ... rest of your methods

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('adminPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  registerCompany() {
    if (this.registerForm.valid) {
      // Implement registration logic
      console.log('Form submitted', this.registerForm.value);
      this.router.navigate(['/dashboard']);
    }
  }
}