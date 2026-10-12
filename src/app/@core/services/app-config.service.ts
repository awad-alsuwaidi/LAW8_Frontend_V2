import { Injectable } from '@angular/core';

interface AppConfig {
  version: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config!: AppConfig;

  async load(): Promise<void> {
    const response = await fetch('/assets/config/version.json');

    if (!response.ok) {
      throw new Error('Failed to load app configuration');
    }

    this.config = await response.json();
  }

  get version(): string {
    return this.config?.version ?? '';
  }
}