import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortUrl, ShortenUrlService } from './shorten-url.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppInfoService } from '../services/app.service';

@Component({
  selector: 'app-shorten-url',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],

  templateUrl: './shorten-url.component.html',
  styleUrl: './shorten-url.component.scss',
})
export class ShortenUrlComponent {
  service = inject(ShortenUrlService);
  isProcess = false;
  isSuccess = false;

  copySuccess = false;
  copyProcess = false;

  router = inject(Router);
  route = inject(ActivatedRoute);
  appInfoService = inject(AppInfoService);

  private _shortUrl = signal<null | ShortUrl>(null);
  image = computed(() => this.shortUrl()?.image);
  title = computed(() => this.shortUrl()?.title);
  description = computed(() => this.shortUrl()?.description);
  shortLink = computed(() => `${this.appInfoService.appInfo().baseURL}/${this.shortUrl()?.key}`);
  lonkLink = computed(() => this.shortUrl()?.originalUrl);
  icon = computed(() => this.shortUrl()?.icon);

  urlForm: FormGroup = new FormGroup({
    originalUrl: new FormControl('', [
      Validators.required,
      Validators.minLength(7),
      (control: AbstractControl): ValidationErrors | null => {
        // eslint-disable-next-line no-useless-escape
        const urlPattern = new RegExp(
          '^(https?:\\/\\/)?' + // Protocol (optional)
            '((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|' + // Domain name and extension
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IPv4 address
            '(\\:\\d+)?' + // Port (optional)
            '(\\/[-a-zA-Z0-9@:%._+~#=]*)*' + // Path (optional)
            '(\\?[;&a-zA-Z0-9%_.,~+=-]*)?' + // Query string (optional)
            '(\\#[-a-zA-Z0-9_]*)?$' // Fragment (optional)
        );
        const forbidden = !urlPattern.test(control.value);
        return forbidden ? { forbidden: { value: control.value } } : null;
      },
    ]),
  });

  get shortUrl() {
    return this._shortUrl.asReadonly();
  }

  public onSubmit() {
    if (this.urlForm.valid) {
      const { originalUrl } = this.urlForm.value;
      this.isProcess = true;
      this.isSuccess = false;
      this.service.generateShortUrl({ originalUrl }).subscribe((res) => {
        this._shortUrl.set(res);
        this.isProcess = false;
        this.isSuccess = true;
        // this.service.getUrlDetails(res.shortUrl).subscribe(res => {
        //   console.log(res)
        // })
      });
    }
  }

  resetShortUrl() {
    this._shortUrl.set(null);
    this.isSuccess = false;
    this.urlForm.reset();
  }

  copyShortUrl() {
    this.copyProcess = true;
    this.fallbackCopyText(this.shortLink()).then(() => {
      this.copyProcess = false;
      setTimeout(() => {
        this.copySuccess = true;
        setTimeout(() => (this.copySuccess = false), 3000);
      }, 500);
    });
  }

  fallbackCopyText(value: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    } else {
      return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          resolve(void 0);
        } catch (err) {
          reject(void 0);
          console.error('複製失敗: ', err);
        }
        document.body.removeChild(textArea);
      });
    }
  }

  goto(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }
}
