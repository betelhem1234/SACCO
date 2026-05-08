import { HttpErrorResponse } from '@angular/common/http';

/** Prefer Spring Boot JSON body `{ message: string }`; fallback to status text. */
export function httpErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && 'message' in body) {
      const msg = (body as { message: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
      if (Array.isArray(msg) && msg.length && typeof msg[0] === 'string') return msg[0];
    }
    if (err.status === 409) return 'This record is still in use and cannot be deleted.';
    if (err.message) return err.message;
  }
  return fallback;
}
