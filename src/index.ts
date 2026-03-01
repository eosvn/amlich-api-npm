import type {
  AmLichClientOptions,
  ChiRelationsResponse,
  CompatResponse,
  ConvertRequest,
  ConvertResponse,
  DayResponse,
  DaysResponse,
  MonthResponse,
  NapAmResponse,
  NgayKyResponse,
  PickQuery,
  PickResponse,
  SaoTuResponse,
  ThanSatResponse,
  TietKhiResponse,
  TietKhiYearResponse,
  TodayResponse,
  WarningsQuery,
  WarningsResponse,
} from "./types";

export type {
  AmLichClientOptions,
  ChiRelationsResponse,
  CompatResponse,
  ConvertRequest,
  ConvertResponse,
  DayResponse,
  DaysResponse,
  MonthResponse,
  NapAmResponse,
  NgayKyResponse,
  PickQuery,
  PickResponse,
  SaoTuResponse,
  ThanSatResponse,
  TietKhiResponse,
  TietKhiYearResponse,
  TodayResponse,
  WarningsQuery,
  WarningsResponse,
} from "./types";

const DEFAULT_BASE_URL = "https://amlich.giaphahobe.vn";
const DEFAULT_API_PREFIX = "/api/v1";
const DEFAULT_TIMEOUT_MS = 15_000;

export class AmLichError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, options?: { status?: number; data?: unknown }) {
    super(message);
    this.name = "AmLichError";
    this.status = options?.status;
    this.data = options?.data;
  }
}

export class AmLichClient {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: AmLichClientOptions = {}) {
    const {
      baseUrl = DEFAULT_BASE_URL,
      apiPrefix = DEFAULT_API_PREFIX,
      headers = {},
      fetchImpl,
      timeoutMs = DEFAULT_TIMEOUT_MS,
    } = options;

    if (!fetchImpl && typeof globalThis.fetch !== "function") {
      throw new AmLichError(
        "No fetch implementation found. Provide fetchImpl in constructor options."
      );
    }

    this.baseUrl = baseUrl;
    this.apiPrefix = apiPrefix;
    this.headers = headers;
    this.fetchImpl = fetchImpl ?? globalThis.fetch;
    this.timeoutMs = timeoutMs;
  }

  today(tz?: number): Promise<TodayResponse> {
    return this.get<TodayResponse>("/today", {
      tz,
    });
  }

  day(date: string, tz?: number, hour?: number): Promise<DayResponse> {
    return this.get<DayResponse>("/day", {
      date,
      tz,
      hour,
    });
  }

  days(from: string, to: string, tz?: number): Promise<DaysResponse> {
    return this.get<DaysResponse>("/days", {
      from,
      to,
      tz,
    });
  }

  month(year: number, month: number, tz?: number): Promise<MonthResponse> {
    return this.get<MonthResponse>("/month", {
      year,
      month,
      tz,
    });
  }

  napam(name: string): Promise<NapAmResponse> {
    return this.get<NapAmResponse>("/napam", { name });
  }

  chiRelations(chi: string): Promise<ChiRelationsResponse> {
    return this.get<ChiRelationsResponse>("/chi/relations", { chi });
  }

  compat(date: string, tz?: number, userYear?: number): Promise<CompatResponse> {
    return this.get<CompatResponse>("/compat", {
      date,
      tz,
      userYear,
    });
  }

  tietKhi(date: string, tz?: number): Promise<TietKhiResponse> {
    return this.get<TietKhiResponse>("/tietkhi", {
      date,
      tz,
    });
  }

  tietKhiYear(year: number, tz?: number): Promise<TietKhiYearResponse> {
    return this.get<TietKhiYearResponse>("/tietkhi/year", {
      year,
      tz,
    });
  }

  ngayKy(date: string, tz?: number): Promise<NgayKyResponse> {
    return this.get<NgayKyResponse>("/ngayky", {
      date,
      tz,
    });
  }

  saoTu(date: string, tz?: number): Promise<SaoTuResponse> {
    return this.get<SaoTuResponse>("/saotu", {
      date,
      tz,
    });
  }

  thanSat(date: string, tz?: number): Promise<ThanSatResponse> {
    return this.get<ThanSatResponse>("/thansat", {
      date,
      tz,
    });
  }

  warnings(query: WarningsQuery): Promise<WarningsResponse> {
    return this.get<WarningsResponse>("/warnings", query);
  }

  pick(query: PickQuery): Promise<PickResponse> {
    return this.get<PickResponse>("/pick", query);
  }

  solarToLunar(payload: ConvertRequest): Promise<ConvertResponse> {
    return this.post<ConvertResponse, ConvertRequest>(
      "/convert/solar-to-lunar",
      payload
    );
  }

  lunarToSolar(payload: ConvertRequest): Promise<ConvertResponse> {
    return this.post<ConvertResponse, ConvertRequest>(
      "/convert/lunar-to-solar",
      payload
    );
  }

  private get<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    return this.request<T>("GET", path, {
      query,
    });
  }

  private post<T, TBody extends Record<string, unknown>>(
    path: string,
    body: TBody
  ): Promise<T> {
    return this.request<T>("POST", path, {
      body,
    });
  }

  private buildUrl(path: string, query?: Record<string, unknown>): URL {
    const normalizedPrefix = this.apiPrefix.startsWith("/")
      ? this.apiPrefix
      : `/${this.apiPrefix}`;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${normalizedPrefix}${normalizedPath}`, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
      }
    }

    return url;
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    options?: {
      query?: Record<string, unknown>;
      body?: Record<string, unknown>;
    }
  ): Promise<T> {
    const url = this.buildUrl(path, options?.query);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers: Record<string, string> = {
      ...this.headers,
    };

    let bodyText: string | undefined;

    if (method === "POST") {
      headers["content-type"] = headers["content-type"] ?? "application/json";
      bodyText = JSON.stringify(options?.body ?? {});
    }

    let response: Response;

    try {
      response = await this.fetchImpl(url, {
        method,
        headers,
        signal: controller.signal,
        body: bodyText,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AmLichError(
            `Request timed out after ${this.timeoutMs}ms while calling ${method} ${url.pathname}`
        );
      }

      throw new AmLichError(
        error instanceof Error ? error.message : "Network request failed",
        { data: error }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await this.parseResponseBody(response);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as Record<string, unknown>).message)
          : `Request failed with status ${response.status}`;

      throw new AmLichError(message, {
        status: response.status,
        data,
      });
    }

    return data as T;
  }
}
