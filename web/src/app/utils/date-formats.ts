import { MAT_NATIVE_DATE_FORMATS, MatDateFormats } from '@angular/material/core';

/**
 * App-wide Material datepicker display formats.
 * The native adapter builds an Intl.DateTimeFormat from these options, so the
 * dates render as e.g. "May 12, 2026" to match every other date in the app.
 */
export const LONG_DATE_FORMATS: MatDateFormats = {
  parse: MAT_NATIVE_DATE_FORMATS.parse,
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: { year: 'numeric', month: 'short', day: 'numeric' },
  },
};