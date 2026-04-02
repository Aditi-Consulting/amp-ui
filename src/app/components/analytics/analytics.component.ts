import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { AlertsStoreService } from '../../services/alerts-store.service';
import { StatsCardsComponent } from '../stats-cards/stats-cards.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, StatsCardsComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  constructor(private alertsStore: AlertsStoreService) {}

  ngOnInit(): void {
    this.alertsStore.fetchAlerts();

    this.subscriptions.add(
      interval(5000).subscribe(() => {
        this.alertsStore.fetchAlerts();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
