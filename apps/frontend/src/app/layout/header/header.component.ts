import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  providers: [UserService],
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  httpClient = inject(HttpClient);
  userService = inject(UserService);
  userSignal = this.userService.user;
  toggle = true;
  router = inject(Router);
  route = inject(ActivatedRoute);

  logout(): void {
    this.userService.logout();
  }

  goto(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }
}
