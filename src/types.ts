export type UnknownFields = {
  [key: string]: unknown;
};

export type Purpose =
  | "khaitruong"
  | "cuoihoi"
  | "dongtho"
  | "nhaptrach"
  | "xuat_hanh"
  | (string & {});

export type TodayResponse = {
  date: string;
} & UnknownFields;

export type DayResponse = {
  input?: unknown;
  solar?: unknown;
  lunar?: unknown;
} & UnknownFields;

export type MonthResponse = {
  year: number;
  month: number;
  days: unknown[];
} & UnknownFields;

export type NapAmResponse = {
  name?: string;
  value?: string;
} & UnknownFields;

export type ChiRelationsResponse = {
  chi?: string;
  tamHop?: string[];
  lucXungWith?: string;
} & UnknownFields;

export type CompatResponse = {
  user?: unknown;
  day?: unknown;
  relations?: unknown;
  verdict?: "good" | "neutral" | "bad" | string;
} & UnknownFields;

export type TietKhiResponse = {
  index?: number;
  name?: string;
  startAt?: string;
  endAt?: string;
  next?: unknown;
  secondsToNext?: number;
} & UnknownFields;

export type TietKhiYearResponse = {
  year?: number;
  terms?: unknown[];
} & UnknownFields;

export type NgayKyResponse = {
  date?: string;
  items?: unknown[];
} & UnknownFields;

export type SaoTuResponse = {
  jd?: number;
  sao28Tu?: unknown;
} & UnknownFields;

export type ThanSatResponse = {
  date?: string;
  items?: unknown[];
} & UnknownFields;

export type WarningItem = {
  type?: string;
  code?: string;
  name?: string;
  level?: "good" | "warn" | "avoid" | "bad" | string;
  reason?: string;
} & UnknownFields;

export type WarningsResponse = {
  input?: unknown;
  level?: "good" | "warn" | "bad" | string;
  summary?: string[];
  items?: WarningItem[];
} & UnknownFields;

export type PickResultItem = {
  date?: string;
  weekdayName?: string;
  score?: number;
  verdict?: "good" | "ok" | "avoid" | string;
  reasons?: string[];
  highlights?: unknown;
} & UnknownFields;

export type PickResponse = {
  input?: unknown;
  results?: PickResultItem[];
  meta?: unknown;
} & UnknownFields;

export type ConvertRequest = {
  year: number;
  month: number;
  day: number;
  tz?: number;
  isLeap?: boolean;
} & UnknownFields;

export type ConvertResponse = {
  input?: unknown;
  output?: unknown;
} & UnknownFields;

export type WarningsQuery = {
  date: string;
  tz?: number;
  userYear?: number;
  purpose?: Purpose;
  ruleset?: string;
};

export type PickQuery = {
  from: string;
  to: string;
  purpose: Purpose;
  tz?: number;
  userYear?: number;
  limit?: number;
  maxDays?: number;
  ruleset?: string;
};

export type AmLichClientOptions = {
  baseUrl?: string;
  apiPrefix?: string;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};
