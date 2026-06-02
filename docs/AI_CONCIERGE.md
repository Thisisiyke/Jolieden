# Jolieden AI Concierge — engineering deep-dive

> The headline feature gets its own document. Pairs with [ARCHITECTURE.md §5](./ARCHITECTURE.md#5-ai-concierge-architecture-the-headline) (broad architecture) and [MVP_SCOPE.md](./MVP_SCOPE.md) (Phase 2 deliverables).

---

## 1. What the Concierge actually does

A client texts the Jolieden number. The AI:

1. Reads the message + conversation history.
2. Loads who the client is + their booking history + preferences from Postgres.
3. Picks one of: respond with a natural-language reply, call a tool (e.g. `read_availability`), or escalate to a human.
4. Sends the response via Twilio.
5. Logs every step for compliance + tuning.

The product proposition to Diéssou: **>90% of SMS volume handled without staff touching it; the 10% that needs a human gets routed instantly with full context.**

---

## 2. System prompt

The exact prompt below ships in production. Audit + edit via `/owner/knowledge` UI.

````
You are Jolieden's AI booking concierge. You handle SMS conversations on behalf of the salon.

# Voice & tone

Jolieden is a warm, intimate, Senegalese-American salon in Harlem. The owner, Diéssou, treats every client like family. You write the way Diéssou would text — direct, warm, low-key, never robotic. Use first names. Skip filler. Skip emojis unless the client uses them first; then match their energy.

Examples of voice:
✓ "Hi Aaliyah! I see Oumou has 10am Saturday — same boho ends you got last time. Want me to lock it?"
✓ "Saturday morning is fully booked, but I can put you first on the waitlist. Or Naomi K. has a 2pm Friday open."
✗ "Greetings! I am the AI booking assistant for Jolieden. How may I assist you today?"

# What you can do (use tools)

You have access to these tools — call them when needed instead of guessing:
- read_availability(date_window, service_slug, staff_slug?, time_of_day?) — check open slots
- commit_booking(client_id, service_slug, staff_id, start_at, modifier_choices?, addon_slugs?) — actually book the appointment
- lookup_client_history(client_id, limit?) — pull past visits + preferences
- search_knowledge_base(query) — RAG search of salon policies, prices, hours, prep guides
- create_waitlist_entry(service_category, date_window, ...) — add client to waitlist when no slots available
- escalate(reason, summary, suggested_staff_slug?) — hand off to a human

# When to use tools (the rules)

ALWAYS:
- Call read_availability before proposing a time
- Call lookup_client_history to personalize (greet by name, reference past stylist, anticipate the usual)
- Call search_knowledge_base when asked about prices, policies, prep, hours
- Call commit_booking only after the client says yes to a specific slot

NEVER:
- Commit a booking without explicit confirmation (yes / sounds good / lock it in)
- Quote a price without checking the knowledge base or the service catalog
- Promise a slot you haven't verified with read_availability
- Make up policies — search first, escalate if missing

# When to escalate

Escalate via the escalate tool when:
- The message contains anger/complaint signals ("upset", "ruined", "wasted", "ridiculous", "refund")
- The request is for custom pricing (e.g. unusual color request, hybrid services)
- read_availability returns zero slots AND the client declines the waitlist (offer create_waitlist_entry first)
- The client asks for a refund or cancellation within the 48-hour penalty window
- The client asks 3+ times and you can't resolve
- search_knowledge_base returns nothing matching
- You are not >85% sure of your answer (estimate honestly)

Don't pre-apologize when escalating — just say "Let me get [stylist/Diéssou] for this — one sec."

# Style of replies

- Short. SMS is not email. 2-3 sentences usually.
- Confirm bookings explicitly with all details (date, time, stylist, service, price, duration).
- After booking, tell them: confirmation text, what to do next (deposit auto-charged, reminder 24h before), anything to bring.
- For policies, quote the knowledge base verbatim — don't paraphrase pricing.

# Multi-language

If the client writes in French (e.g. "salut, j'aimerais réserver"), respond in French. Same warmth. Same brevity. Use Diéssou-style French: "Salut Aaliyah ! Oumou a samedi 10h, c'est la même coiffure que la dernière fois. Je bloque ?"

For Wolof or other languages outside English/French: escalate with reason="unknown" and let a human handle it.

# Safety

- Never invent appointment times, prices, or stylist availability. Use tools.
- Never share other clients' info, even by implication.
- Never argue with a complaint. Acknowledge + escalate.
- Don't reveal you're an AI unless directly asked: if asked, say "I'm Jolieden's text assistant — happy to help, and I'll loop in Diéssou the moment anything's tricky."

# Output format

Reply with one natural-language message OR one or more tool calls. After tool results come back, generate the final reply for the client.

If the conversation history shows you already greeted the client, don't greet again. Pick up where the conversation left off.
````

This prompt clocks at ~700 tokens. Per-conversation, that's $0.0021 at Sonnet's input rate (with caching: $0.00021).

---

## 3. Tools — full schemas

### 3.1 `read_availability`

```json
{
  "name": "read_availability",
  "description": "Find open booking slots that match a client request. Returns an array of available slots ordered by best-fit (preferred stylist + closest time match first).",
  "input_schema": {
    "type": "object",
    "properties": {
      "date_window": {
        "type": "object",
        "properties": {
          "from": { "type": "string", "format": "date" },
          "to":   { "type": "string", "format": "date" }
        },
        "required": ["from", "to"]
      },
      "service_slug": {
        "type": "string",
        "description": "The catalog slug (e.g. 'xs-knotless-braids', 'silk-press'). If client said 'braids' generically, infer the closest service based on their history."
      },
      "staff_slug": {
        "type": "string",
        "description": "Optional. Pass the client's preferred stylist slug if mentioned or known."
      },
      "time_of_day": {
        "type": "string",
        "enum": ["morning", "afternoon", "evening", "any"],
        "default": "any"
      },
      "duration_min_override": {
        "type": "number",
        "description": "Optional. Override the catalog default if the client explicitly needs longer."
      }
    },
    "required": ["date_window", "service_slug"]
  }
}
```

Returns:
```json
{
  "slots": [
    {
      "start_at": "2026-05-31T14:00:00-04:00",
      "end_at": "2026-05-31T21:00:00-04:00",
      "staff_id": "uuid",
      "staff_name": "Oumou D.",
      "estimated_price_cents": 39500,
      "duration_min": 420
    }
  ],
  "total_open": 3,
  "next_available_after_window": "2026-06-07"
}
```

**Availability computation rules** (the slot-finder algorithm):

The implementation finds open slots by subtracting all of the following from each staff member's working hours:
1. Existing `appointments` in live statuses (`unconfirmed`, `confirmed`, `arrived`, `active`, `completed`) — the same set that's excluded by the `appointments_no_overlap` constraint in [ARCHITECTURE §4.4.1](./ARCHITECTURE.md#441-the-book_appointment-rpc--concurrency-strategy).
2. `shifts.break_started_at` blocks — if a stylist is on a scheduled break, that range is unavailable.
3. Hard blocks from `shifts` where `status = 'on_break'` or `status = 'off'`.
4. Location-level closures from `locations.hours_json` (e.g. Sunday closed) and holiday closures from the `holiday_closures` table.

The algorithm walks each day in `date_window`, generates candidate start times at 15-min intervals within the staff's `shifts.scheduled_start_at`/`scheduled_end_at`, checks `start + service.base_duration_min + processing_time_min` fits before any block, and returns the first 10 slots ordered by:
- Match score: `(staff_match_weight * preferred_staff_bonus) + (time_match_weight * proximity_to_requested_time)`
- Ties broken by earliest `start_at`

If the search returns 0 slots: the AI is instructed (system prompt §When to escalate) to offer the waitlist via `create_waitlist_entry` *or* call `read_availability` again with a widened window before escalating.

### 3.2 `commit_booking`

```json
{
  "name": "commit_booking",
  "description": "Lock in an appointment. Charges deposit immediately via Stripe. Returns the appointment_id and confirmation details.",
  "input_schema": {
    "type": "object",
    "properties": {
      "client_id": { "type": "string", "description": "UUID from conversation context." },
      "service_slug": { "type": "string" },
      "staff_id": { "type": "string" },
      "start_at": { "type": "string", "format": "date-time" },
      "modifier_choices": {
        "type": "object",
        "description": "Map of modifier_id → option_value. E.g. {'length':'waist','color':'1B-27','parting':'triangle'}",
        "additionalProperties": { "type": "string" }
      },
      "addon_slugs": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Add-on service slugs to include."
      }
    },
    "required": ["client_id", "service_slug", "staff_id", "start_at"]
  }
}
```

Returns:
```json
{
  "appointment_id": "uuid",
  "confirmation_summary": "Sat May 31 · 10am-5pm · Oumou D. · XS Knotless Braids · $395 · $25 deposit charged",
  "deposit_charged_cents": 2500,
  "next_steps": [
    "Reminder text 24h before",
    "Comp Wash & Blow auto-applied (birthday week)"
  ]
}
```

If Stripe deposit fails: returns `{ error: "deposit_failed", reason: string }` and the AI must apologize + offer to retry.

### 3.3 `lookup_client_history`

```json
{
  "name": "lookup_client_history",
  "description": "Pull this client's past visits, preferred stylist, hair preferences, and recent activity. Use to personalize replies.",
  "input_schema": {
    "type": "object",
    "properties": {
      "client_id": { "type": "string" },
      "limit": { "type": "number", "default": 5 }
    },
    "required": ["client_id"]
  }
}
```

Returns:
```json
{
  "first_name": "Aaliyah",
  "tags": ["Loyalist", "VIP"],
  "preferred_stylist_id": "uuid",
  "preferred_stylist_name": "Oumou D.",
  "lifetime_spend_cents": 165500,
  "rewards_tier": "Silver",
  "rewards_points": 1165,
  "birthday_within_30d": false,
  "last_visits": [
    {
      "date": "2026-04-13",
      "service": "XS Knotless Braids",
      "staff": "Mame Diarra",
      "modifier_choices": {"length": "waist", "color": "1B-27", "parting": "triangle", "ends": "boho"},
      "price_cents": 39500,
      "notes": "Took longer than expected — schedule extra 30 min next time"
    }
  ],
  "avg_visit_frequency_days": 56,
  "next_visit_recommended_at": "2026-06-08",
  "accommodations": {
    "scalp_sensitivities": null,
    "allergies": null
  }
}
```

### 3.4 `search_knowledge_base`

```json
{
  "name": "search_knowledge_base",
  "description": "RAG search over salon documents (hours, pricing, policies, prep instructions, FAQs). Returns the top 3 most relevant document chunks with their source. Use verbatim quotes for pricing and policy answers.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The user's question, slightly normalized. E.g. 'cancellation policy' or 'silk press prep'."
      }
    },
    "required": ["query"]
  }
}
```

Returns:
```json
{
  "chunks": [
    {
      "id": "doc-cancellation-v3",
      "title": "Cancellation Policy",
      "body": "Cancellations 48 hours or more before your appointment are free. Within 24-48 hours, a $25 cancellation fee applies. Within 24 hours or no-shows: full deposit forfeited.",
      "source": "Policies · updated 2026-03-14",
      "similarity": 0.91
    }
  ]
}
```

If `chunks.length === 0` or top similarity < 0.6, the AI should call `escalate(reason="unknown", summary="Asked about X — no knowledge base match.")`.

### 3.5 `create_waitlist_entry`

```json
{
  "name": "create_waitlist_entry",
  "description": "Add the client to the waitlist for a service when no immediate availability exists. Use BEFORE escalating to a human when the client wants something specific and we can offer the waitlist as the next-best option. Returns the queue position estimate.",
  "input_schema": {
    "type": "object",
    "properties": {
      "client_id": { "type": "string", "description": "UUID from conversation context. Pass null if Unknown caller." },
      "contact_phone": { "type": "string", "description": "E.164 — used when client_id is null." },
      "service_category": {
        "type": "string",
        "enum": ["braids", "weaves", "silk-press", "natural", "color", "cuts", "treatments"]
      },
      "preferred_service_slug": { "type": "string" },
      "preferred_staff_slug": { "type": "string", "description": "Optional preferred stylist." },
      "date_window": {
        "type": "object",
        "properties": {
          "from": { "type": "string", "format": "date" },
          "to":   { "type": "string", "format": "date" }
        },
        "required": ["from", "to"]
      },
      "time_of_day": {
        "type": "string",
        "enum": ["morning", "afternoon", "evening", "any"]
      }
    },
    "required": ["service_category", "date_window"]
  }
}
```

Returns:
```json
{
  "waitlist_entry_id": "uuid",
  "estimated_queue_position": 3,
  "estimated_notification_window_days": 5,
  "expires_at": "2026-06-15T00:00:00Z"
}
```

Writes to the `waitlist_entries` table ([ARCHITECTURE Appendix A.12](./ARCHITECTURE.md#a12-waitlist_entries)). Source is set to `'ai_escalation'`. The 15-min cron from that appendix handles notification when a matching slot opens.

After calling this tool, the AI confirms in natural language: *"You're on the waitlist for Saturday morning braids — slot 3 in line. We text you the second something opens. Anything else I can help with?"*

### 3.6 `escalate`

```json
{
  "name": "escalate",
  "description": "Hand the conversation off to a human staff member. Use when (a) sentiment is angry/complaint, (b) custom pricing/color question, (c) no availability and waitlist refused, (d) refund/cancellation within penalty window, (e) request outside catalog, (f) confidence < 0.85.",
  "input_schema": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "enum": ["complaint", "custom_pricing", "no_availability", "cancellation", "policy_question", "lost_item", "unknown"]
      },
      "summary": {
        "type": "string",
        "description": "1-sentence brief for the human picking it up. Include the key constraint or ask."
      },
      "suggested_staff_slug": {
        "type": "string",
        "description": "Optional. Your guess at who should handle. e.g. color question → 'dieynaba-d'. Owner-level → 'diessou'."
      }
    },
    "required": ["reason", "summary"]
  }
}
```

Returns:
```json
{ "escalated": true, "assigned_to_staff_id": "uuid or null", "expected_response_within_minutes": 60 }
```

After calling `escalate`, the AI sends one final message to the client: *"Let me get [name] for this — one sec."*

---

## 4. Knowledge base structure

### 4.1 Document + chunk shape

Knowledge base is split into two tables: `knowledge_documents` holds the authored Markdown, `knowledge_chunks` holds the embedded segments. **Embedding lives on the chunk, not the document.** This is the canonical model; see [ARCHITECTURE.md Appendix A.7](./ARCHITECTURE.md#a7-knowledge_documents--embeddings-see-ai_conciergemd-4) for full DDL including the versioning table.

Summary shape:

- `knowledge_documents` — `title`, `body_md`, `source_label`, `category`, `active`, `authored_by_staff_id`, `updated_at`. No embedding column.
- `knowledge_chunks` — `document_id fk`, `chunk_index`, `content text`, `embedding vector(1536)`. Indexed `ivfflat (embedding vector_cosine_ops) with (lists = 100)`. Composite unique `(document_id, chunk_index)` so re-embedding is idempotent.
- `knowledge_document_versions` — full body history per edit, with `updated_by_staff_id` for audit.

### 4.2 Chunking + embedding pipeline

- Documents authored as Markdown via `/owner/knowledge` UI (Diéssou writes; staff edits).
- Each document chunked into 400-token segments with 50-token overlap.
- Chunks embedded with **OpenAI `text-embedding-3-small`** (cheap, good quality; can swap for Voyage AI later for first-party AI consistency).
- Pipeline runs on `INSERT/UPDATE` of `knowledge_documents`: a Supabase Edge Function trigger deletes existing `knowledge_chunks` for that document, re-chunks, calls OpenAI embeddings in batch, inserts new chunks. (This is one of the *only* places we use Supabase Edge Functions per §4.1 of the architecture doc.)

### 4.3 Day-1 knowledge base seeds

| Document | Source | Update cadence |
|---|---|---|
| Cancellation policy | Diéssou | Quarterly |
| Deposit policy | Diéssou | Quarterly |
| Late arrival policy | Diéssou | Quarterly |
| Service prices (auto-generated from `services` table) | DB | Live |
| Stylist bios + specialties (auto from `staff`) | DB | Live |
| Pre-visit prep instructions per service | Diéssou | Quarterly |
| Salon hours per location | DB | Live |
| Holiday closures | Diéssou | As needed |
| Common FAQs (parking, kids welcome, water/snacks, etc.) | Diéssou + staff | Monthly review |
| Product retail catalog + prices | DB | Live |

### 4.4 Versioning

- Every document edit creates a new version row.
- AI logs which version of which doc it cited per response.
- Lets Diéssou audit *"Why did the AI say X about cancellations?"* → trace to document version.

---

## 5. Escalation logic

### 5.1 Decision tree (executed each AI turn)

```
1. Run sentiment classifier (e.g. small fine-tuned model on Hugging Face, or Claude-Haiku-as-classifier)
   if sentiment_negative > 0.7 → escalate(reason="complaint", auto)

2. Check for hardcoded escalation keywords
   "refund", "manager", "ridiculous", "lawsuit", "BBB", "Google review" → escalate

3. Let Claude reason with tools (system prompt §5 has the rules)
   Claude may call escalate() autonomously

4. Confidence guardrail: after a commit_booking tool call,
   if Claude's text confidence (logprob average or self-reported) < 0.85
   → swap commit_booking for a "Confirm this booking?" message instead of auto-committing
```

### 5.2 Sentiment classifier

For Phase 2 launch: use **Anthropic Claude Haiku** as a one-shot classifier. Send the client's last message + 1-shot prompt: *"Classify the sentiment: complaint/anger/neutral/positive. Output only the label."* Cost: ~$0.00005 per message. Latency: ~300ms. Cheap enough to run on every turn.

For Phase 3+: train a tiny BERT classifier on the salon's actual labeled corpus (~2k labeled examples by end of Phase 2). Faster (~30ms), cheaper ($0).

### 5.3 Hardcoded keyword triggers (override Claude's judgment)

```typescript
const ESCALATE_KEYWORDS = [
  "refund", "manager", "owner",
  "ridiculous", "unacceptable",
  "lawsuit", "lawyer", "attorney",
  "bbb", "better business bureau",
  "google review", "yelp review",
  "discrimination", "racist", "sexual",
];
```

If any matches (case-insensitive, word boundary): escalate immediately with `reason="complaint"`, route to owner (`diessou`).

### 5.4 Escalation routing

```
reason → suggested_staff_slug → assignment
─────────────────────────────────────────────
complaint            → diessou       → owner gets push immediately
custom_pricing       → service-matched stylist → e.g. color question routes to Dieynaba
no_availability      → front desk    → can offer waitlist or manual override
cancellation         → diessou       → owner authorizes refund policy exceptions
policy_question      → manager on duty → front-desk shift lead
lost_item            → front desk    → standard
unknown              → diessou       → owner reads + decides
```

Routing logic lives in an Edge Function `route_escalation` that:
1. Reads `suggested_staff_slug`
2. Confirms the suggested staff is on-shift right now
3. If not, falls back to "manager on duty" via `shifts` table
4. Sends Expo push + updates conversation row

---

## 6. Twilio plumbing

### 6.1 Inbound message flow

> **Host:** Twilio's webhook lands on a Next.js API route at `https://app.jolieden.com/api/twilio/inbound` (Vercel). All AI Concierge server logic lives there — see [ARCHITECTURE.md §4.1](./ARCHITECTURE.md#41-convention-single-host-for-application-logic) for why we picked Vercel API routes over Supabase Edge Functions for application logic.

```
Client texts (646) 555-0100
   │
   ▼
Twilio receives, POSTs to:
  https://app.jolieden.com/api/twilio/inbound  (Next.js API route)
   │
   ▼
Route handler (the "AI worker"):
  1. Validate Twilio signature
  2. Find or create Conversation row (match by phone)
  3. Insert Message row (from="client")
  4. Update conversations.ai_state = "ai_replying"
  5. Broadcast realtime event (operator inbox shows pulse)
  6. Invoke Claude (see §7 below)
  7. Insert Message row(s) for AI response
  8. POST response back to Twilio:
     POST https://conversations.twilio.com/v1/Conversations/{sid}/Messages
  9. Update conversations.ai_state = "ai_handled" or "needs_human"
```

### 6.2 Outbound (AI initiated)

Same Edge Function pattern, but invoked by:
- Cron jobs (reminders, follow-ups, birthdays)
- Stylist takeover ("AI hands off, AI sends final message")
- Manual operator send

Always go through the `messages` table + Twilio. Never bypass.

### 6.3 10DLC registration

Required for US business SMS. Diéssou must complete:
1. **Brand registration** with The Campaign Registry (~$4 one-time + $2/mo)
2. **Campaign registration** per use case (transactional + marketing separately)
3. **Vetting** — Twilio walks through; 4-6 week approval

**Do this on Day 1 of Phase 1.** Without it, US carriers throttle or block SMS at production volume.

### 6.4 MMS

- Inbound: client photos arrive as Twilio media URLs. Edge Function downloads → uploads to Cloudflare R2 → stores in `messages.attachments`.
- Outbound: send R2-hosted URLs. Carriers may strip URLs >2MB; resize before sending.

---

## 7. Conversation loop (worked example)

Full trace of one conversation, including tool calls.

### 7.1 Inbound

Client `Aaliyah Jackson` (`client_id=uuid-aj`) texts: **"hey it's aaliyah! i'm due for my knotless again, can i get oumou next sat?"**

### 7.2 Edge Function flow

```python
# Pseudocode
on_twilio_inbound(payload):
    convo = find_or_create_conversation(phone=payload.from)
    insert_message(convo, from="client", body=payload.body)

    set_state(convo, "ai_replying")
    broadcast_realtime(convo)

    # Run sentiment + keyword check first
    if sentiment_negative(payload.body) > 0.7 or any_keyword_hit(payload.body):
        escalate_immediately()
        return

    # Call Claude with full context
    response = claude.messages.create(
        model="claude-sonnet-4-20250514",
        system=JOLIEDEN_SYSTEM_PROMPT,
        max_tokens=1024,
        tools=TOOLS,
        messages=load_conversation_history(convo) + extra_context(convo.client_id),
    )

    # Process tool calls in a loop until Claude returns final text
    while response.stop_reason == "tool_use":
        tool_results = []
        for tool_call in response.content:
            if tool_call.type == "tool_use":
                result = run_tool(tool_call.name, tool_call.input, convo)
                tool_results.append({"tool_use_id": tool_call.id, "content": result})

        response = claude.messages.create(
            model="claude-sonnet-4-20250514",
            system=JOLIEDEN_SYSTEM_PROMPT,
            max_tokens=1024,
            tools=TOOLS,
            messages=load_conversation_history(convo) + extra_context(convo.client_id) + [
                {"role": "assistant", "content": response.content},
                {"role": "user", "content": tool_results},
            ],
        )

    # Final text response
    final_text = "".join(b.text for b in response.content if b.type == "text")
    insert_message(convo, from="ai", body=final_text, tool_calls=trace)
    twilio_send(convo, final_text)

    set_state(convo, "ai_handled")
    broadcast_realtime(convo)
```

### 7.3 Tool trace for the example

```
Turn 1 - Client: "hey it's aaliyah! i'm due for my knotless again, can i get oumou next sat?"

Turn 2 - Claude (thinking) calls:
  lookup_client_history(client_id="uuid-aj")

  → Returns: { first_name: "Aaliyah", preferred_stylist: "Oumou D.",
               last_visits: [{ service: "XS Knotless Braids", staff: "Mame Diarra",
                               modifier_choices: { length: "waist", color: "1B-27",
                                                   parting: "triangle", ends: "boho" }}],
               avg_visit_frequency_days: 56 }

Turn 3 - Claude calls:
  read_availability(
    date_window: { from: "2026-05-30", to: "2026-05-31" },
    service_slug: "xs-knotless-braids",
    staff_slug: "oumou-d",
    time_of_day: "any"
  )

  → Returns: { slots: [
      { start_at: "2026-05-31T10:00:00-04:00", staff_name: "Oumou D.",
        estimated_price_cents: 39500, duration_min: 420 },
      { start_at: "2026-05-31T14:30:00-04:00", staff_name: "Oumou D.",
        estimated_price_cents: 39500, duration_min: 420 }
    ]}

Turn 4 - Claude generates text:
  "Hi Aaliyah! Oumou has 10am or 2:30pm open on Sat May 31. Same XS knotless,
   boho ends, 1B/27 like last time? It's the rebook your last visit recipe.
   Want me to lock it in?"

Turn 5 - Sent to client via Twilio.

─────────────────────

Turn 6 - Client: "yes exactly. 10am pls"

Turn 7 - Claude calls:
  commit_booking(
    client_id: "uuid-aj",
    service_slug: "xs-knotless-braids",
    staff_id: "uuid-oumou",
    start_at: "2026-05-31T10:00:00-04:00",
    modifier_choices: { length: "waist", color: "1B-27",
                        parting: "triangle", ends: "boho" }
  )

  → Returns: { appointment_id: "uuid-new",
               confirmation_summary: "Sat May 31 · 10am-5pm · Oumou D. · XS Knotless Braids · $395",
               deposit_charged_cents: 2500 }

Turn 8 - Claude generates text:
  "Locked in: Sat May 31 at 10am with Oumou. XS Knotless, boho ends, 1B/27.
   $395. $25 deposit just hit your card on file. I'll text you a reminder
   24h before. See you Saturday."

Turn 9 - Sent. State: ai_handled. Booking on calendar with ai_booked=true.
```

Total elapsed: ~12s end-to-end. 3 tool calls. Cost: $0.04.

---

## 8. Cost monitoring

### 8.1 Per-conversation budget

Target: **<$0.10 all-in (LLM + SMS)**. If avg breaches this for 7 consecutive days, alert.

Per-message breakdown:
- Input tokens (with caching): ~3,000 × $0.30/M = $0.0009
- Output tokens: ~800 × $15/M = $0.012
- Tool calls (avg 2 per convo): inferred in above
- Twilio inbound: $0.0075
- Twilio outbound: $0.0075 × avg 2 replies = $0.015
- 10DLC carrier fee: $0.004 per outbound
- **All-in per conversation: ~$0.04**

### 8.2 Per-conversation metrics tracked

```sql
create table conversation_metrics (
  conversation_id uuid pk,
  total_messages int,
  total_tool_calls int,
  total_input_tokens int,
  total_output_tokens int,
  total_cents_anthropic int,
  total_cents_twilio int,
  ai_first_reply_ms int,
  ai_full_resolution_ms int,
  escalated bool,
  escalation_reason text,
  final_state text,         -- ai_handled | needs_human | abandoned
  client_sentiment_at_end text
);
```

### 8.3 Dashboards (live)

- **`/messages/analytics`** in operator app: 7-day rolling resolution rate, avg response time, escalation breakdown, cost-per-conversation trend.
- Cron job nightly: roll up into materialized view for the dashboard.
- Slack alert: if escalation rate >25% for 24h consecutive, page Diéssou (something's broken — knowledge base gap or LLM regression).

---

## 9. Multi-language

### 9.1 Day-1 (English + French)

- French detection: language ID call (we use **lingua-py** or Claude itself with cheap Haiku call).
- Reply in detected language.
- Knowledge base: maintain English documents authoritative; auto-translate to French via Claude on author/edit; cache.
- All system prompt voice rules apply equally to French (warm, Diéssou-style).

### 9.2 Phase 3 (Wolof)

- Limited Claude coverage. Approach: detect Wolof → send to a translation step (DeepL or Claude with explicit Wolof prompt) → respond.
- Caveat: nuance can suffer. Set expectation with Diéssou.

### 9.3 French internal staff channel

- Separate Twilio channel for staff-to-staff coordination in French (Senegalese braiders prefer French).
- AI in this channel: same Claude model but with a different system prompt focused on operational queries (e.g. *"Quel est le prochain rendez-vous d'Oumou ?"* → schedule lookup).
- Not Day 1. Phase 2 or later.

---

## 10. Testing strategy

### 10.1 Eval suite

Maintain a corpus of ~200 example client messages with expected behavior:
- Each example: `{ inbound, expected_tool_calls, expected_response_traits, should_escalate }`
- Run before every prompt or knowledge-base change.
- Pass rate must stay >90% on the regression set.

Example test cases:
```typescript
const TESTS = [
  {
    name: "Aaliyah rebook",
    inbound: "hey it's aaliyah! i'm due for my knotless again, can i get oumou next sat?",
    client_context: { /* Aaliyah's profile */ },
    expected_tool_calls: ["lookup_client_history", "read_availability"],
    expected_response_traits: {
      mentions_oumou: true,
      offers_specific_slot: true,
      references_last_visit: true
    },
    should_escalate: false
  },
  {
    name: "Angry complaint",
    inbound: "my braids unraveled in 3 days. this is unacceptable. i want a refund.",
    client_context: { /* anyone */ },
    expected_tool_calls: ["escalate"],
    expected_response_traits: {
      escalation_reason: "complaint",
      assigned_to: "diessou",
      no_arguing: true
    },
    should_escalate: true
  },
  // ...198 more
];
```

### 10.2 Production drift detection

- Sample 1% of real conversations daily.
- Human reviewer (Diéssou or trained manager) labels: AI handled correctly? Y/N + notes.
- If accuracy drops below 92% over 7 days, freeze prompt changes until investigated.

### 10.3 Failure mode catalog

| Failure | Detection | Mitigation |
|---|---|---|
| Claude hallucinates a price | Compare quoted prices against `services.base_price_cents` | Strip price mentions; require knowledge_base tool call |
| Claude books a slot that's not actually open | Stripe-deposit failure or staff calendar conflict | `commit_booking` must re-check availability inside the transaction |
| Knowledge base misses → bad answer | Escalation rate spikes | Author missing doc; redeploy |
| Twilio throttle | Outbound queue backs up | Alert on queue depth >100 |
| Anthropic API down | API errors > 5/min | Auto-escalate next 30 conversations |
| Cost spike | Per-day spend > $50 | Page on-call; investigate runaway loop |

---

## 11. Author / edit workflow for Diéssou

The AI is only as good as its knowledge base. Diéssou needs to author + edit docs without engineering help.

### 11.1 `/owner/knowledge` UI

- List of all knowledge documents with title, category, last-updated, active toggle.
- Edit screen: Markdown editor, preview pane, "Save & re-embed" button.
- Version history: see who edited what when.
- Test: text input → run an AI dry-run with the current draft → see what the AI would have said.
- Search: live filter as Diéssou types.

### 11.2 Prompt editing

- System prompt lives in a `system_prompts` table, versioned.
- Only `owner` role can edit.
- Test page: send a sample inbound → see the response in real time without committing to live.

### 11.3 Eval-before-deploy

- Saving a prompt or doc edit doesn't auto-deploy.
- Edits enter a "staging" state, run the 200-test eval suite, show pass rate.
- Diéssou clicks "Deploy" only if pass rate is ≥ baseline.

---

## 12. Open questions for Diéssou (AI-specific)

1. **Can the AI commit a booking + charge a deposit without an explicit "yes" from the client?** (Current answer in prompt: NO. Confirm.)
2. **What's the maximum AI response delay before we send a "still thinking, just a sec" message?** (Current: 10s.)
3. **Should the AI ever proactively initiate a conversation?** (Birthday wishes, follow-ups, no-show recovery — all possible, but each needs Diéssou approval.)
4. **For lost-item inquiries, who handles?** (Default: front desk on duty.)
5. **For after-hours messages, does the AI handle 24/7, or send a "we'll reply in the morning" outside business hours?** (Default: 24/7 with a soft note for emergencies.)
6. **Does the AI tell clients it's an AI when directly asked?** (Current: soft acknowledgment — "I'm Jolieden's text assistant." Confirm tone.)
7. **Should the AI offer the waitlist if a slot isn't available, or always escalate?** (Default: offer waitlist first; escalate if refused.)
8. **What's the cost cap before we throttle?** (Default: $50/day per location. Alert + start sampling at 80%.)
9. **For French/Wolof — Day 1 or wait?** (Default: French Day 1, Wolof Phase 3.)
10. **Sentiment classifier — Claude Haiku ($0.00005/msg) or train our own (free but ~$8k engineering)?** (Default: Haiku Phase 2; revisit Phase 3.)

---

*End of AI Concierge spec. See also: [ARCHITECTURE.md](./ARCHITECTURE.md) for broader system; [MVP_SCOPE.md](./MVP_SCOPE.md) for phasing.*
