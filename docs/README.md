# amlich-fastify

API xem ngày (Âm lịch / Can Chi / 12 Trực / Giờ hoàng đạo / Tiết khí) port từ `amlich.py` sang Fastify + TypeScript.

## Run
```bash
npm i
npm run dev
# open http://localhost:3000/health
```

## Swagger / OpenAPI
Mặc định Swagger tắt trong production-like runtime. Bật thủ công bằng env:

```bash
ENABLE_SWAGGER=true npm run dev
```

Mở docs tại:
- `http://localhost:3000/docs`

Basic auth cho docs (optional):
```dotenv
ENABLE_SWAGGER=true
SWAGGER_BASIC_AUTH=true
SWAGGER_USER=admin
SWAGGER_PASS=secret
```

Nếu bật `SWAGGER_BASIC_AUTH=true` nhưng thiếu `SWAGGER_USER` hoặc `SWAGGER_PASS` thì docs vẫn mở bình thường (không crash app).

## Environment
- `DEFAULT_TZ`: timezone mặc định cho các endpoint có tham số `tz` (mặc định `7`, Việt Nam).

Ví dụ `.env`:
```dotenv
DEFAULT_TZ=7
```

## Endpoints
- `GET /api/v1/day?date=YYYY-MM-DD&tz=7&hour=23`
- `GET /api/v1/today`
- `GET /api/v1/month?year=2026&month=2&tz=7`
- `GET /api/v1/napam?name=Giáp%20Tý`
- `GET /api/v1/chi/relations?chi=Ty` (chấp nhận cả `Ty` và `Tý`)
- `GET /api/v1/compat?date=YYYY-MM-DD&tz=7&userYear=1987`
- `GET /api/v1/tietkhi?date=YYYY-MM-DD&tz=7`
- `GET /api/v1/tietkhi/year?year=2026&tz=7`
- `GET /api/v1/ngayky?date=YYYY-MM-DD&tz=7`
- `GET /api/v1/saotu?date=YYYY-MM-DD&tz=7`
- `GET /api/v1/thansat?date=YYYY-MM-DD&tz=7`
- `GET /api/v1/warnings?date=YYYY-MM-DD&tz=7&userYear=1987&purpose=khaitruong`
- `GET /api/v1/pick?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=7&purpose=khaitruong&userYear=1987&limit=10`
- `POST /api/v1/convert/solar-to-lunar`
- `POST /api/v1/convert/lunar-to-solar`

> `tz` là timezone offset theo giờ (VD Việt Nam = 7) để khớp thuật toán gốc.

## Hướng dẫn nhanh

### 1) Xem thông tin 1 ngày cụ thể
```bash
curl "http://localhost:3000/api/v1/day?date=2026-02-21&tz=7&hour=22"
```

Payload có thêm:
- `canChi.napAm.day/year`: nạp âm của can chi ngày/năm.
- `nguHanhDay`: ngũ hành 2 lớp của ngày (`can`, `chi`, `relation`, `note`).
- `chiRelations`: quan hệ địa chi ngày (`tamHop`, `lucXungWith`).
- `almanacPlus.ngayKy`: danh sách ngày kỵ (mảng rỗng nếu không phạm).
- `almanacPlus.sao28Tu`: sao trong hệ Nhị thập bát tú theo JD ngày.
- `almanacPlus.thanSat`: kết quả thần sát từ rule-engine (cát/hung theo mục đích).

### 2) Lấy ngày hôm nay theo giờ server
```bash
curl "http://localhost:3000/api/v1/today"
```

Endpoint tự lấy thời gian local của server và trả đầy đủ `year/month/day/hour/tz` trong `input`.

### 3) Tra nạp âm theo can chi
```bash
curl -G "http://localhost:3000/api/v1/napam" --data-urlencode "name=Giáp Tý"
```

### 4) Tra Tam hợp – Lục xung theo địa chi
```bash
curl "http://localhost:3000/api/v1/chi/relations?chi=Ty"
curl -G "http://localhost:3000/api/v1/chi/relations" --data-urlencode "chi=Tý"
```

### 5) Xem sinh khắc tuổi người dùng với ngày đang xem
```bash
curl "http://localhost:3000/api/v1/compat?date=2026-02-21&tz=7&userYear=1987"
```

Response gồm:
- `user`: can chi năm sinh, nạp âm năm sinh, ngũ hành năm sinh.
- `day`: can chi ngày, ngũ hành ngày, chi ngày.
- `relations.nguHanh`: quan hệ ngũ hành giữa tuổi và ngày.
- `relations.chi`: tam hợp/lục xung giữa chi năm sinh và chi ngày.
- `verdict`: `good | neutral | bad` kèm lý do ngắn gọn.

### 6) Tra tiết khí theo ngày (chuẩn theo mốc đổi tiết)
```bash
curl "http://localhost:3000/api/v1/tietkhi?date=2026-02-21&tz=7"
```

Response gồm:
- `index`, `name`: tiết khí hiện tại.
- `startAt`, `endAt`: thời điểm bắt đầu/kết thúc tiết hiện tại (ISO theo timezone `tz`).
- `next`: tiết khí kế tiếp và thời điểm bắt đầu.
- `secondsToNext`: số giây còn lại tới mốc đổi tiết tiếp theo.

### 7) Tra toàn bộ 24 mốc tiết khí của năm
```bash
curl "http://localhost:3000/api/v1/tietkhi/year?year=2026&tz=7"
```

Response gồm `terms` (24 phần tử) theo thứ tự thời gian tăng dần.

### 8) Tra ngày kỵ theo ngày dương lịch
```bash
curl "http://localhost:3000/api/v1/ngayky?date=2026-02-21&tz=7"
```

Rule hiện có (data-driven):
- Nguyệt kỵ: mùng `5, 14, 23` âm lịch.
- Tam nương: mùng `3, 7, 13, 18, 22, 27` âm lịch.
- Dương công kỵ nhật: theo bảng ngày/tháng âm truyền thống.

### 9) Tra Nhị thập bát tú theo ngày dương lịch
```bash
curl "http://localhost:3000/api/v1/saotu?date=2026-02-21&tz=7"
```

Response gồm:
- `jd`: Julian Day Number của ngày dương lịch.
- `sao28Tu`: thông tin sao (index, tên, hán tự, nhóm cát/hung/bình, việc nên làm/tránh).

### 10) Tra Thần sát theo rule-engine
```bash
curl "http://localhost:3000/api/v1/thansat?date=2026-02-21&tz=7"
```

Rule engine hiện gồm các nhóm chính:
- Rule theo `trực` (cát/hung).
- Rule theo `ngày kỵ`.
- Rule theo `nhị thập bát tú`.
- Rule theo `can chi xung`.
- Rule theo trạng thái cận mốc `tiết khí` chuyển pha.

### 11) Cảnh báo tổng hợp (Warnings)
```bash
curl "http://localhost:3000/api/v1/warnings?date=2026-02-21&tz=7&userYear=1987&purpose=khaitruong"
```

Endpoint tổng hợp cảnh báo từ nhiều nguồn:
- **Ngày kỵ**: phạm Nguyệt kỵ, Tam nương, Dương công kỵ nhật.
- **Thần sát**: các rule cát/hung từ engine thanSat, có thể filter theo `purpose`.
- **Tương hợp tuổi**: nếu truyền `userYear`, tự động check lục xung & ngũ hành với năm sinh.

Query params:
- `date`: YYYY-MM-DD (required)
- `tz`: timezone offset (default 7)
- `userYear`: năm sinh (optional, 1800-2199)
- `purpose`: mục đích (optional): `khaitruong`, `cuoihoi`, `dongtho`, `nhaptrach`, `xuat_hanh`
- `ruleset`: bộ rule (default "vn-basic")

Response:
```json
{
  "input": { "date": "...", "tz": 7, "userYear": 1987, "purpose": "khaitruong", "ruleset": "vn-basic" },
  "level": "good" | "warn" | "bad",
  "summary": ["...", "..."],
  "items": [
    { "type": "ngayKy", "code": "...", "name": "...", "level": "avoid"|"warn", "reason": "..." },
    { "type": "thanSat", "code": "...", "name": "...", "group": "cát"|"hung", "level": "good"|"warn"|"avoid", "appliesTo": [...], "reason": "..." },
    { "type": "compat", "code": "...", "level": "warn"|"bad", "reason": "..." }
  ]
}
```

**Level priority**:
- `bad`: tồn tại ngày kỵ avoid, hoặc thần sát avoid, hoặc tuổi xung khắc nghiêm trọng.
- `warn`: không bad nhưng có cảnh báo nhỏ.
- `good`: không có cảnh báo đặc biệt.

**Summary**: tự động tạo từ top items quan trọng nhất, ưu tiên cảnh báo avoid > bad > warn.

### 12) Chọn ngày tốt (Pick Days)
```bash
curl "http://localhost:3000/api/v1/pick?from=2026-02-20&to=2026-03-15&purpose=khaitruong&userYear=1987&limit=5"
```

Endpoint tìm ngày tốt nhất trong khoảng thời gian dựa trên scoring system toàn diện:

Query params:
- `from`, `to`: date range YYYY-MM-DD (required)
- `purpose`: mục đích (required): `khaitruong`, `cuoihoi`, `dongtho`, `nhaptrach`, `xuat_hanh`
- `tz`: timezone offset (default 7)
- `userYear`: năm sinh để check tương hợp (optional, 1800-2199)
- `limit`: số ngày tốt nhất trả về (default 10, max 60)
- `maxDays`: giới hạn range tối đa (default 92, max 370 ngày)
- `ruleset`: bộ rule (default "vn-basic")

**Scoring system (0-100)**:
- Base score: 60
- **Penalties**:
  - Ngày kỵ avoid: −35
  - Thần sát avoid (match purpose): −25 (max 2 rules)
  - Tuổi không hợp: −20
  - Ngày kỵ warn: −10
  - Thần sát warn (match purpose): −10 (max 2 rules)
  - Sao 28 tú hung: −6
- **Bonuses**:
  - Tuổi hợp: +10
  - Thần sát good (match purpose): +8 (max 2 rules)
  - Sao 28 tú cát: +6
  - ≥6 giờ hoàng đạo: +4
  - ≥4 giờ hoàng đạo: +2

**Verdict**:
- `good`: score ≥ 80
- `ok`: score 60-79
- `avoid`: score < 60

Response:
```json
{
  "input": { "from": "...", "to": "...", "tz": 7, "purpose": "khaitruong", "userYear": 1987, "limit": 5, "maxDays": 92, "ruleset": "vn-basic" },
  "results": [
    {
      "date": "2026-02-24",
      "weekdayName": "Thứ ba",
      "score": 78,
      "verdict": "ok",
      "reasons": ["Thần sát tốt: Sao Phòng cát (+8)", "Sao Phòng cát (+6)", "6 giờ hoàng đạo (+4)", "Tuổi hợp (+10)"],
      "highlights": {
        "thanSatGood": ["Sao Phòng cát"],
        "sao28Tu": "Phòng",
        "gioTotCount": 6
      }
    }
  ],
  "meta": {
    "scannedDays": 25,
    "tookMs": 15
  }
}
```

**Sorting**: kết quả được sắp xếp theo score giảm dần, nếu bằng nhau thì ưu tiên ít cảnh báo avoid hơn, cuối cùng theo ngày tăng dần.


