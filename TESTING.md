# CarePlus — คู่มือการทดสอบ

## โครงสร้างไฟล์ทดสอบ

```
tests/
├── unit/
│   ├── setup.ts          # ตั้งค่า jest-dom
│   └── utils.test.ts     # Unit tests (phone, email, rating, tracking code)
└── e2e/
    ├── 01-homepage.spec.ts   # หน้าแรก
    ├── 02-services.spec.ts   # หน้าบริการ
    ├── 03-booking.spec.ts    # หน้าจองบริการ
    ├── 04-tracking.spec.ts   # ติดตามการจอง
    ├── 05-reviews.spec.ts    # รีวิว
    ├── 06-contact.spec.ts    # ติดต่อเรา
    ├── 07-admin.spec.ts      # ระบบ Admin ทั้งหมด
    └── 08-api.spec.ts        # API routes
```

---

## คำสั่งทดสอบ

### Unit Tests (Vitest)
ทดสอบ logic ฝั่ง code เช่น format เบอร์โทร, validate email, คำนวณ rating

```bash
# รันครั้งเดียว
pnpm test

# รันแบบ watch (auto re-run เมื่อแก้โค้ด)
pnpm test:watch
```

### E2E Tests (Playwright)
ทดสอบการใช้งานจริงบน browser — **ต้องรัน dev server ก่อนเสมอ**

```bash
# 1. เปิด dev server (terminal แรก)
pnpm dev

# 2. รัน e2e tests (terminal ที่สอง)
pnpm test:e2e
```

#### ตัวเลือกเพิ่มเติมสำหรับ E2E

```bash
# เปิด UI mode (ดูผลแบบ visual)
pnpm test:e2e:ui

# รันเฉพาะไฟล์ที่ต้องการ
pnpm test:e2e tests/e2e/03-booking.spec.ts

# รันเฉพาะ test ที่ชื่อตรงกับ keyword
pnpm test:e2e --grep "phone number"

# รันแบบ headed (เห็น browser จริง)
pnpm test:e2e --headed

# ดู report หลังจากรัน
pnpm exec playwright show-report
```

### รันทั้งหมดพร้อมกัน

```bash
pnpm test:all
```

---

## ตัวแปรสภาพแวดล้อม (สำหรับ Admin E2E)

ถ้า admin credentials ไม่ใช่ค่า default ให้ตั้ง env ก่อนรัน:

```bash
ADMIN_EMAIL=your@email.com ADMIN_PASS=yourpassword pnpm test:e2e
```

ค่า default: `admin@careplus.com` / `admin123`

---

## สิ่งที่ทดสอบ

| หมวด | จำนวน Tests | ครอบคลุม |
|---|---|---|
| Unit | 23 | phone format, email, rating, tracking code |
| Homepage | 6 | hero, stats, features, services, CTA, ภาษา |
| Services | 4 | โหลดหน้า, cards, ปุ่มจอง, navigate |
| Booking | 11 | form validation, calendar, time slots, employee modal, จองสำเร็จ |
| Tracking | 3 | ค้นหา tracking code, error handling |
| Reviews | 3 | form, star rating, ส่งรีวิว |
| Contact | 3 | form, validation |
| Admin | 18 | login, dashboard, CRUD employees/services/bookings/customers/reviews/translations |
| API | 9 | GET/POST/DELETE ทุก endpoint หลัก |
