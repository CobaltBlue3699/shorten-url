import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

// export function urlValidator(nameRe: RegExp): ValidatorFn {
//   return
// }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

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
      console.log(url)
    }
  }
}
