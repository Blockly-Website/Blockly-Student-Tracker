# Contributing to Blockly Student OSS

Thanks for your interest in contributing! Blockly Student OSS is a small, open-source side project focused on simplicity, privacy, and reliability.

Please read this guide before opening an issue or pull request.

---

## Project Philosophy

- This is a **single-user, self-hosted app**
- No admin system
- No multi-tenant logic
- No custom backend API
- Security is enforced at the database level (Supabase RLS)
- Simplicity > features

Contributions should align with these principles.

---

## Ways to Contribute

You can contribute by:

- Reporting bugs
- Improving documentation
- Fixing bugs
- Improving UI/UX
- Making performance or accessibility improvements

Large feature proposals should be discussed before implementation.

---

## Before Opening an Issue

Please:

1. Check existing issues
2. Confirm the behavior is reproducible
3. Include:
   - What you expected to happen
   - What actually happened
   - Screenshots or logs if applicable
   - Browser and device info

---

## Pull Request Guidelines

- Keep changes focused and small
- One logical change per pull request
- Follow existing code style and patterns
- Avoid introducing new dependencies unless necessary
- Ensure TypeScript passes (`tsc --noEmit`)
- Ensure linting passes

---

## Database Changes

If your change affects the database:

- Update `supabase/setup.sql`
- Maintain strict Row Level Security
- Every table must include `user_id`
- Every table must enforce `user_id = auth.uid()`

Pull requests that weaken security or RLS guarantees will not be accepted.

---

## Feature Requests

Feature requests are welcome, but not guaranteed to be implemented.

Please understand:
- This is a side project
- Maintenance capacity is limited
- Not all ideas will align with the project goals

---

## Licensing

By contributing, you agree that your contributions will be licensed under the MIT License.
