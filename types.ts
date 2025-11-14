
export interface Match {
  rank: number;
  match_id: string;
  snack_name: string;
  vibe_keyword_kr: string;
  vibe_keyword_en?: string;
  match_score_percent: number;
}

export interface AnalysisResult {
  primary_match_id: string;
  all_matched_kstars: string;
  kstar_match_reason_kr: string;
  kstar_match_reason_en: string;
  top_3_matches: Match[];
}

export interface SnackTypeInfo {
  id: string;
  vibe: string;
  vibe_en: string;
  snack: string;
  snack_en: string;
  stars: string;
  stars_en: string;
  definition: string;
  definition_en: string;
  colorClass: string;
}
