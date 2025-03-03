import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/pages/authentication/services/auth.service';
import { LoginRequest } from 'src/app/models/loginRequest';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  providers: [AuthService],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent implements OnInit {
  form!: FormGroup;

  readonly loader = inject(NgxUiLoaderService);
  readonly snackBar = inject(MatSnackBar);

  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly tokenStorage = inject(TokenStorageService);

  ngOnInit(): void {
    this.createForm();
  }

  get f() {
    return this.form.controls;
  }

  public createForm() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
    });
  }

  public signIn() {
    if (!this.form.valid) {
      return;
    }

    this.loader.start();

    const request: LoginRequest = {
      email: this.form.value.email || '',
      password: this.form.value.password || '',
    };

    this.authService.login(request).subscribe({
      next: (result) => {
        this.loader.stop();
        this.router.navigate(['/orders/order-list']);
        this.tokenStorage.saveToken(result.token);
        this.tokenStorage.setUserSession(result);
      },
      error: (error) => {
        this.loader.stop();
        this.snackBar.open(error.error, 'Закрити', {
          duration: 4000,
        });
      },
    });
  }
}
