import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ResolutionsStoreService } from '../../services/resolutions-store.service';
import { Resolution, ActionPayload } from '../../models/alert.model';

@Component({
  selector: 'app-resolution-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resolution-management.component.html',
  styleUrls: ['./resolution-management.component.css']
})
export class ResolutionManagementComponent implements OnInit, OnDestroy {

  resolutions: Resolution[] = [];
  searchQuery = '';
  expandedRows = new Set<number | string>();

  private subscriptions = new Subscription();

  constructor(private resolutionsStore: ResolutionsStoreService) {}

  ngOnInit(): void {
    this.resolutionsStore.fetchResolutions();

    this.subscriptions.add(
      this.resolutionsStore.resolutions$.subscribe(data => {
        this.resolutions = data;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // --- Computed-style getters (mirrors Vue computed) ---

  get filteredResolutions(): Resolution[] {
    if (!this.searchQuery.trim()) {
      return this.resolutions;
    }
    const query = this.searchQuery.toLowerCase();
    return this.resolutions.filter(r =>
      (r.issueType || '').toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query) ||
      (r.actionType || '').toLowerCase().includes(query)
    );
  }

  get activeCount(): number {
    return this.resolutions.filter(r =>
      this.getResolutionStatus(r.status) === 'active'
    ).length;
  }

  get inactiveCount(): number {
    return this.resolutions.filter(r =>
      this.getResolutionStatus(r.status) === 'inactive'
    ).length;
  }

  // --- Helpers (mirrors Vue helper functions) ---

  getResolutionStatus(status: string): string {
    if (!status) return 'inactive';
    return status.toLowerCase() === 'active' ? 'active' : 'inactive';
  }

  truncateText(text: string | undefined, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  formatText(text: string | undefined): string {
    if (!text) return '';
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isTextTruncated(text: string | undefined, maxLength: number): boolean {
    return !!(text && text.length > maxLength);
  }

  // --- Steps expand/collapse (mirrors Vue toggleSteps/isExpanded) ---

  toggleSteps(resolutionId: number | string): void {
    if (this.expandedRows.has(resolutionId)) {
      this.expandedRows.delete(resolutionId);
    } else {
      this.expandedRows.add(resolutionId);
    }
  }

  isExpanded(resolutionId: number | string): boolean {
    return this.expandedRows.has(resolutionId);
  }

  getStepsCount(steps: string[] | undefined): number {
    return steps ? steps.length : 0;
  }

  getStepsPreview(steps: string[] | undefined): string {
    if (!steps || steps.length === 0) return 'No steps available';
    const first = steps[0];
    return first.substring(0, 50) + (first.length > 50 ? '...' : '');
  }
}
