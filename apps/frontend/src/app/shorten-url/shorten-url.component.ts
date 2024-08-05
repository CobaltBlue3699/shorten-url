import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortenUrlService } from './shorten-url.service';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-shorten-url',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './shorten-url.component.html',
  styleUrl: './shorten-url.component.scss',
})
export class ShortenUrlComponent {
  short = inject(ShortenUrlService);

  urlForm: FormGroup = new FormGroup({
    url: new FormControl('', [
        Validators.required,
        Validators.minLength(7),
        (control: AbstractControl): ValidationErrors | null => {
          // eslint-disable-next-line no-useless-escape
          const forbidden = !/^(http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/.test(control.value);
          return forbidden ? { forbidden: { value: control.value } } : null;
        }
      ]
    )
  });

  public onSubmit() {
    if(this.urlForm.valid) {
      const { url } = this.urlForm.value;
      this.short.urlPreview(url).subscribe(res => {
        console.log(res);
      })
    }
  }
}
