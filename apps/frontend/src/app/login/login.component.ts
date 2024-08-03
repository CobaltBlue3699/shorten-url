import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @Input()
  set id(heroId: string) {
    this.id = heroId;
    // this.hero$ = this.service.getHero(heroId);
  }
}
