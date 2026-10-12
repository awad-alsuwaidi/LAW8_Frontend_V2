import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ToastrNotifiService, LanguageService } from 'src/app/@core/services';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private _http = inject(HttpClient);
  private _toastrNotifiService = inject(ToastrNotifiService);
  private _languageService = inject(LanguageService);


  downloadFileFromPath(path: string, name: string) {
    if (!path) {
      console.warn('FileService: No path provided');
      return;
    }

    this._http
      .get(path, {
        responseType: 'blob',
        withCredentials: false,
      })
      .subscribe({
        next: (blob) => {
          this.triggerDownload(blob, name);
        },
        error: (err: HttpErrorResponse) => {
          console.error('FileService: Download from path error:', err);
        },
      });
  }

  downloadDocument(id: number | string) {
    const url = `${environment.baseUrl}/api/${API_Config.matterDocuments.download}/${id}`;
    return this._http
      .get(url, {
        responseType: 'blob',
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            this._toastrNotifiService.displayError(
              this._languageService.getTransValue('common.fileDownloadError')
            );
          }
          return throwError(() => error);
        }),
      );
  }

  downloadDocumentTAsk(id: number | string) {
    if (!id) {
      throw new Error('FileService: No document ID provided');
    }
    const url = `${environment.baseUrl}/api/${API_Config.matterTask.download}/${id}`;
    return this._http.get(url, {
      responseType: 'blob',
      observe: 'response',
      withCredentials: true,
    });
  }

  downloadDocumentPredefiendTask(id: number | string) {
    const url = `${environment.baseUrl}/api/${API_Config.predefinedTasks.download}/${id}`;

    return this._http.get(url, {
      responseType: 'blob',
      observe: 'response',
      withCredentials: true,
    });
  }

  previewFileFromPath(path: string) {
    if (!path) {
      console.warn('FileService: No path provided for preview');
      return;
    }
    window.open(path, '_blank');
  }

  downloadFile(file: File) {
    if (!file) {
      console.warn('FileService: No file provided');
      return;
    }

    const url = URL.createObjectURL(file);
    this.triggerDownload(url, file.name);
  }

  private triggerDownload(blob: Blob | string, fileName: string) {
    if (!fileName) {
      fileName = 'download';
    }

    const url = typeof blob === 'string' ? blob : URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);

    if (typeof blob !== 'string') {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    }
  }

  previewFile(file: File) {
    if (!file) {
      console.warn('FileService: No file provided for preview');
      return;
    }
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  }

  getFileSizeInMB(file: File): number {
    if (!file) return 0;
    return Math.round((file.size / 1024 / 1024) * 100) / 100;
  }

  isValidFileType(file: File, allowedTypes: string[]): boolean {
    if (!file) return false;
    return allowedTypes.some((type) => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
  }



  isValidFileSize(file: File, maxSizeInMB: number): boolean {
    if (!file) return false;
    const fileSizeInMB = this.getFileSizeInMB(file);
    return fileSizeInMB <= maxSizeInMB;
  }
}
