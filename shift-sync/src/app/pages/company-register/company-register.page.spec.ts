import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyRegisterPage } from './company-register.page';

describe('CompanyRegisterPage', () => {
  let component: CompanyRegisterPage;
  let fixture: ComponentFixture<CompanyRegisterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
