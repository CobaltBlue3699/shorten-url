import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortUrlDetails } from '../../shorten-url/shorten-url.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { DailyChartComponent } from './daily-chart.component';
import { CountryChartComponent } from './country-chart.component';

@Component({
  selector: 'app-analyze-url',
  standalone: true,
  imports: [CommonModule, TabViewModule, ChartModule, DailyChartComponent, CountryChartComponent],
  templateUrl: './analyze-url.component.html',
  styleUrl: './analyze-url.component.scss',
})
export class AnalyzeUrlComponent {
  data!: ShortUrlDetails;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
    this.data = this.config.data as ShortUrlDetails;
  }

  // closeDialog() {
  //   this.ref.close({ status: 'closed', result: 'some result' }); // 傳回資料到父組件
  // }
}
