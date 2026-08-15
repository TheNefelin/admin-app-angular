import { Component, effect, inject, input, signal } from '@angular/core';
import { AuthService, AuthSession } from '@core/services/auth-service';
import { ErrorService } from '@core/services/error-service';

@Component({
  selector: 'app-google-auth-component',
  imports: [],
  templateUrl: './google-auth-component.html',
})
export class GoogleAuthComponent {
  readonly namespace = input.required<string>();
  readonly label = input.required<string>();

  private readonly authService = inject(AuthService);
  private readonly errorService = inject(ErrorService);

  readonly session = signal<AuthSession | null>(null);
  readonly loading = signal(false);

  constructor() {
    effect(() => this.session.set(this.authService.sessionSignal(this.namespace())()));
  }

  protected async login(): Promise<void> {
    this.loading.set(true);
    try {
      await this.authService.loginWithGoogle(this.namespace());
    } catch (err) {
      this.errorService.show(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }

  protected async logout(): Promise<void> {
    await this.authService.logout(this.namespace());
  }
}
