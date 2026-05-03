import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

console.log('Attempting bootstrap...');
bootstrapApplication(App, appConfig).catch((err: any) => {
    console.error('Bootstrap failed:', err);
    window.alert('Angular Error: ' + err.message);
});
