import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RostersPage } from './rosters.page';

describe('RostersPage', () => {
  let component: RostersPage;
  let fixture: ComponentFixture<RostersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RostersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
