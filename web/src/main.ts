import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).then((ref) => {
  console.log('Bootstrap succeeded');
}).catch((err: any) => {
    console.error('Bootstrap failed:', err?.message || err);
    (window as any).__bootstrapError = err?.message || String(err);
});
