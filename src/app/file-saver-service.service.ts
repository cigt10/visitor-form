import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileSaverServiceService {

  constructor() { }

  saveImage(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
