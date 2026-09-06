export type Kind = "emitted" | "inferred" | "relational";
export type Confidence = "documented" | "reported" | "modelled";
export type SourceType =
  | "regulatory"
  | "litigation"
  | "journalism"
  | "academic"
  | "policy"
  | "vendor_doc";

export interface Source {
  title: string;
  publisher: string;
  url: string;
  date: string;
  type: SourceType;
}

export interface Record_ {
  id: string;
  datum: string;
  holder_type: string;
  holder_examples?: string[];
  kind: Kind;
  mechanism: string;
  conditions: string[];
  jurisdictions: string[];
  confidence: Confidence;
  sources: Source[];
  tags: string[];
  note?: string;
}

export interface Module {
  id: string;
  keys: string[];
  records: string[];
}

export interface ModulesFile {
  baseline: string[];
  modules: Module[];
}

export interface DayEntry {
  record: string;
  count: number;
  count_basis: string;
}

export interface DayMoment {
  t: number;
  act: string;
  prompt?: string;
  entries: DayEntry[];
}

export interface DayFile {
  moments: DayMoment[];
}

export interface ProfileClaim {
  claim: string;
  note: string;
  record: string;
}

export interface ProfileFile {
  conclusions: ProfileClaim[];
}

export type View = "action" | "day" | "evidence" | "method" | "settings";

export type TextSize = "small" | "default" | "large" | "xlarge";
