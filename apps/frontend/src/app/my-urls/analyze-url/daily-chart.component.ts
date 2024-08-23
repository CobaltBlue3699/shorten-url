import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyStat } from '../../shorten-url/shorten-url.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-daily-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    @if (data.labels.length) {
    <p-chart type="line" [data]="data" [options]="options" />
    } @else {
    <p>尚未有資料!</p>
    }
  `,
  styleUrl: './analyze-url.component.scss',
})
export class DailyChartComponent implements OnInit {
  @Input()
  dailyStats!: DailyStat[];

  data!: any;
  options!: any;

  ngOnInit(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const { counts, labels } = this.dailyStats.reduce(
      (val: any, url) => {
        return {
          counts: [...val.counts, url.count],
          labels: [...val.labels, url.date],
        };
      },
      {
        counts: [],
        labels: [],
      }
    );
    this.data = {
      labels,
      datasets: [
        {
          label: 'Daily usage',
          data: counts,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4,
        },
      ],
    };
    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }
}
