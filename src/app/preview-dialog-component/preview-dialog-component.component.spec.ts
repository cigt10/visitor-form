import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDialogComponentComponent } from './preview-dialog-component.component';

describe('PreviewDialogComponentComponent', () => {
  let component: PreviewDialogComponentComponent;
  let fixture: ComponentFixture<PreviewDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviewDialogComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
