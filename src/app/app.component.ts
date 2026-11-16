import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

interface SignupResponse {
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly signupApiUrl = 'http://127.0.0.1:3000/api/signups';

  fullName = '';
  email = '';
  signupSuccess = '';
  signupError = '';
  isSubmitting = false;

  submitSignup(): void {
    this.signupSuccess = '';
    this.signupError = '';
    this.isSubmitting = true;

    this.http.post<SignupResponse>(this.signupApiUrl, {
      name: this.fullName,
      email: this.email,
    }).pipe(
      finalize(() => {
        this.isSubmitting = false;
      }),
    ).subscribe({
      next: (response) => {
        this.signupSuccess = response.message;
        this.fullName = '';
        this.email = '';
      },
      error: (error: HttpErrorResponse) => {
        const serverMessage = error.error && typeof error.error.message === 'string'
          ? error.error.message
          : '';

        this.signupError = error.status >= 500 || error.status === 0
          ? 'The sign-up service is unavailable. Make sure the backend is running, then try again.'
          : serverMessage || 'Please check your name and email, then try again.';
      },
    });
  }
}
