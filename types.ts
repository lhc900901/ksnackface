
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
  top_3_matches: Match[];
}

export interface SnackTypeInfo {
  id: string;
  vibe: string;
  snack: string;
  stars: string;
  definition: string;
}
