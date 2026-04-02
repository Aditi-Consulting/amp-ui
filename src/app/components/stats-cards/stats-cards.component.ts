import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertsStoreService } from '../../services/alerts-store.service';
import { StatusCounts, Alert } from '../../models/alert.model';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css']
})
export class StatsCardsComponent implements OnInit, OnDestroy {
  @Input() mode: 'dashboard' | 'analytics' = 'dashboard';

  statusCounts: StatusCounts = {
    all: 0,
    pending_approval: 0,
    in_progress: 0,
    resolved: 0,
    failed: 0
  };

  // Analytics-specific stats
  uniqueSourcesCount = 0;
  uniqueAgentsCount = 0;
  resolutionRate = 0;
  resolutionLabel = '0 of 0 alerts resolved';
  sourceList: string[] = [];
  agentList: string[] = [];

  private subscription = new Subscription();

  constructor(private alertsStore: AlertsStoreService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.alertsStore.statusCounts$.subscribe(counts => {
        this.statusCounts = counts;
      })
    );

    if (this.mode === 'analytics') {
      this.subscription.add(
        this.alertsStore.alerts$.subscribe(alerts => {
          this.computeAnalyticsStats(alerts);
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private computeAnalyticsStats(alerts: Alert[]): void {
    if (!alerts.length) {
      this.uniqueSourcesCount = 0;
      this.uniqueAgentsCount = 0;
      this.resolutionRate = 0;
      this.resolutionLabel = '0 of 0 alerts resolved';
      this.sourceList = [];
      this.agentList = [];
      return;
    }

    // Unique Sources
    const sources = new Set<string>();
    alerts.forEach(a => sources.add(a.source || 'Unknown'));
    this.uniqueSourcesCount = sources.size;
    this.sourceList = Array.from(sources);

    // Unique Agents
    const agents = new Set<string>();
    alerts.forEach(a => {
      if (a.agentName) agents.add(a.agentName);
    });
    this.uniqueAgentsCount = agents.size;
    this.agentList = Array.from(agents);

    // Resolution Rate
    const total = alerts.length;
    const resolved = alerts.filter(a => (a.status || '').toLowerCase() === 'resolved').length;
    this.resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    this.resolutionLabel = `${resolved} of ${total} alerts resolved`;
  }
}
