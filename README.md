# amlich-api

TypeScript SDK cho AmLich API.

- Base URL mặc định: `https://amlich.giaphahobe.vn`
- API prefix mặc định: `/api/v1`
- Chạy trên Node.js >= 18 (fetch built-in) và browser

## Cài đặt

```bash
npm i amlich-api
```

## Khởi tạo client

```ts
import { AmLichClient } from "amlich-api";

const api = new AmLichClient({
  baseUrl: "https://amlich.giaphahobe.vn",
  apiPrefix: "/api/v1",
  timeoutMs: 15000,
});
```

Constructor options:

- `baseUrl?: string`
- `apiPrefix?: string`
- `headers?: Record<string, string>`
- `fetchImpl?: typeof fetch`
- `timeoutMs?: number`

## Methods

### Calendar core

```ts
await api.today(7);
await api.day("2026-02-21", 7, 22);
await api.days("2026-03-01", "2026-04-05", 7);
await api.month(2026, 2, 7);
```

- `today(tz?: number)` -> `GET /today`
- `day(date: string, tz?: number, hour?: number)` -> `GET /day`
- `days(from: string, to: string, tz?: number)` -> `GET /days`
- `month(year: number, month: number, tz?: number)` -> `GET /month`

### Tra cứu can chi / tương hợp

```ts
await api.napam("Giáp Tý");
await api.chiRelations("Tý");
await api.compat("2026-02-21", 7, 1987);
```

- `napam(name: string)` -> `GET /napam`
- `chiRelations(chi: string)` -> `GET /chi/relations`
- `compat(date: string, tz?: number, userYear?: number)` -> `GET /compat`

### Tiết khí / ngày kỵ / sao / thần sát

```ts
await api.tietKhi("2026-02-21", 7);
await api.tietKhiYear(2026, 7);
await api.ngayKy("2026-02-21", 7);
await api.saoTu("2026-02-21", 7);
await api.thanSat("2026-02-21", 7);
```

- `tietKhi(date: string, tz?: number)` -> `GET /tietkhi`
- `tietKhiYear(year: number, tz?: number)` -> `GET /tietkhi/year`
- `ngayKy(date: string, tz?: number)` -> `GET /ngayky`
- `saoTu(date: string, tz?: number)` -> `GET /saotu`
- `thanSat(date: string, tz?: number)` -> `GET /thansat`

### Warnings / Pick

```ts
await api.warnings({
  date: "2026-02-21",
  tz: 7,
  userYear: 1987,
  purpose: "khaitruong",
  ruleset: "vn-basic",
});

await api.pick({
  from: "2026-02-20",
  to: "2026-03-15",
  tz: 7,
  purpose: "khaitruong",
  userYear: 1987,
  limit: 5,
  maxDays: 92,
  ruleset: "vn-basic",
});
```

- `warnings(query)` -> `GET /warnings`
- `pick(query)` -> `GET /pick`

### Convert (POST)

```ts
await api.solarToLunar({
  year: 2026,
  month: 2,
  day: 21,
  tz: 7,
});

await api.lunarToSolar({
  year: 2026,
  month: 1,
  day: 14,
  isLeap: false,
  tz: 7,
});
```

- `solarToLunar(payload)` -> `POST /convert/solar-to-lunar`
- `lunarToSolar(payload)` -> `POST /convert/lunar-to-solar`

## Error handling

SDK throw `AmLichError` khi timeout/network error hoặc HTTP status không thành công.

```ts
import { AmLichClient, AmLichError } from "amlich-api";

const api = new AmLichClient();

try {
  await api.today(7);
} catch (error) {
  if (error instanceof AmLichError) {
    console.error(error.status);
    console.error(error.message);
    console.error(error.data);
  }
}
```

## Type notes

Package dùng kiểu `loose but structured`: có field chính + `[k: string]: unknown` để thích ứng khi API thay đổi schema.

## Development

```bash
npm i
npm run dev
npm run build
```

## License

MIT
