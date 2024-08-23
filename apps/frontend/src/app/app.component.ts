import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { SideBarComponent } from './layout/side-bar/side-bar.component';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent, SideBarComponent, FooterComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private destory$ = new Subject();

  showHeader = false;
  showSidebar = false;
  showFooter = false;

  router$ = inject(Router).events.pipe(
    takeUntil(this.destory$),
    filter((e) => e instanceof NavigationEnd)
  );
  activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    // 轉導後判斷header、footer、sidebar開啟或關閉
    this.router$.subscribe(() => {
      this.showHeader = this.activatedRoute.firstChild?.snapshot.data['showHeader'] !== false;
      this.showSidebar = this.activatedRoute.firstChild?.snapshot.data['showSidebar'] !== false;
      this.showFooter = this.activatedRoute.firstChild?.snapshot.data['showFooter'] !== false;
    });
  }

  ngOnDestroy(): void {
    this.destory$.next(void 0);
    this.destory$.complete();
  }
}
