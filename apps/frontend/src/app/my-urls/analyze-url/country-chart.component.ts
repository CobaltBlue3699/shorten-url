import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryStat } from '../../shorten-url/shorten-url.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-country-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    @if (data.labels.length) {
    <div class="w-[50%] m-auto">
      <p-chart type="pie" [data]="data" [options]="options" />
    </div>
    } @else {
    <p>尚未有資料!</p>
    }
  `,
})
export class CountryChartComponent implements OnInit {
  @Input()
  countryStats!: CountryStat[];

  data!: any;
  options!: any;

  ngOnInit(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const { counts, labels } = this.countryStats.reduce(
      (val: any, url) => {
        return {
          counts: [...val.counts, url.count],
          labels: [...val.labels, new Intl.DisplayNames([], { type: 'region' }).of(url.countryCode)],
        };
      },
      {
        counts: [],
        labels: [],
      }
    );
    this.data = {
      labels: labels,
      datasets: [
        {
          data: counts,
        },
      ],
    };

    this.options = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
          },
        },
      },
    };
  }
}
