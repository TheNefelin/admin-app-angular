import { Service, signal, WritableSignal } from '@angular/core';

export interface AuthUser {
  id_user: string;
  email: string;
  name?: string;
  picture?: string;
  role: string;
}

export interface AuthSession {
  token: string;
  refresh_token: string;
  user: AuthUser;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const KEY = (ns: string, suffix: string) => `auth.${ns}.${suffix}`;

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_SCRIPT_TIMEOUT_MS = 10000;

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timeout);
      script.remove();
      reject(new Error('No se pudo cargar el script de Google'));
    };
    document.head.appendChild(script);

    const timeout = setTimeout(() => {
      script.remove();
      reject(new Error('Tiempo de espera agotado cargando el script de Google'));
    }, GOOGLE_SCRIPT_TIMEOUT_MS);
  });
}

@Service()
export class AuthService {
  private readonly googleClientIds = new Map<string, string>();
  private readonly sessionSignals = new Map<string, WritableSignal<AuthSession | null>>();

  sessionSignal(ns: string): WritableSignal<AuthSession | null> {
    let sig = this.sessionSignals.get(ns);
    if (!sig) {
      sig = signal<AuthSession | null>(this.getSession(ns));
      this.sessionSignals.set(ns, sig);
    }
    return sig;
  }

  async getGoogleClientId(ns: string): Promise<string> {
    const cached = this.googleClientIds.get(ns);
    if (cached) return cached;

    const res = await fetch('/ssr-api/config');
    if (!res.ok) throw new Error('No se pudo cargar la configuración');

    const data: { googleClientIds: Record<string, string> } = await res.json();
    const clientId = data.googleClientIds[ns] ?? '';

    if (!clientId) {
      throw new Error(`Google login no configurado para el namespace "${ns}"`);
    }

    this.googleClientIds.set(ns, clientId);
    return clientId;
  }

  getSession(ns: string): AuthSession | null {
    if (typeof sessionStorage === 'undefined') return null;

    const token = sessionStorage.getItem(KEY(ns, 'access_token'));
    const refreshToken = sessionStorage.getItem(KEY(ns, 'refresh_token'));
    const userRaw = sessionStorage.getItem(KEY(ns, 'user'));

    if (!token || !userRaw) return null;

    try {
      return { token, refresh_token: refreshToken ?? '', user: JSON.parse(userRaw) as AuthUser };
    } catch {
      return null;
    }
  }

  getAccessToken(ns: string): string | null {
    return this.getSession(ns)?.token ?? null;
  }

  isAuthenticated(ns: string): boolean {
    return !!this.getAccessToken(ns);
  }

  private setSession(ns: string, session: AuthSession): void {
    if (typeof sessionStorage === 'undefined') return;

    sessionStorage.setItem(KEY(ns, 'access_token'), session.token);
    sessionStorage.setItem(KEY(ns, 'refresh_token'), session.refresh_token);
    sessionStorage.setItem(KEY(ns, 'user'), JSON.stringify(session.user));
    this.sessionSignals.get(ns)?.set(session);
  }

  private clearSession(ns: string): void {
    if (typeof sessionStorage === 'undefined') return;

    sessionStorage.removeItem(KEY(ns, 'access_token'));
    sessionStorage.removeItem(KEY(ns, 'refresh_token'));
    sessionStorage.removeItem(KEY(ns, 'user'));
    this.sessionSignals.get(ns)?.set(null);
  }

  async loginWithGoogle(ns: string): Promise<void> {
    const clientId = await this.getGoogleClientId(ns);
    await loadGoogleScript();

    if (!window.google) {
      throw new Error('El script de Google no está disponible');
    }

    return new Promise<void>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response) => {
          if (!response.access_token || response.error) {
            reject(new Error(response.error ?? 'Error al autenticar'));
            return;
          }

          try {
            const res = await fetch(`/ssr-api/${ns}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ googleToken: response.access_token }),
            });

            if (!res.ok) {
              const err = await res.json().catch(() => null);
              const detail = err?.detail;
              reject(new Error(typeof detail === 'string' ? detail : 'Error al autenticar'));
              return;
            }

            const data = (await res.json()) as AuthSession;
            this.setSession(ns, data);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
      });

      client.requestAccessToken();
    });
  }

  async refresh(ns: string): Promise<string | null> {
    const session = this.getSession(ns);
    if (!session?.refresh_token) return null;

    try {
      const res = await fetch(`/ssr-api/${ns}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });

      if (!res.ok) {
        this.clearSession(ns);
        return null;
      }

      const data = (await res.json()) as { token: string; refresh_token: string };
      this.setSession(ns, {
        token: data.token,
        refresh_token: data.refresh_token,
        user: session.user,
      });
      return data.token;
    } catch {
      this.clearSession(ns);
      return null;
    }
  }

  async logout(ns: string): Promise<void> {
    const session = this.getSession(ns);

    if (session?.refresh_token) {
      try {
        await fetch(`/ssr-api/${ns}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
      } catch {
        // El logout remoto falla, pero la sesión local se limpia igual
      }
    }

    this.clearSession(ns);
  }
}
