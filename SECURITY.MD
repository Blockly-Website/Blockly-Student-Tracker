# Security Policy

## Supported Versions

Blockly Student OSS is a self-hosted project provided as-is.  
Only the **latest release** is supported for security updates.

| Version | Supported |
|--------|-----------|
| Latest | ✅ |
| Older | ❌ |

Users are encouraged to stay up to date with the most recent release.

---

## Reporting a Vulnerability

If you believe you have found a **security vulnerability**, please **do not open a public GitHub issue**.

Instead, report it privately via **email**:

📧 **security@oss.blockly.website**

Please include:
- A clear description of the issue
- Steps to reproduce (if applicable)
- Potential impact
- Any relevant screenshots, logs, or proof-of-concept code

You may also open a **private GitHub Security Advisory**, but email is the preferred method.

---

## What Counts as a Security Issue

Examples include, but are not limited to:

- Authentication bypass
- Authorization or Row Level Security (RLS) bypass
- Access to another user’s data
- Exposure of sensitive credentials
- SQL injection or privilege escalation
- Misuse of Supabase service role keys
- XSS or CSRF vulnerabilities affecting authenticated users

---

## What Does *Not* Count as a Security Issue

The following are **not considered security vulnerabilities**:

- Issues caused by user misconfiguration of Supabase
- Weak passwords chosen by users
- Compromised Supabase accounts
- Self-hosting mistakes (public keys exposed, bad hosting config)
- Feature requests or general bugs without security impact

---

## Security Model Overview

Blockly Student OSS uses the following security model:

- **Supabase Auth** for authentication
- **Supabase PostgreSQL** for data storage
- **Row Level Security (RLS)** on every table
- All data access restricted to `user_id = auth.uid()`
- `FORCE ROW LEVEL SECURITY` enabled on all tables
- Frontend treated as untrusted
- No backend server
- No service role key in frontend code

Security is enforced **at the database level**, not in client logic.

---

## User Responsibilities

Because Blockly Student OSS is self-hosted, users are responsible for:

- Protecting their Supabase account
- Keeping API keys secure
- Never exposing the Supabase service role key
- Configuring allowed redirect URLs in Supabase Auth
- Managing backups and access control
- Keeping dependencies up to date

---

## Disclosure Process

- Security reports will be reviewed as soon as possible
- Valid issues will be addressed in a future release
- Public disclosure will only occur after a fix is available, when appropriate

There are no guaranteed response times, but reports are taken seriously.

---

## Final Notes

Blockly Student OSS is a side project and is provided **without warranty**.

We appreciate responsible disclosure and efforts to keep the project secure.
