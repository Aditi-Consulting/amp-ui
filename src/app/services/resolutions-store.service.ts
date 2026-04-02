import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Resolution } from '../models/alert.model';
import { ResolutionsApiService } from './resolutions-api.service';

@Injectable({
  providedIn: 'root'
})
export class ResolutionsStoreService {

  // --- State (mirrors Pinia resolutions store) ---
  private resolutionsSubject = new BehaviorSubject<Resolution[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // --- Public Observables ---
  resolutions$ = this.resolutionsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private resolutionsApi: ResolutionsApiService) {}

  /** Fetch resolutions from API and update store — mirrors Pinia fetchResolutions() */
  fetchResolutions(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.resolutionsApi.getResolutions().subscribe({
      next: (data) => {
        this.resolutionsSubject.next(data);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        this.errorSubject.next(err.message || 'Failed to fetch resolutions');
        console.error('Error fetching resolutions:', err);
        this.loadingSubject.next(false);
      }
    });
  }

  /** Get current resolutions snapshot */
  get resolutions(): Resolution[] {
    return this.resolutionsSubject.getValue();
  }
}
