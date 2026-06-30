export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProvinceRead {
  code: string;
  name_ar: string;
  name_fr: string;
  population: number;
  area: number;
  region: string;
}

export interface ProvinceCreate {
  code: string;
  name_ar: string;
  name_fr: string;
  population: number;
  area: number;
  region: string;
}

export interface ProvinceUpdate {
  name_ar?: string;
  name_fr?: string;
  population?: number;
  area?: number;
  region?: string;
}

export interface OrganizationUpdate {
  name_ar?: string;
  name_fr?: string;
  type?: string;
  province_code?: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  budget?: number;
  status?: string;
  province_code?: string;
  organization_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface IndicatorUpdate {
  name?: string;
  value?: number;
  target?: number;
  unit?: string;
  year?: number;
  province_code?: string;
}

export interface ReportUpdate {
  title?: string;
  description?: string;
  generated_at?: string;
  organization_id?: string;
}

export interface DocumentUpdate {
  filename?: string;
  file_path?: string;
  mime_type?: string;
  size?: number;
  document_type?: string;
}

export interface OrganizationRead {
  id: string;
  code: string;
  name_ar: string;
  name_fr: string;
  type: string;
  province_code: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreate {
  code: string;
  name_ar: string;
  name_fr: string;
  type: string;
  province_code: string;
}

export interface ProjectRead {
  id: string;
  title: string;
  description: string;
  organization_id: string;
  province_code: string;
  budget: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description: string;
  organization_id: string;
  province_code: string;
  budget: number;
  status: string;
  start_date: string;
  end_date: string;
}

export interface IndicatorRead {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  year: number;
  province_code: string;
  created_at: string;
  updated_at: string;
}

export interface IndicatorCreate {
  name: string;
  value: number;
  target: number;
  unit: string;
  year: number;
  province_code: string;
}

export interface ReportRead {
  id: string;
  title: string;
  description: string;
  generated_at: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReportCreate {
  title: string;
  description: string;
  generated_at: string;
  organization_id: string;
}

export interface DocumentRead {
  id: string;
  filename: string;
  file_path: string;
  mime_type: string;
  size: number;
  document_type: string;
  organization_id: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreate {
  filename: string;
  file_path: string;
  mime_type: string;
  size: number;
  document_type: string;
  organization_id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserRead {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}
