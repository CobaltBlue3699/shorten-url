import { Component, computed, inject, OnDestroy, OnInit, signal, TrackByFunction } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ShortenUrlService, ShortUrl, ShortUrlDetails } from '../shorten-url/shorten-url.service';
import { catchError, debounceTime, finalize, firstValueFrom, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { ScrollerModule } from 'primeng/scroller';
import { LazyLoadEvent, MessageService, PrimeIcons } from 'primeng/api';
import { DynamicDialogModule, DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppInfoService } from '../services/app.service';
import { AnalyzeUrlComponent } from './analyze-url/analyze-url.component';

export type UsageState = {
  date: string;
  usageCount: number;
};

@Component({
  selector: 'app-my-urls',
  standalone: true,
  imports: [
    CommonModule,
    ScrollerModule,
    SkeletonModule,
    ToastModule,
    MenuModule,
    // DialogModule,
    DynamicDialogModule,
  ],
  providers: [MessageService, DialogService],
  templateUrl: './my-urls.component.html',
  styleUrl: './my-urls.component.scss',
})
export class MyUrlsComponent implements OnInit, OnDestroy {
  shortUrlService = inject(ShortenUrlService);
  service = inject(ShortenUrlService);
  appInfoService = inject(AppInfoService);
  messageService = inject(MessageService);
  dialogService = inject(DialogService);

  myUrls = signal<ShortUrlDetails[]>([]);
  location = inject(Location);
  // [model] = 'itemMenus()[item.key]';
  itemMenus = computed(() => {
    const flattenedObject = Object.fromEntries(
      this.myUrls().map((item) => [
        item.key,
        [
          {
            label: 'Analyze',
            icon: PrimeIcons.CHART_BAR,
            command: (event: any) => {
              const btn = event.originalEvent.target.closest(".menu");
              setTimeout(() => {
                btn.click();
              })
              this.service.getUrlDetails(item.key).subscribe((res) => {
                res.shortUrl = item.shortUrl
                this.analyzeUrl(res);
              });
            },
          },
          {
            label: 'Delete',
            icon: PrimeIcons.TRASH,
            command: (event: any) => {
              const btn = event.originalEvent.target.closest(".menu");
              setTimeout(() => {
                btn.click();
              })
              this.deleteShortUrl(item).subscribe((res) => {
                if (res) {
                  // delete success
                  this.showSuccess('刪除成功');
                  this.myUrls.set(this.myUrls().filter((url) => url.key !== res.key));
                } else {
                  this.showWarn('服務異常...');
                }
              });
            },
          },
        ],
      ])
    );
    return flattenedObject;
  });

  page = 0;
  pageSize = 20;
  hasNext = true;
  loading = false;
  private lazyLoad$ = new Subject<LazyLoadEvent>();
  private destroy$ = new Subject<void>();
  ref: DynamicDialogRef | undefined;

  ngOnInit(): void {
    // this.loadItems();
    this.lazyLoad$.pipe(takeUntil(this.destroy$), debounceTime(200)).subscribe((event) => {
      console.log(event);
      const { last } = event;
      if (event.last === 0) {
        this.loadItems();
      } else {
        if (last && last >= this.myUrls().length) {
          this.loadItems();
        }
      }
      event.forceUpdate && event.forceUpdate();
    });
  }

  loadItems(): void {
    if (this.loading || !this.hasNext) return;

    this.loading = true;
    this.service
      .getUserUrls(this.page + 1, this.pageSize)
      .pipe(
        catchError((err) => {
          console.error('Error loading items', err);
          return of({
            pageNo: this.page,
            pageSize: 0,
            data: [],
          });
        }),
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        const { pageNo, data } = res;
        this.page = pageNo;
        this.hasNext = this.pageSize === data.length;
        // this.myUrls.set([...this.myUrls(), ...data])
        this.loading = false;
        this.myUrls.update((currentItems) => [
          ...currentItems,
          ...res.data.map((url) => ({ ...url, shortUrl: `${this.appInfoService.appInfo().baseURL}/${url.key}` })),
        ]);
      });
  }

  onLazyLoad(event: LazyLoadEvent): void {
    this.lazyLoad$.next(event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.location.back();
  }

  deleteShortUrl(shortUrl: ShortUrl) {
    return this.service.deleteUrl(shortUrl.key);
  }

  showSuccess(msg: string, data?: any) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg, data });
  }

  showInfo(msg: string, data?: any) {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: msg, data });
  }

  showWarn(msg: string, data?: any) {
    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: msg, data });
  }

  showError(msg: string, data?: any) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, data });
  }

  analyzeUrl(data: ShortUrlDetails) {
    this.ref = this.dialogService.open(AnalyzeUrlComponent, {
      data,
      header: 'Analyze',
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      closable: true,
    });
    this.ref.onClose.subscribe((res) => {
      // console.log(`close: `, res);
      // overlay 需要加上這行才可以正確關閉，疑似primeng bug
      this.ref?.destroy();
    });
  }

  // trackByKey: TrackByFunction<{ key: string }> = (index, item) => item.key;
}
