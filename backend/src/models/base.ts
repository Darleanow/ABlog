export interface BaseModel {
  id: number;
  created_at: string;
}

export interface TimestampedModel extends BaseModel {
  updated_at: string;
}

export interface BaseRelation {
  created_at: string;
}

export interface ArticleRelation extends BaseRelation {
  article_id: number;
}

export interface UserRelation extends BaseRelation {
  user_id: number;
}
