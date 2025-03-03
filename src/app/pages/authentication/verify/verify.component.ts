import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify',
  imports: [ReactiveFormsModule],
  providers: [AuthService],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
})
export class VerifyComponent implements OnInit {
  message: string = 'Verifying...';

  readonly authService = inject(AuthService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    console.log(token);
    if (token) {
      this.authService.verifyEmail(token).subscribe({
        next: () =>
          (this.message =
            'Email verification successful! Your email has been verified.'),
        error: (error) =>
          (this.message = `Verification failed: ${error.error.message}`),
      });
    } else {
      this.message = 'Verification failed: No token provided.';
    }
  }
}
