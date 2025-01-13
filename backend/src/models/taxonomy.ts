import { BaseModel } from "./base";

interface TaxonomyBase extends BaseModel {
  name: string;
  slug: string;
}

export interface Category extends TaxonomyBase {
  description?: string;
}

export interface Tag extends TaxonomyBase {}
