import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VisitorCardServiceService } from '../Services/visitor-card-service.service';


@Component({
  selector: 'app-preview-dialog-component',
  templateUrl: './preview-dialog-component.component.html',
  styleUrls: ['./preview-dialog-component.component.css']
})
export class PreviewDialogComponentComponent {
  public photo: string | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PreviewDialogComponentComponent>,
    public vservice: VisitorCardServiceService
  ) { }

  ngOnInit(): void {
    this.photo = this.vservice.photo;
  }

  printPreview(): void {
    window.print();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
