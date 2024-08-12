import { Component, inject, OnDestroy, OnInit, signal, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortenUrlService, ShortUrl, ShortUrlDetails } from '../shorten-url/shorten-url.service';
import { catchError, debounceTime, finalize, firstValueFrom, of, Subject, switchMap, takeUntil } from 'rxjs';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SkeletonModule } from 'primeng/skeleton'
import {ScrollerModule} from 'primeng/scroller';
import { LazyLoadEvent } from 'primeng/api';

export type UsageState = {
  date: string,
  usageCount: number;
}

@Component({
  selector: 'app-my-urls',
  standalone: true,
  imports: [CommonModule, ScrollerModule, VirtualScrollerModule, ScrollPanelModule, SkeletonModule],
  templateUrl: './my-urls.component.html',
  styleUrl: './my-urls.component.scss',
})
export class MyUrlsComponent implements OnInit, OnDestroy {

  shortUrlService = inject(ShortenUrlService);
  service = inject(ShortenUrlService);

  myUrls = signal<ShortUrlDetails[]>([]);
  test: ShortUrlDetails[] = [];

  page = 0;
  pageSize = 20;
  hasNext = true;
  loading = false;
  private lazyLoad$ = new Subject<LazyLoadEvent>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // this.loadItems();
    this.lazyLoad$.pipe(
      takeUntil(this.destroy$),
      debounceTime(200)
    ).subscribe(event => {
      console.log(event)
      const { last } = event;
      if (event.last === 0) {
        this.loadItems();
      } else {
        if (last && last >= this.myUrls().length) {
          this.loadItems();
        }
      }
      event.forceUpdate && event.forceUpdate()
    })
  }

  loadItems(): void {
    if (this.loading || !this.hasNext) return;

    this.loading = true;
    this.service.getUserUrls(this.page + 1, this.pageSize).pipe(
      catchError(err => {
        console.error('Error loading items', err);
        return of({
          pageNo: this.page,
          pageSize: 0,
          data: []
        });
      }),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      const { pageNo, data } = res;
      this.page = pageNo;
      this.hasNext = this.pageSize === data.length ;
      this.test = [ ...this.test, ...data];
      this.myUrls.set([...this.myUrls(), ...data])
      console.log(this.test.length)
      this.loading = false
      // this.myUrls.update(currentItems => [...currentItems, ...res.data]);
    });
  }

  onLazyLoad(event: LazyLoadEvent): void {
    this.lazyLoad$.next(event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById: TrackByFunction<{ id: number | string }> = (index, item) => item.id;

}
