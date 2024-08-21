/*import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam'; // Import Webcam related classes
import { Subject } from 'rxjs'; // Import Subject from RxJS
import {VisitorCardServiceService} from '../Services/visitor-card-service.service'

@Component({
  selector: 'app-visitor-form',
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.css']
})
export class VisitorFormComponent implements OnInit {
  public name:string | undefined;
  public licno:string  | undefined;
  public mobile:string  | undefined;
  public meetTo:string  | undefined;
  public department:string | undefined;
  public purposeremark:string  | undefined;
  public purposegroup:string  | undefined;
  public timein:string  | undefined;
  public timeout:string  | undefined;
  public otherremark:string  | undefined;
  public visitcard:string  | undefined;
  


[x: string]: any;
  public photo: string | undefined;
  public triggerObservable: Subject<void> = new Subject<void>(); // Initialize Subject
FIRST: any;
public service : VisitorCardServiceService| undefined;

// dependancy Injection in angular
  constructor( public vservice: VisitorCardServiceService ) { 

    this.service= vservice;
  }

  ngOnInit(): void {
    
    
    // Initialize webcam
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        if (mediaDevices && mediaDevices.length) {
          this.triggerObservable.next();
        }
      });
  }
  capturePhoto(): void {
    this.triggerObservable.next();
  }

  handleImageCapture(webcamImage: WebcamImage): void {
    this.photo = webcamImage.imageAsDataUrl;
  }

  // Handle webcam errors
  webcamError(error: WebcamInitError): void {
    console.error('Error initializing webcam: ', error);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const formData = form.value; // Assuming form.value contains all the provided data
      this.vservice.setVisitorData(formData);
    }
  }
  currentPage: number = 1;
  totalPages: number = 2; // Total number of pages in the form

  nextPage() {
    // load forms value from first page
    this.vservice.name= this.name;
    this.vservice.licNo= this.licno;
    this.vservice.mobile= this.mobile;
    this.vservice.meetTo= this.meetTo;
    this.vservice.department= this.department;
    this.vservice.purposeRemark= this.purposeremark;
    this.vservice.purposeGroup= this.purposegroup;
    this.vservice.timeIn= this.timein;
    this.vservice.timeOut= this.timeout;
    this.vservice.otherRemark= this.otherremark;
    this.vservice.visitCard= this.visitcard;
    this.vservice.photo= this.photo;

    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.name= this.vservice.name;
    }
  }
  printForm() {
    window.print();
  }
}*/

import { Component, OnInit, HostListener,ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { filter, Subject } from 'rxjs';
import { VisitorCardServiceService } from '../Services/visitor-card-service.service';
import { MatDialog } from '@angular/material/dialog';
import { PreviewDialogComponentComponent } from '../preview-dialog-component/preview-dialog-component.component';
import * as ExcelJS from 'exceljs';  // Import the ExcelJS library
import { saveAs } from 'file-saver'; // Import the file-saver library to save the file

@Component({
  selector: 'app-visitor-form',
  templateUrl: './visitor-form.component.html',
  styleUrls: ['./visitor-form.component.css']
})
export class VisitorFormComponent implements OnInit {
  public name:string | undefined;
  public licno:string  | undefined;
  public mobile:string  | undefined;
  public meetTo:string  | undefined;
  public department:string | undefined;
  public purposeremark:string  | undefined;
  public purposegroup:string  | undefined;
  public timein:string  | undefined;
  public timeout:string  | undefined;
  public otherremark:string  | undefined;
  public visitcard:string  | undefined;
  public visitors: any[] = [];
  public allvisitors: any[] = [];
  public filteredVisitors: any[] = [];
  public searchQuery: string = '';
  public searchtext: string = '';
  visitorData: any[] = [];
  startDate: any;
  endDate: any;
  searchTimeIn: string = ''; 
  searchTimeOut: string = '';
 // allVisitors: any[] = [];
  @ViewChild('visitorListContainer') visitorListContainer!: ElementRef;
  public currentPage: number = 1;
  public totalPages: number = 1;
  public itemsPerPage: number = 5;
  public loading: boolean = false;
  imageUrl:any;
  public deptName:any;
  public startDateIn:any;
  public endDateIn:any;
  public selectedVisitor: any =this.initializeVisitor();
  public paginationPages: number[] = [];
  initializeVisitor() {
    return {
      name: '',
      licNo: '',
      mobile: '',
      meetTo: '',
      department: '',
      purposeRemark: '',
      purposeGroup: '',
      timeIn: '',
      timeOut: '',
      otherRemark: '',
      visitCard: '',
      photo: ''
    };
  }

  public triggerObservable: Subject<void> = new Subject<void>();
photo: any;

  constructor(public vservice: VisitorCardServiceService, 
    public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadVisitors();
    this.filteredVisitors = this.visitors;
    this.loadAllVisitors();
    
  }

  getVisitors(): void {
    this.vservice.getVisitors().subscribe(data => {
      this.visitors = data;
      this.filteredVisitors = data;
    }, error => {
      console.error('Error fetching visitors', error);
    });
  }

  searchd(): void {
    const query = this.searchtext.toLowerCase();
    // console.log(this.filteredVisitors);
    // console.log(query);
    // console.log(this.visitors);
    // console.log(filter);
    this.filteredVisitors = this.visitors.filter(visitor => 
      visitor.name.toLowerCase().includes(query),
      this.visitors = this.filteredVisitors
    );
     console.log(this.filteredVisitors);
    // console.log(query.length);

    if (query.length === 0) {
      this.loadVisitors(); 
    }
  }

  searchByTime() {
    const startDateInput = (document.getElementById('startDate') as HTMLInputElement).value;
    const endDateInput = (document.getElementById('endDate') as HTMLInputElement).value;

    const formattedStartDate = this.formatDateToISO(startDateInput);
    const formattedEndDate = this.formatDateToISO(endDateInput);

    this.vservice.searchVisitorsByDateRange(formattedStartDate, formattedEndDate).subscribe(
      (data) => {
        this.visitors = data.visitors;
        // console.log(data.visitors);
        // console.log('Visitors found:', data);
        // Handle the data (e.g., display it in your component)
      },
      (error) => {
        console.error('Error searching visitors by time:', error);
      }
    );
  }

  formatDateToISO(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString();
  }
  formatToDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString(); // This will format the date as per the locale
  }
  
  // searchByTime(): void {
  //   const startDate = new Date(this.searchTimeIn).toISOString();
  //   const endDate = new Date(this.searchTimeOut).toISOString();
    
  //   this.vservice.searchVisitorsByDateRange(startDate, endDate).subscribe(
  //     (data: any[]) => {
  //       if (data.length > 0) {
  //         this.filteredVisitors = data;
  //       } else {
  //         this.clearForm();
  //         console.log('No visitors found in this time range.');
  //       }
  //     },
  //     error => {
  //       console.error('Error searching visitors by time', error);
  //     }
  //   );
  // }     

  
  
  // search(): void {
  //   if (this.searchQuery) {
  //     this.vservice.searchVisitors(this.searchQuery).subscribe(
  //       (data: any[]) => {
  //         if (data.length > 0) {
  //           this.selectedVisitor = data[0];
  //           console.log(this.selectedVisitor)
  //         } else {
  //           this.clearForm();
  //         }
  //       },
  //       error => {
  //         console.error('Error searching visitors', error);
  //       }
  //     );
  //   } else {
  //     this.clearForm();
  //   }
  // }

  search(): void {
    if (this.searchQuery) {
      this.vservice.searchVisitors(this.searchQuery).subscribe(
        (data: any[]) => {
          if (data.length > 0) {
            this.selectedVisitor = data[0];
            // Format the timeIn and timeOut fields for the datetime-local input
            if (this.selectedVisitor.timeIn) {
              this.selectedVisitor.timeIn = this.formatDateForInput(this.selectedVisitor.timeIn);
            }
            if (this.selectedVisitor.timeOut) {
              this.selectedVisitor.timeOut = this.formatDateForInput(this.selectedVisitor.timeOut);
            }
            console.log(this.selectedVisitor);
          } else {
            this.clearForm();
          }
        },
        error => {
          console.error('Error searching visitors', error);
        }
      );
    } else {
      this.clearForm();
    }
  }
  
  // Helper method to format date
  formatDateForInput(isoString: string): string {
    const date = new Date(isoString);
    // Returns 'yyyy-MM-ddThh:mm'
    return date.toISOString().slice(0, 16);
  }
  

  loadVisitors(): void {
    this.loading = true;
    this.vservice.getPaginatedVisitors(this.currentPage - 1, this.itemsPerPage).subscribe(
      data => {
        this.visitors = data.visitors;
        this.totalPages = Math.ceil(data.total / this.itemsPerPage);
        // this.updatePaginationPages();
        this.loading = false;
      },
      error => {
        console.error('Error fetching visitors', error);
        this.loading = false;
        // Display error message to the user
        alert('Failed to load visitors. Please try again later.');
      }
    );
  }

  loadAllVisitors(): any[] {
    this.loading = true;
    // this.vservice.getAllVisitors(this.deptName, this.startDate, this.endDate ).subscribe(
      this.vservice.getAllVisitors(this.deptName, this.startDate, this.endDate ).subscribe(

      data => {
        this.allvisitors = data.visitors;
        console.log(this.allvisitors);
        // this.updatePaginationPages();
        
      },
      error => {
        console.error('Error fetching visitors', error);
        
        // Display error message to the user
        alert('Failed to load visitors. Please try again later.');
      }
    );
    
    return this.allvisitors;
  }

  getPageNumbers(): number[] {
    const maxPagesToShow = 3;
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    return pages;
  }

  setPage(page: number): void {
    this.currentPage = page;
    this.loadVisitors();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVisitors();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVisitors();
    }
  }


   getVisitor(id: string): void {
     this.vservice.getVisitor(id).subscribe(data => {
       this.selectedVisitor = data;
     }, error => {
      console.error('Error fetching visitor', error);
    });
   }

  // getVisitor(id: string): void {
  //   this.vservice.getVisitor(id).subscribe(
  //     data => {
  //       // Convert the timeIn and timeOut to the required format
  //       this.selectedVisitor = data;

  //       console.log(this.selectedVisitor);
  //       if (this.selectedVisitor.timeIn) {
  //         this.selectedVisitor.timeIn = this.formatDateForInput(this.selectedVisitor.timeIn);
  //       }
  //       if (this.selectedVisitor.timeOut) {
  //         this.selectedVisitor.timeOut = this.formatDateForInput(this.selectedVisitor.timeOut);
  //       }
  //     },
  //     error => {
  //       console.error('Error fetching visitor', error);
  //     }
  //   );
  // }
  
  // // Helper method to format date
  // formatDateForInput(isoString: string): string {
  //   const date = new Date(isoString);
  //   // Returns 'yyyy-MM-ddThh:mm'
  //   return date.toISOString().slice(0, 16);
  // }
  
  
  

  updateVisitor(): void {
    if (this.selectedVisitor.id) {
      this.vservice.updateVisitor(this.selectedVisitor.id, this.selectedVisitor).subscribe(() => {
        this.getVisitors();
      }, error => {
        console.error('Error updating visitor', error);
      });
    } else {
      this.vservice.addVisitor(this.selectedVisitor).subscribe(() => {
        this.getVisitors();
      }, error => {
        console.error('Error adding visitor', error);
      });
    }
  }

  deleteVisitor(id: string): void {
    this.vservice.deleteVisitor(id).subscribe(() => {
      this.getVisitors();
    }, error => {
      console.error('Error deleting visitor', error);
    });
  }

  clearForm(): void {
    this.selectedVisitor = {
      name: '',
      licNo: '',
      mobile: '',
      meetTo: '',
      department: '',
      purposeRemark: '',
      purposeGroup: '',
      timein: '',
      timeout: '',
      otherRemark: '',
      visitCard: '',
      photo: '',
      created_date: '',
      updated_date: ''
    };
  }

  // onSubmit(form: NgForm): void {
  //   if (form.valid) {
  //     const visitorData = { ...form.value, photo: this.selectedVisitor.photo };
  //     // this.vservice.saveImage(this.imageUrl).subscribe(
  //     //   response => {

  //     //     visitorData.photo=response.imageName;
  //     //     this.vservice.addVisitor(visitorData).subscribe(
  //     //       response => {
  //     //         console.log('Visitor added', JSON.stringify(response));
  //     //         this.getVisitors(); // Refresh visitor list after adding
  //     //       },
  //     //       error => {
  //     //         console.error('Error adding visitor', error);
  //     //       }
  //     //     );

  //     //     console.log('image added', JSON.stringify(response.imageName));
  //     //     this.getVisitors(); // Refresh visitor list after adding
  //     //   },
  //     //   error => {
  //     //     console.error('Error adding visitor', error);
  //     //   }
      

          
  //         this.vservice.addVisitor(visitorData).subscribe(
  //           response => {
  //             console.log('Visitor added', JSON.stringify(response));
  //             this.getVisitors(); // Refresh visitor list after adding
  //           },
  //           error => {
  //             console.error('Error adding visitor', error);
  //           }
  //         );

          
       
      
  //   }else {
  //     // Show validation errors
  //     form.control.markAllAsTouched();
  //   }
  //    /* this.vservice.addVisitor(visitorData).subscribe(
  //       response => {
  //         console.log('Visitor added', JSON.stringify(response));
  //         this.getVisitors(); // Refresh visitor list after adding
  //       },
  //       error => {
  //         console.error('Error adding visitor', error);
  //       }
  //     );
  //   }*/
  // }

   onSubmit(form: NgForm): void {
     if (form.valid) {
      const visitorData = { ...form.value };
       this.vservice.saveImage(this.imageUrl).subscribe(
         response => {
           visitorData.photo = response.imagePath; // Use imagePath instead of imageName
         this.vservice.addVisitor(visitorData).subscribe(
           response => {
               console.log('Visitor added', JSON.stringify(response));
              this.loadVisitors(); // Refresh visitor list after adding
            this.clearForm();
            },
            error => {
              console.error('Error adding visitor', error);
             }
          );
           console.log('Image added', JSON.stringify(response.imagePath));
         },
         error => {
         console.error('Error uploading image', error);
        }
      );
    } else {
   // Show validation errors
      form.control.markAllAsTouched();
    }
  }

  // onVisitorSelect(visitor: any, event: any) {
  //   if (event.target.checked) {
  //     this.selectedVisitor = { ...visitor };  // Clone the selected visitor data
  //   } else {
  //     this.selectedVisitor = {};  // Reset the form if unchecked
  //   }
  // }

  onVisitorSelect(visitor: any, event: any) {
    if (event.target.checked) {
        this.selectedVisitor = { ...visitor };  // Clone the selected visitor data

        // Format the timeIn and timeOut to match the datetime-local input format
        if (this.selectedVisitor.timeIn) {
            this.selectedVisitor.timeIn = this.formatDateForInput(this.selectedVisitor.timeIn);
        }
        if (this.selectedVisitor.timeOut) {
            this.selectedVisitor.timeOut = this.formatDateForInput(this.selectedVisitor.timeOut);
        }
    } else {
        this.selectedVisitor = {};  // Reset the form if unchecked
    }
}




  // onSubmit(form: NgForm): void {
  //   if (form.valid) {
  //     const visitorData = { ...form.value,
  //       timeIn: new Date(form.value.timeIn).toISOString(),
  //       timeOut: new Date(form.value.timeOut).toISOString() };
  //     this.vservice.saveImage(this.imageUrl).subscribe(
  //       response => {
  //         visitorData.photo = response.imagePath; // Use imagePath instead of imageName
  //         // Add visitorData without updating the existing visitor's ID
  //         this.vservice.addVisitor(visitorData).subscribe(
  //           response => {
  //             console.log('Visitor added', JSON.stringify(response));
  //             this.loadVisitors(); // Refresh visitor list after adding
  //             this.clearForm();
  //           },
  //           error => {
  //             console.error('Error adding visitor', error);
  //           }
  //         );
  //         console.log('Image added', JSON.stringify(response.imagePath));
  //       },
  //       error => {
  //         console.error('Error uploading image', error);
  //       }
  //     );
  //   } else {
  //     // Show validation errors
  //     form.control.markAllAsTouched();
  //   }
  // }
  

  onPhotoChange(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedVisitor.photo = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  capturePhoto(): void {
    this.triggerObservable.next();
  }

  handleImageCapture(webcamImage: WebcamImage): void {
    this.selectedVisitor.photo = webcamImage.imageAsDataUrl;
    this.imageUrl=webcamImage.imageAsDataUrl
    console.log(this.imageUrl);
  }

  webcamError(error: WebcamInitError): void {
    console.error('Error initializing webcam: ', error);
  }

  cancel() {
    this.clearForm();
  }

  openPreviewDialog(): void {
    const dialogRef = this.dialog.open(PreviewDialogComponentComponent, {
      width: '325px',
      data: {
        name: this.selectedVisitor.name,
        licNo: this.selectedVisitor.licNo,
        mobile: this.selectedVisitor.mobile,
        meetTo: this.selectedVisitor.meetTo,
        department: this.selectedVisitor.department,
        purposeGroup: this.selectedVisitor.purposeGroup,
        purposeRemark: this.selectedVisitor.purposeRemark,
        timeIn: this.selectedVisitor.timein,
        timeOut: this.selectedVisitor.timeout,
        otherRemark: this.selectedVisitor.otherRemark,
        visitCard: this.selectedVisitor.visitCard,
        photo: this.selectedVisitor.photo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Visitors Data');

    // Add column headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'License Number', key: 'licNo', width: 20 },
      { header: 'Mobile', key: 'mobile', width: 20 },
      { header: 'Meet To', key: 'meetTo', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Purpose Remark', key: 'purposeRemark', width: 20 },
      { header: 'Purpose Group', key: 'purposeGroup', width: 20 },
      { header: 'Time In', key: 'timein', width: 20 },
      { header: 'Time Out', key: 'timeout', width: 20 },
      { header: 'Other Remark', key: 'otherRemark', width: 20 },
      { header: 'Visit Card', key: 'visitCard', width: 20 },
      { header: 'Created Date', key: 'created_date', width: 20 },
      { header: 'Updated Date', key: 'updated_date', width: 20 },
      { header: 'photo', key: 'photo', width: 20 }
    ];
    // var res = this.loadAllVisitors();
    var res = this.visitors;

    // Add data rows
console.log(res);
Array.from(res).forEach(visitor => {
  console.log(visitor.name);
      worksheet.addRow({
        name: visitor.name,
        licNo: visitor.licNo,
        mobile: visitor.mobile,
        meetTo: visitor.meetTo,
        department: visitor.department,
        purposeRemark: visitor.purposeRemark,
        purposeGroup: visitor.purposeGroup,
        timein: visitor.timeIn,
        timeout: visitor.timeOut,
        otherRemark: visitor.otherRemark,
        visitCard: visitor.visitCard,
        created_date: visitor.created_date,
        updated_date: visitor.updated_date,
        photo: visitor.photo
      });
    });

    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'visitors-data.xlsx');
    });
  }
}


