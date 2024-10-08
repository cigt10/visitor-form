import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VisitorCardServiceService {
  public name: string | undefined;
  public licNo: string | undefined;
  public mobile: string | undefined;
  public meetTo: string | undefined;
  public department: string | undefined;
  public purposeGroup: string | undefined;
  public purposeRemark: string | undefined;
  public timeIn: string | undefined;
  public timeOut: string | undefined;
  public otherRemark: string | undefined;
  public visitCard: string | undefined;
  public photo: string | undefined;

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:3000/api/visitors'; // Ensure this matches your server.js endpoint


  getVisitors(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAllVisitors(deptName: any, startDateIn: any, endDateIn: any): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/allvisitors?deptName=${deptName}&startDate=${startDateIn}&endDate=${endDateIn}`);
  }

  getVisitor(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<any>(`getVisitor id=${id}`))
    );
  }

  getPaginatedVisitors(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/visitors?page=${page}&limit=${limit}`);
  }

  searchVisitorsByDateRange(startDate: string, endDate: string): Observable<{ visitors: any[] }> {
    return this.http.get<{ visitors: any[] }>(`${this.apiUrl}/byDateRange`, {
        params: {
            startDate: startDate,
            endDate: endDate
        }
    });
}

  

  updateVisitor(id: string, visitor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, visitor).pipe(
      catchError(this.handleError<any>('updateVisitor'))
    );
  }

  deleteVisitor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<any>('deleteVisitor'))
    );
  }

  addVisitor(visitor: any): Observable<any> {
    return this.http.post(this.apiUrl, visitor).pipe(
      catchError(this.handleError<any>('addVisitor'))
    );
  }

  searchVisitors(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${query}`).pipe(
      catchError(this.handleError<any[]>('searchVisitors', []))
    );
  }

  saveImage(image: string): Observable<any> {
    const formData = new FormData();
    const blob = this.dataURItoBlob(image);
    formData.append('photo', blob, 'photo.png');
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }


  setVisitorData(data: any) {
    this.name = data.name;
    this.licNo = data.licNo;
    this.mobile = data.mobile;
    this.meetTo = data.meetTo;
    this.department = data.department;
    this.purposeGroup = data.purposeGroup;
    this.purposeRemark = data.purposeRemark;
    this.timeIn = data.timeIn;
    this.timeOut = data.timeOut;
    this.otherRemark = data.otherRemark;
    this.visitCard = data.visitCard;
    this.photo = data.photo;
  }
}
