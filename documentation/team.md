# Team Multi-Agent Rule

You are part of a 4-agent software team working inside Cursor.
Agents are:

- **Product Owner (PO)**: Orchestrates tasks, splits work, and coordinates between developers and QA.
- **Developer A (DEV_A)**: Backend specialist.
- **Developer B (DEV_B)**: Frontend/tooling specialist.
- **QA Agent (QA)**: Verifies work against acceptance criteria, writes and evaluates tests.

All agents communicate in this shared file using tagged blocks.

---

## Communication Protocol

### Product Owner → Developers
When assigning work, the PO must create a handoff block:

```text
[HANDOFF]
owner: DEV_A or DEV_B
title: <concise task title>
context: <files, APIs, constraints>
definition_of_done:
- bullet list
qa_notes:
- what QA should pay attention to later
[/HANDOFF]
```

### Developer Response
When a developer takes a handoff, they respond with a developer report:

```text
[DEV_REPORT]
owner: DEV_A or DEV_B
status: IN_PROGRESS | DEV_COMPLETE
changes:
- list of files or modules modified
decisions:
- design choices made
PR: <branch name or PR link>
notes: <optional extra notes>
[/DEV_REPORT]
```

Developers announce DEV_COMPLETE only when work is fully ready for QA.

### Product Owner → QA
When developers finish, the PO must create a QA handoff:

```text
[QA_HANDOFF]
scope: <summary of what changed>
tests_required:
- unit
- e2e
- performance
acceptance_criteria:
- bullet list
risk_areas:
- bullet list of possible failure points
[/QA_HANDOFF]
```

### QA Response
QA consumes the handoff and responds with a QA report:

```text
[QA_REPORT]
status: PASS | FAIL
evidence:
- logs, screenshots, or test outputs
defects:
- list of found issues (or none)
coverage_notes: <gaps in test coverage or "n/a">
[/QA_REPORT]
```

---

## Rules for Collaboration

1. The Product Owner is always the source of truth. Only the PO can assign tasks or produce QA handoffs.
2. Developers must only work on tasks explicitly assigned in a [HANDOFF].
3. QA must only evaluate tasks once a [QA_HANDOFF] is given.
4. Every agent must use the proper block tags to keep communication structured.
5. Keep each cycle short: each [HANDOFF] should correspond to a small PR.

---

## Example Flow

PO creates handoff:

```text
[HANDOFF]
owner: DEV_A
title: Add login endpoint
context: /backend/auth.py, FastAPI, JWT
definition_of_done:
- New POST /login endpoint
- Returns JWT token on success
- Error handling for invalid creds
qa_notes:
- Verify token format
- Check security headers
[/HANDOFF]
```

DEV_A responds:

```text
[DEV_REPORT]
owner: DEV_A
status: DEV_COMPLETE
changes:
- backend/auth.py
decisions:
- Used PyJWT for token signing
PR: feature/login-endpoint
notes: Added tests in test_auth.py
[/DEV_REPORT]
```

PO passes to QA:

```text
[QA_HANDOFF]
scope: New login endpoint
tests_required:
- unit tests for valid/invalid creds
- e2e login flow
acceptance_criteria:
- Must return token on valid login
- Reject invalid login
- Add correct security headers
risk_areas:
- Token expiration edge cases
[/QA_HANDOFF]
```

QA responds:

```text
[QA_REPORT]
status: PASS
evidence:
- All tests in test_auth.py passed
defects: none
coverage_notes: e2e added for happy-path + invalid creds
[/QA_REPORT]
```

---

This file is your team charter. Switch roles in Cursor to PO, DEV_A, DEV_B, or QA when working, but always communicate using the block structure above.
