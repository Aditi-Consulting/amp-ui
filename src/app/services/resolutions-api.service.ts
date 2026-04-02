import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Resolution } from '../models/alert.model';

function getApiBaseUrl(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3002/api/v1';
  }
  return `${protocol}//${hostname}:3002/api/v1`;
}

@Injectable({
  providedIn: 'root'
})
export class ResolutionsApiService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = getApiBaseUrl();
  }

  /** Fetch all resolutions from backend — mirrors Vue apiClient.get('/resolutions') */
  getResolutions(): Observable<Resolution[]> {
    return this.http.get<Resolution[]>(`${this.baseUrl}/resolutions`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Resolutions API error:', error.status, error.message);
    return throwError(() => ({
      status: error.status || 0,
      message: error.error?.message || error.message || 'An error occurred',
      data: error.error
    }));
  }
}
