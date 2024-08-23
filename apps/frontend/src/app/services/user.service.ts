import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

export type User = {
  name: string;
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  httpClient = inject(HttpClient);
  private _user = signal({} as User);

  constructor() {
    this.getUser();
  }

  get user() {
    return this._user.asReadonly();
  }

  getUser() {
    this.httpClient.get<User>(`/auth/me`).subscribe((res) => {
      this._user.set(res);
    });
  }

  logout(): void {
    this.httpClient.post('/auth/logout', {}).subscribe(() => {
      location.href = '';
    });
  }
}
