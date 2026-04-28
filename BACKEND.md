# ASVF — Backend Contract (MERN)

The frontend is complete and uses a localStorage-backed mock at `src/lib/api.ts`. To go live, replace each function body with `fetch()` calls to the endpoints below. Types in `src/lib/types.ts` mirror the Mongoose schemas.

## Folder structure (suggested)

```
backend/
├── src/
│   ├── server.js              # express bootstrap
│   ├── config/db.js           # mongoose connect
│   ├── middleware/
│   │   ├── auth.js            # JWT verify
│   │   └── upload.js          # multer
│   ├── models/                # Mongoose schemas
│   │   ├── Admin.js
│   │   ├── Portfolio.js
│   │   ├── Team.js
│   │   ├── News.js
│   │   ├── Page.js
│   │   └── Settings.js
│   └── routes/                # express routers
│       ├── auth.js
│       ├── portfolio.js
│       ├── team.js
│       ├── news.js
│       ├── pages.js
│       ├── settings.js
│       └── media.js
├── uploads/                   # served statically
└── .env                       # MONGO_URI, JWT_SECRET
```

## REST endpoints

| Method | Path                          | Purpose                          | Auth |
|--------|-------------------------------|----------------------------------|------|
| POST   | `/api/auth/login`             | email + password → MFA challenge | —    |
| POST   | `/api/auth/mfa/verify`        | code → JWT                       | —    |
| GET    | `/api/portfolio`              | list                             | —    |
| POST   | `/api/portfolio`              | create                           | JWT  |
| PATCH  | `/api/portfolio/:id`          | update                           | JWT  |
| DELETE | `/api/portfolio/:id`          | delete                           | JWT  |
| (same shape for `/team`, `/news`)                                          |
| GET    | `/api/pages/:slug`            | get page content                 | —    |
| PATCH  | `/api/pages/:slug`            | update page content              | JWT  |
| GET    | `/api/settings`               | get settings                     | —    |
| PATCH  | `/api/settings`               | update settings                  | JWT  |
| POST   | `/api/media`                  | multipart upload → `{ url }`     | JWT  |

## Sample Mongoose schema

```js
// models/Portfolio.js
import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
  name:        { type: String, required: true, maxlength: 120 },
  logo:        { type: String, default: "" },
  description: { type: String, maxlength: 500 },
  sector:      { type: String, index: true },
  website:     { type: String },
}, { timestamps: true });

export default mongoose.model("Portfolio", PortfolioSchema);
```

```js
// models/Admin.js — bcrypt + TOTP MFA
import mongoose from "mongoose";
const AdminSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },   // bcrypt.hash(pw, 12)
  mfaEnabled:   { type: Boolean, default: true },
  mfaSecret:    { type: String },                   // speakeasy.generateSecret().base32
}, { timestamps: true });
export default mongoose.model("Admin", AdminSchema);
```

```js
// routes/auth.js (sketch)
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";

router.post("/login", async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const challengeId = jwt.sign({ sub: admin._id, mfa: "pending" }, process.env.JWT_SECRET, { expiresIn: "5m" });
  res.json({ mfaRequired: admin.mfaEnabled, challengeId });
});

router.post("/mfa/verify", async (req, res) => {
  const { sub } = jwt.verify(req.body.challengeId, process.env.JWT_SECRET);
  const admin = await Admin.findById(sub);
  const ok = speakeasy.totp.verify({ secret: admin.mfaSecret, encoding: "base32", token: req.body.code, window: 1 });
  if (!ok) return res.status(401).json({ error: "Invalid code" });
  const token = jwt.sign({ sub: admin._id }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});
```

## Key components on the frontend

- `src/components/SiteHeader.tsx` / `SiteFooter.tsx` — shared chrome
- `src/components/admin/Fields.tsx` — reusable `Field` + `MediaUpload`
- `src/lib/api.ts` — single swap point for all backend calls
- `src/lib/types.ts` — TS mirrors of Mongoose schemas

## Demo admin login

- URL: `/admin/login`
- Email: `admin@asvf.com`
- Password: `demo123`
- MFA code: `123456`
