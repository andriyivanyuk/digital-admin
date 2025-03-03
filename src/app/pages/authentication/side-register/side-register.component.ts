import { Component, inject } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { User } from 'src/app/pages/authentication/models/user';
import { AuthService } from '../services/auth.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-side-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-register.component.html',
  providers: [AuthService],
})
export class AppSideRegisterComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService, private router: Router) {}

  readonly snackBar = inject(MatSnackBar);
  readonly loader = inject(NgxUiLoaderService);
  readonly authService = inject(AuthService);

  public form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
  });

  get f() {
    return this.form.controls;
  }

  public createAccount() {
    if (this.form.valid) {
      const request: User = {
        username: this.form.value.username || '',
        email: this.form.value.email || '',
        password: this.form.value.password || '',
      };
      this.loader.start();
      this.authService.register(request).subscribe({
        next: (result) => {
          this.loader.stop();
          this.snackBar.open(result.status, 'Закрити', {
            duration: 8000,
          });
          this.router.navigate(['authentication/login']);
        },
        error: (error) => {
          this.loader.stop();
          console.log(error);
        },
      });
    } else {
      return;
    }
  }
}
