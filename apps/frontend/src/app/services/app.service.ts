import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

export type AppInfo = {
  host: string;
  protocol: string;
  port: number;
  baseURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppInfoService {

  httpClient = inject(HttpClient);
  private _appInfo = signal({} as AppInfo);

  constructor() {
    this.getAppInfo()
  }

  get appInfo() {
    return this._appInfo.asReadonly();
  }

  getAppInfo() {
    this.httpClient.get<AppInfo>(`/config`).subscribe((res) => {
      this._appInfo.set(res)
    })
  }

}
