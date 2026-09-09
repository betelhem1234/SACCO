export interface Setting {
  id?: string;
  key: string;
  value: string;
}

export interface AppSettings {
  company_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
}
