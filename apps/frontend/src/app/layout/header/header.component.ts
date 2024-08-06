import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {

  httpClient = inject(HttpClient);
  toggle = true;
  user: any = {};

  ngOnInit(): void {
    this.httpClient.get(`/auth/me`).subscribe((res) => {
      this.user = res;
    })
  }

  logout(): void {
    this.httpClient.post('/auth/logout', {}).subscribe(() => {
      location.href = '';
    })
  }

}
