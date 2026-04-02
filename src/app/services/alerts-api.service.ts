import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Alert } from '../models/alert.model';

/**
 * Determines the API base URL based on the current hostname.
 * This enables hybrid deployment where:
 * - VM access (localhost): Uses localhost:3002 for API
 * - External access (e.g., 10.2.5.11): Uses same IP with port 3002 for API
 */
function getApiBaseUrl(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // If running locally in VM (localhost or 127.0.0.1)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3002/api/v1';
  }

  // If accessing from external IP, use the same IP for API
  return `${protocol}//${hostname}:3002/api/v1`;
}

@Injectable({
  providedIn: 'root'
})
export class AlertsApiService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = getApiBaseUrl();
    console.log('[API Config] Base URL:', this.baseUrl);
  }

  /** Fetch all alerts from backend */
  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/alerts`).pipe(
      catchError(this.handleError)
    );
  }

  /** Get a single alert by ID */
  getAlertById(id: string): Observable<Alert> {
    return this.http.get<Alert>(`${this.baseUrl}/alerts/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /** Get task agent progress for an alert */
  getTaskAgentProgress(alertId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/task-agent/${alertId}`).pipe(
      catchError(this.handleError)
    );
  }

  /** PATCH confidence score for a task agent record */
  updateConfidenceScore(taskAgentId: string, confidenceScore: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/task-agent/${taskAgentId}/confidence-score`, { confidenceScore }).pipe(
      catchError(this.handleError)
    );
  }

  /** Get a single resolution by ID */
  getResolutionById(resolutionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/resolutions/${resolutionId}`).pipe(
      catchError(this.handleError)
    );
  }

  /** PATCH resolution action steps */
  updateResolutionSteps(resolutionId: string, steps: string[]): Observable<any> {
    return this.http.patch(`${this.baseUrl}/resolutions/${resolutionId}/action-steps`, { steps }).pipe(
      catchError(this.handleError)
    );
  }

  /** Approve a tool execution */
  approveToolExecution(alertId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/alerts/${alertId}/approve`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** Reject a tool execution */
  rejectToolExecution(alertId: string, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/alerts/${alertId}/reject`, { reason }).pipe(
      catchError(this.handleError)
    );
  }

  /** Centralized error handler matching Vue.js interceptor logic */
  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('Request error:', error.error.message);
    } else if (error.status) {
      // Server responded with error status
      switch (error.status) {
        case 401:
          console.error('Unauthorized access - Please login again');
          break;
        case 403:
          console.error('Access forbidden - Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error(`API Error: ${error.status}`);
      }
    } else {
      console.error('No response from server - Network error');
    }

    return throwError(() => ({
      status: error.status || 0,
      message: error.error?.message || error.message || 'An error occurred',
      data: error.error
    }));
  }
}
