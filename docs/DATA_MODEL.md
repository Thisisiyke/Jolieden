# Data Model — Jolieden

**Scope:** Single locked schema covering all 7 surfaces (booking site, client app, kiosk, stylist app, owner admin, manager admin, catalog shoot). Postgres-flavored DDL. Multi-tenant from day one via `location_id`.

**Status:** v1 — locked for build planning. Migrations 002+ refine as we encounter business rules during Phase 1.

**Conventions:**

- `id` columns are `uuid` with `gen_random_uuid()` default
- All tables have `created_at timestamptz NOT NULL DEFAULT now()` and `updated_at timestamptz NOT NULL DEFAULT now()`
- Soft-delete via `deleted_at timestamptz NULL` — never hard-delete client/financial records
- All money in **integer cents** (e.g., `$280 = 28000`) to avoid float drift; column type `bigint`
- Multi-tenancy: every business-data row carries `location_id` for RLS-style filtering
- Enum-like values are kept as **text + CHECK constraint** so we can extend without a migration

---

## Domain map

| Domain | Tables | Owner surface |
|---|---|---|
| **Identity & access** | `locations`, `users`, `user_roles`, `sessions` | Owner |
| **Customers** | `clients`, `client_consents`, `client_locations` | Owner, Manager |
| **Staff** | `stylists`, `stylist_locations`, `stylist_schedules`, `breaks` | Owner, Manager, Stylist |
| **Catalog** | `services`, `service_modifier_groups`, `service_modifier_options`, `addons`, `looks`, `look_modifier_presets` | Owner, Site |
| **Booking** | `appointments`, `appointment_lines`, `appointment_modifier_choices`, `availability_slots`, `waitlist_entries` | Site, Client, Manager, Stylist |
| **Floor ops** | `stations`, `station_states`, `assistance_requests` | Manager, Kiosk |
| **Stylist workflow** | `service_progress`, `service_progress_events`, `service_captures` | Stylist, Kiosk |
| **Financial** | `deposits`, `payments`, `refunds`, `tips`, `register_sessions`, `register_transactions`, `commissions` | Owner, Manager |
| **Loyalty** | `memberships`, `membership_tiers`, `rewards_ledger`, `birthday_records` | Owner, Client |
| **Communication** | `concierge_threads`, `concierge_messages`, `escalations`, `app_invites`, `outbound_notifications` | Manager, Stylist |
| **Content** | `hair_journey_entries`, `shoot_signups`, `image_releases`, `shoot_assets` | Client, Stylist, Owner |
| **Quality** | `oopsie_tickets`, `oopsie_events`, `reviews` | Manager |
| **Operations** | `inventory_items`, `inventory_movements` | Manager |
| **Compliance** | `audit_log`, `data_export_requests`, `data_deletion_requests` | All |

---

## 1. Identity & access

```sql
CREATE TABLE locations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,                       -- "Jolieden — Harlem"
  slug             text NOT NULL UNIQUE,                -- "harlem"
  timezone         text NOT NULL,                       -- "America/New_York"
  street_address   text NOT NULL,
  city             text NOT NULL,
  state            text NOT NULL,
  postal_code      text NOT NULL,
  phone_e164       text NOT NULL,
  twilio_sms_number_e164 text NOT NULL,                 -- the salon's outbound number
  open_hours       jsonb NOT NULL,                      -- {mon:{open:"09:00",close:"20:00"}, ...}
  station_count    int NOT NULL CHECK (station_count > 0),
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            citext NOT NULL UNIQUE,
  phone_e164       text UNIQUE,
  email_verified_at      timestamptz,
  phone_verified_at      timestamptz,
  password_hash    text,                                -- null for OTP-only auth
  last_login_at    timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

-- A user can hold multiple roles across locations: owner, manager, stylist, front_desk
CREATE TABLE user_roles (
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id      uuid NOT NULL REFERENCES locations(id),
  role             text NOT NULL CHECK (role IN ('owner','manager','front_desk','stylist','apprentice','viewer')),
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, location_id, role)
);

CREATE TABLE sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL UNIQUE,
  expires_at       timestamptz NOT NULL,
  device_label     text,
  ip_address       inet,
  created_at       timestamptz NOT NULL DEFAULT now(),
  revoked_at       timestamptz
);
```

---

## 2. Customers

```sql
CREATE TABLE clients (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES users(id),       -- null for walk-ins with no app
  primary_location_id     uuid NOT NULL REFERENCES locations(id),
  first_name              text NOT NULL,
  last_name               text NOT NULL,
  phone_e164              text NOT NULL,
  email                   citext,
  pronouns                text,
  birthday_month          int CHECK (birthday_month BETWEEN 1 AND 12),
  birthday_day            int CHECK (birthday_day BETWEEN 1 AND 31),
  birthday_set_at         timestamptz,                    -- WRITE-ONCE LOCK FIRES OFF THIS
  texture                 text,                           -- "Type 4C"
  current_length          text,                           -- "Shoulder"
  scalp_sensitivity       text,                           -- "Tender-headed"
  allergies               text,
  notes_for_stylist       text,
  preferred_stylist_id    uuid REFERENCES stylists(id),
  referral_source         text,
  active                  boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  deleted_at              timestamptz,
  UNIQUE (primary_location_id, phone_e164)
);

-- Birthday-lock trigger — client-app updates rejected once birthday_set_at is non-null
CREATE OR REPLACE FUNCTION enforce_birthday_lock() RETURNS trigger AS $$
BEGIN
  IF OLD.birthday_set_at IS NOT NULL
     AND (NEW.birthday_month IS DISTINCT FROM OLD.birthday_month
       OR NEW.birthday_day   IS DISTINCT FROM OLD.birthday_day)
     AND current_setting('app.actor_role', true) NOT IN ('owner','manager') THEN
    RAISE EXCEPTION 'birthday is locked — operator override required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_birthday_lock BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION enforce_birthday_lock();

CREATE TABLE client_consents (
  client_id        uuid PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  sms_marketing    boolean NOT NULL DEFAULT false,
  sms_transactional boolean NOT NULL DEFAULT true,        -- bookings/receipts; always on by acceptance of TOS
  email_marketing  boolean NOT NULL DEFAULT false,
  email_transactional boolean NOT NULL DEFAULT true,
  birthday_outreach boolean NOT NULL DEFAULT true,
  consent_recorded_at timestamptz NOT NULL DEFAULT now(),
  consent_ip       inet
);

-- A client can have history at multiple locations
CREATE TABLE client_locations (
  client_id        uuid REFERENCES clients(id),
  location_id      uuid REFERENCES locations(id),
  first_visit_at   timestamptz,
  last_visit_at    timestamptz,
  visit_count      int NOT NULL DEFAULT 0,
  total_spend_cents bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (client_id, location_id)
);
```

---

## 3. Staff

```sql
CREATE TABLE stylists (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES users(id),
  display_name            text NOT NULL,                   -- "Aminata D."
  full_name               text NOT NULL,
  tier                    text NOT NULL CHECK (tier IN ('apprentice','stylist','senior','master')),
  influencer_handle       text,                            -- her "Influencer" branding
  bio                     text,
  portrait_url            text,
  preferred_languages     text[] NOT NULL DEFAULT '{en}',  -- e.g. {fr,en}
  commission_rate_pct     numeric(5,2) NOT NULL DEFAULT 50.00,  -- gross commission % of service revenue
  weekly_chair_target     int,                              -- for the owner's goal tracker
  active                  boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  deleted_at              timestamptz
);

CREATE TABLE stylist_locations (
  stylist_id       uuid REFERENCES stylists(id),
  location_id      uuid REFERENCES locations(id),
  default_station_id uuid REFERENCES stations(id),
  active           boolean NOT NULL DEFAULT true,
  PRIMARY KEY (stylist_id, location_id)
);

CREATE TABLE stylist_schedules (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id       uuid NOT NULL REFERENCES stylists(id),
  location_id      uuid NOT NULL REFERENCES locations(id),
  day_of_week      int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  effective_from   date NOT NULL,
  effective_to     date,
  CHECK (start_time < end_time)
);

CREATE TABLE breaks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id       uuid NOT NULL REFERENCES stylists(id),
  location_id      uuid NOT NULL REFERENCES locations(id),
  started_at       timestamptz NOT NULL,
  scheduled_end_at timestamptz NOT NULL,
  ended_at         timestamptz,                          -- null while in progress
  reason           text DEFAULT 'standard',
  initiated_by     text NOT NULL CHECK (initiated_by IN ('self','manager'))
);
```

---

## 4. Catalog

```sql
-- A Service is a base offering — "Knotless Box Braids", "Silk Press", "Cornrows"
CREATE TABLE services (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             uuid NOT NULL REFERENCES locations(id),
  category                text NOT NULL CHECK (category IN ('knotless','box','fulani','silk','natural','kids','color','cornrows','takedown','wash')),
  name                    text NOT NULL,
  slug                    text NOT NULL,
  base_price_cents        bigint NOT NULL CHECK (base_price_cents >= 0),
  base_duration_minutes   int NOT NULL CHECK (base_duration_minutes > 0),
  description             text,
  active                  boolean NOT NULL DEFAULT true,
  UNIQUE (location_id, slug)
);

-- Modifier groups attached to a service: "Size", "Length", "Parting", "Color"
CREATE TABLE service_modifier_groups (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name             text NOT NULL,
  sort_order       int NOT NULL DEFAULT 0,
  required         boolean NOT NULL DEFAULT true,
  selection_type   text NOT NULL CHECK (selection_type IN ('single','multi'))
);

-- Options within a group: "Medium", "Waist", "Cherry Cola"
CREATE TABLE service_modifier_options (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         uuid NOT NULL REFERENCES service_modifier_groups(id) ON DELETE CASCADE,
  name             text NOT NULL,
  price_delta_cents bigint NOT NULL DEFAULT 0,             -- can be negative (e.g., "Bob: -$30")
  duration_delta_minutes int NOT NULL DEFAULT 0,
  swatch_color_hex text,                                   -- for color swatches
  is_default       boolean NOT NULL DEFAULT false,
  sort_order       int NOT NULL DEFAULT 0
);

-- Add-ons (a la carte): "Beads", "Takedown", "Edge styling"
CREATE TABLE addons (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             uuid NOT NULL REFERENCES locations(id),
  name                    text NOT NULL,
  description             text,
  price_cents             bigint NOT NULL DEFAULT 0,
  duration_delta_minutes  int NOT NULL DEFAULT 0,
  default_attached        boolean NOT NULL DEFAULT false,   -- "Wash & deep condition" is on by default
  applicable_categories   text[] NOT NULL DEFAULT '{}',     -- empty = applies to all
  active                  boolean NOT NULL DEFAULT true
);

-- A Look is a photographed style on the menu — what the public gallery shows.
-- One look = one Service + one preset of modifier_option choices + a photo.
CREATE TABLE looks (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             uuid NOT NULL REFERENCES locations(id),
  service_id              uuid NOT NULL REFERENCES services(id),
  name                    text NOT NULL,                   -- "Cherry Cola Knotless"
  emphasis_word           text,                            -- "Knotless" (italic gold in UI)
  byline                  text,                            -- "Medium · waist · with Aminata D."
  hero_photo_url          text NOT NULL,
  thumbnail_url           text NOT NULL,
  default_stylist_id      uuid REFERENCES stylists(id),
  tag                     text CHECK (tag IN ('new','fave','color','kids','seasonal')),
  popularity_rank         int,
  shoot_asset_id          uuid REFERENCES shoot_assets(id),
  active                  boolean NOT NULL DEFAULT true,
  sort_order              int NOT NULL DEFAULT 0
);

CREATE TABLE look_modifier_presets (
  look_id          uuid REFERENCES looks(id) ON DELETE CASCADE,
  option_id        uuid REFERENCES service_modifier_options(id),
  PRIMARY KEY (look_id, option_id)
);

CREATE INDEX idx_looks_location_active ON looks(location_id) WHERE active = true;
```

---

## 5. Booking

```sql
CREATE TABLE appointments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             uuid NOT NULL REFERENCES locations(id),
  client_id               uuid NOT NULL REFERENCES clients(id),
  stylist_id              uuid REFERENCES stylists(id),     -- null = "any chair"
  station_id              uuid REFERENCES stations(id),
  service_id              uuid NOT NULL REFERENCES services(id),
  look_id                 uuid REFERENCES looks(id),        -- if booked from gallery
  starts_at               timestamptz NOT NULL,
  ends_at                 timestamptz NOT NULL,
  status                  text NOT NULL CHECK (status IN (
                            'unconfirmed','confirmed','checked_in','in_progress',
                            'completed','cancelled','no_show','walked_out')),
  source                  text NOT NULL CHECK (source IN (
                            'site','app','sms_concierge','phone','walk_in','operator_admin')),
  base_price_cents        bigint NOT NULL,
  modifiers_total_cents   bigint NOT NULL DEFAULT 0,
  addons_total_cents      bigint NOT NULL DEFAULT 0,
  discounts_total_cents   bigint NOT NULL DEFAULT 0,
  tip_cents               bigint NOT NULL DEFAULT 0,
  tax_cents               bigint NOT NULL DEFAULT 0,
  total_cents             bigint NOT NULL,
  deposit_held_cents      bigint NOT NULL DEFAULT 0,
  client_notes            text,
  stylist_notes           text,
  checked_in_at           timestamptz,
  started_at              timestamptz,
  completed_at            timestamptz,
  cancelled_at            timestamptz,
  cancellation_reason     text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  -- Concurrency: no station can be booked twice in overlapping windows
  EXCLUDE USING gist (
    station_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled','no_show','walked_out') AND station_id IS NOT NULL)
);

CREATE INDEX idx_appt_location_starts ON appointments(location_id, starts_at);
CREATE INDEX idx_appt_stylist_starts ON appointments(stylist_id, starts_at);
CREATE INDEX idx_appt_client ON appointments(client_id, starts_at DESC);

-- Each modifier the client chose at booking time
CREATE TABLE appointment_modifier_choices (
  appointment_id   uuid REFERENCES appointments(id) ON DELETE CASCADE,
  option_id        uuid REFERENCES service_modifier_options(id),
  price_at_booking_cents bigint NOT NULL,                  -- snapshot, in case option price changes later
  PRIMARY KEY (appointment_id, option_id)
);

CREATE TABLE appointment_lines (                            -- add-ons selected
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  addon_id         uuid REFERENCES addons(id),
  description      text NOT NULL,                          -- denormalized for receipts
  price_cents      bigint NOT NULL,
  quantity         int NOT NULL DEFAULT 1
);

-- Materialized availability cache. Recomputed when schedule, appointment, or break changes.
CREATE TABLE availability_slots (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      uuid NOT NULL REFERENCES locations(id),
  stylist_id       uuid NOT NULL REFERENCES stylists(id),
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz NOT NULL,
  is_available     boolean NOT NULL DEFAULT true,
  hold_until       timestamptz,                            -- soft-hold during checkout
  hold_session_id  uuid,
  UNIQUE (stylist_id, starts_at)
);

CREATE TABLE waitlist_entries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  service_id       uuid NOT NULL REFERENCES services(id),
  preferred_stylist_id uuid REFERENCES stylists(id),
  earliest_date    date NOT NULL,
  latest_date      date,
  time_of_day      text CHECK (time_of_day IN ('morning','afternoon','evening','any')),
  status           text NOT NULL DEFAULT 'open' CHECK (status IN ('open','offered','filled','cancelled')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  filled_appointment_id uuid REFERENCES appointments(id)
);
```

---

## 6. Floor operations

```sql
CREATE TABLE stations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      uuid NOT NULL REFERENCES locations(id),
  station_number   int NOT NULL,                          -- "Station 14"
  display_name     text,                                  -- optional, for kiosk
  active           boolean NOT NULL DEFAULT true,
  UNIQUE (location_id, station_number)
);

-- Real-time floor state — single row per station per location, updated frequently
CREATE TABLE station_states (
  station_id              uuid PRIMARY KEY REFERENCES stations(id),
  state                   text NOT NULL CHECK (state IN (
                            'available','occupied','finishing','birthday',
                            'needs_attention','on_break','offline')),
  current_appointment_id  uuid REFERENCES appointments(id),
  current_stylist_id      uuid REFERENCES stylists(id),
  state_started_at        timestamptz NOT NULL DEFAULT now(),
  estimated_done_at       timestamptz,
  flag_count              int NOT NULL DEFAULT 0,
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Client-tapped assistance bell from the kiosk
CREATE TABLE assistance_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id       uuid NOT NULL REFERENCES stations(id),
  appointment_id   uuid REFERENCES appointments(id),
  request_type     text NOT NULL CHECK (request_type IN (
                     'water','refreshment','tight_or_discomfort','restroom_break',
                     'too_hot','too_cold','phone_charger','other')),
  free_text        text,
  requested_at     timestamptz NOT NULL DEFAULT now(),
  acknowledged_by_user_id uuid REFERENCES users(id),
  acknowledged_at  timestamptz,
  resolved_at      timestamptz
);
```

---

## 7. Stylist workflow

```sql
-- A live progress record while a service is being delivered
CREATE TABLE service_progress (
  appointment_id   uuid PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
  current_step     text NOT NULL CHECK (current_step IN (
                     'prep','sectioning','braiding','finishing','all_done')),
  started_at       timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz,
  total_paused_seconds int NOT NULL DEFAULT 0
);

CREATE TABLE service_progress_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id),
  step             text NOT NULL,
  event            text NOT NULL CHECK (event IN ('entered','paused','resumed','completed')),
  at_time          timestamptz NOT NULL DEFAULT now(),
  recorded_by_stylist_id uuid REFERENCES stylists(id)
);

-- 4-angle photo capture per visit
CREATE TABLE service_captures (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id),
  angle            text NOT NULL CHECK (angle IN ('before_front','before_back','after_front','after_left','after_right','after_back')),
  photo_url        text NOT NULL,
  captured_by_stylist_id uuid NOT NULL REFERENCES stylists(id),
  captured_at      timestamptz NOT NULL DEFAULT now(),
  approved_for_journey boolean NOT NULL DEFAULT false,    -- client toggles this
  approved_for_marketing boolean NOT NULL DEFAULT false   -- requires image release
);
```

---

## 8. Financial

```sql
CREATE TABLE deposits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id),
  client_id        uuid NOT NULL REFERENCES clients(id),
  amount_cents     bigint NOT NULL CHECK (amount_cents > 0),
  status           text NOT NULL CHECK (status IN ('pending','held','applied','refunded','forfeited')),
  stripe_payment_intent_id text,
  held_at          timestamptz,
  applied_at       timestamptz,
  refunded_at      timestamptz,
  refund_reason    text
);

CREATE TABLE payments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id),
  client_id        uuid NOT NULL REFERENCES clients(id),
  stylist_id       uuid REFERENCES stylists(id),
  amount_cents     bigint NOT NULL,
  method           text NOT NULL CHECK (method IN ('card','ach','cash','apple_pay','google_pay','wallet','gift_card')),
  stripe_charge_id text,
  status           text NOT NULL CHECK (status IN ('pending','succeeded','failed','disputed','refunded','partially_refunded')),
  receipt_url      text,
  processed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id       uuid NOT NULL REFERENCES payments(id),
  amount_cents     bigint NOT NULL,
  reason           text NOT NULL,
  initiated_by_user_id uuid NOT NULL REFERENCES users(id),
  stripe_refund_id text,
  status           text NOT NULL CHECK (status IN ('pending','succeeded','failed')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tips (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id),
  stylist_id       uuid NOT NULL REFERENCES stylists(id),
  amount_cents     bigint NOT NULL,
  payment_id       uuid REFERENCES payments(id),         -- null if cash
  method           text NOT NULL CHECK (method IN ('card','cash','app','venmo')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE register_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      uuid NOT NULL REFERENCES locations(id),
  opened_by_user_id uuid NOT NULL REFERENCES users(id),
  closed_by_user_id uuid REFERENCES users(id),
  opened_at        timestamptz NOT NULL DEFAULT now(),
  closed_at        timestamptz,
  opening_balance_cents bigint NOT NULL,
  closing_balance_cents bigint,
  expected_balance_cents bigint,
  variance_cents   bigint,
  notes            text
);

CREATE TABLE register_transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid NOT NULL REFERENCES register_sessions(id),
  kind             text NOT NULL CHECK (kind IN ('cash_in','cash_out','payout','tip_payout','adjustment')),
  amount_cents     bigint NOT NULL,                       -- positive in, negative out
  reference        text,                                  -- e.g., payment_id or refund_id
  performed_by_user_id uuid NOT NULL REFERENCES users(id),
  at_time          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE commissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id       uuid NOT NULL REFERENCES stylists(id),
  appointment_id   uuid NOT NULL REFERENCES appointments(id),
  service_revenue_cents bigint NOT NULL,
  rate_pct         numeric(5,2) NOT NULL,
  commission_cents bigint NOT NULL,
  status           text NOT NULL CHECK (status IN ('accrued','paid','adjusted','clawback')),
  pay_period_id    uuid,                                  -- groups for weekly payout
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

---

## 9. Loyalty

```sql
CREATE TABLE membership_tiers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      uuid NOT NULL REFERENCES locations(id),
  name             text NOT NULL,                          -- 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
  minimum_points   int NOT NULL,
  perks            text[],                                -- copy describing perks (priority booking, etc.)
  monthly_fee_cents bigint NOT NULL DEFAULT 0,             -- 0 = free auto-tier; >0 = paid Circle membership
  sort_order       int NOT NULL,
  UNIQUE (location_id, name)
);

CREATE TABLE memberships (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  location_id      uuid NOT NULL REFERENCES locations(id),
  tier_id          uuid NOT NULL REFERENCES membership_tiers(id),
  is_circle        boolean NOT NULL DEFAULT false,         -- paid "Jolieden Circle" flag
  renewed_at       timestamptz,
  expires_at       timestamptz,
  paused_at        timestamptz,
  cancelled_at     timestamptz,
  stripe_subscription_id text
);

CREATE TABLE rewards_ledger (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  delta_points     int NOT NULL,                          -- positive earned, negative spent
  reason           text NOT NULL CHECK (reason IN (
                     'visit','tip','referral','birthday','signup_bonus',
                     'redeem_freebie','redeem_discount','redeem_gift','adjustment')),
  reference        text,                                   -- e.g., appointment_id
  balance_after    int NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Write-once birthday with operator-only override (enforced by trigger on clients.birthday_set_at)
CREATE TABLE birthday_records (
  client_id        uuid PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  birthday_month   int NOT NULL CHECK (birthday_month BETWEEN 1 AND 12),
  birthday_day     int NOT NULL CHECK (birthday_day BETWEEN 1 AND 31),
  set_at           timestamptz NOT NULL DEFAULT now(),
  set_by_actor     text NOT NULL CHECK (set_by_actor IN ('client_app','operator')),
  last_updated_by_user_id uuid REFERENCES users(id),       -- only set on operator override
  last_updated_at  timestamptz
);
```

---

## 10. Communication

```sql
CREATE TABLE concierge_threads (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             uuid NOT NULL REFERENCES locations(id),
  client_id               uuid REFERENCES clients(id),     -- null until matched
  client_phone_e164       text NOT NULL,
  status                  text NOT NULL CHECK (status IN ('open','needs_human','resolved','snoozed')),
  ai_handling_enabled     boolean NOT NULL DEFAULT true,
  last_message_at         timestamptz NOT NULL DEFAULT now(),
  last_human_takeover_by_user_id uuid REFERENCES users(id),
  last_human_takeover_at  timestamptz,
  topic_tags              text[] NOT NULL DEFAULT '{}',     -- ["booking","prep","lost_and_found","reschedule",...]
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE concierge_messages (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id               uuid NOT NULL REFERENCES concierge_threads(id) ON DELETE CASCADE,
  direction               text NOT NULL CHECK (direction IN ('inbound','outbound')),
  author                  text NOT NULL CHECK (author IN ('client','ai','human')),
  author_user_id          uuid REFERENCES users(id),       -- only when author='human'
  body                    text NOT NULL,
  twilio_message_sid      text,
  ai_model                text,                            -- e.g., "claude-sonnet-4-6"
  ai_input_tokens         int,
  ai_output_tokens        int,
  tool_calls              jsonb,                           -- if AI invoked a tool
  delivered_at            timestamptz,
  read_at                 timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_concierge_messages_thread ON concierge_messages(thread_id, created_at);

CREATE TABLE escalations (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id               uuid NOT NULL REFERENCES concierge_threads(id),
  triggering_message_id   uuid NOT NULL REFERENCES concierge_messages(id),
  reason                  text NOT NULL,                   -- AI's justification
  ai_recommendation       text,                            -- options the AI proposed
  resolved_by_user_id     uuid REFERENCES users(id),
  resolved_at             timestamptz,
  resolution_note         text
);

CREATE TABLE app_invites (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             uuid NOT NULL REFERENCES locations(id),
  client_id               uuid REFERENCES clients(id),
  recipient_phone_e164    text NOT NULL,
  recipient_name          text NOT NULL,
  initiated_by_user_id    uuid NOT NULL REFERENCES users(id),
  template                text NOT NULL CHECK (template IN ('confirmation','welcome','rebook','birthday')),
  custom_body             text,
  status                  text NOT NULL CHECK (status IN ('pending','sent','delivered','failed','opted_out')),
  installed_at            timestamptz,                     -- attribution from Branch/AppsFlyer-style attribution
  first_booking_at        timestamptz,
  twilio_message_sid      text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outbound_notifications (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid REFERENCES clients(id),
  channel                 text NOT NULL CHECK (channel IN ('sms','email','push')),
  template_key            text NOT NULL,                   -- e.g., 'appointment_reminder_24h'
  payload                 jsonb,
  scheduled_for           timestamptz,
  sent_at                 timestamptz,
  status                  text NOT NULL CHECK (status IN ('queued','sent','delivered','failed','bounced')),
  external_id             text,                            -- Twilio sid / SendGrid id / FCM token
  created_at              timestamptz NOT NULL DEFAULT now()
);
```

---

## 11. Content

```sql
CREATE TABLE hair_journey_entries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id   uuid REFERENCES appointments(id),
  visit_date       date NOT NULL,
  style_name       text NOT NULL,
  stylist_id       uuid REFERENCES stylists(id),
  before_photo_url text,
  after_photo_url  text,
  client_note      text,
  is_milestone     boolean NOT NULL DEFAULT false,         -- e.g., birthday look
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- October Lookbook signups
CREATE TABLE shoot_signups (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      uuid NOT NULL REFERENCES locations(id),
  influencer_name  text NOT NULL,
  contact_phone_e164 text NOT NULL,
  contact_email    citext,
  social_handle    text,
  follower_count   int,
  preferred_look_id uuid REFERENCES looks(id),
  preferred_date   date,
  status           text NOT NULL CHECK (status IN ('pending','approved','waitlist','rejected','completed','no_show')),
  reviewed_by_user_id uuid REFERENCES users(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE image_releases (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signed_by_name   text NOT NULL,
  signed_by_phone_e164 text,
  signed_by_email  citext,
  scope            text NOT NULL CHECK (scope IN ('catalog_only','marketing','social','all')),
  signature_image_url text NOT NULL,                       -- captured at kiosk
  signed_at        timestamptz NOT NULL DEFAULT now(),
  ip_address       inet,
  related_shoot_signup_id uuid REFERENCES shoot_signups(id)
);

CREATE TABLE shoot_assets (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             uuid NOT NULL REFERENCES locations(id),
  shoot_signup_id         uuid REFERENCES shoot_signups(id),
  image_release_id        uuid REFERENCES image_releases(id),
  master_url              text NOT NULL,
  thumbnail_url           text NOT NULL,
  hero_url                text NOT NULL,                    -- 5:4 crop for gallery
  caption                 text,
  proposed_look_id        uuid REFERENCES looks(id),
  reviewed_by_user_id     uuid REFERENCES users(id),
  status                  text NOT NULL CHECK (status IN ('uploaded','approved','live','retired')),
  approved_at             timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);
```

---

## 12. Quality (Oopsie + reviews)

```sql
CREATE TABLE oopsie_tickets (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid NOT NULL REFERENCES clients(id),
  original_appointment_id uuid NOT NULL REFERENCES appointments(id),
  reported_at             timestamptz NOT NULL DEFAULT now(),
  reported_via            text NOT NULL CHECK (reported_via IN ('sms','app','in_person','call')),
  issue_description       text NOT NULL,
  photos                  text[],                          -- urls
  triage_status           text NOT NULL CHECK (triage_status IN (
                            'review','approved','rejected','rescheduled','complete')),
  repair_appointment_id   uuid REFERENCES appointments(id),
  repair_charge_cents     bigint NOT NULL DEFAULT 0,        -- 0 if covered under guarantee
  commission_transfer_to_stylist_id uuid REFERENCES stylists(id),
  assessed_by_user_id     uuid REFERENCES users(id),
  resolved_at             timestamptz,
  resolution_notes        text
);

CREATE TABLE oopsie_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id        uuid NOT NULL REFERENCES oopsie_tickets(id),
  event            text NOT NULL,                         -- 'opened','triaged','quoted','scheduled','resolved'
  by_user_id       uuid REFERENCES users(id),
  at_time          timestamptz NOT NULL DEFAULT now(),
  notes            text
);

CREATE TABLE reviews (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id),
  client_id        uuid NOT NULL REFERENCES clients(id),
  stylist_id       uuid REFERENCES stylists(id),
  rating           int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body             text,
  internal_note    text,
  publish_external boolean NOT NULL DEFAULT false,         -- for sharing on the site
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

---

## 13. Operations (inventory)

```sql
CREATE TABLE inventory_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id      uuid NOT NULL REFERENCES locations(id),
  sku              text NOT NULL,
  name             text NOT NULL,
  category         text,                                  -- "Hair", "Beads", "Edge gel", etc.
  unit_cost_cents  bigint NOT NULL,
  on_hand          int NOT NULL DEFAULT 0,
  reorder_at       int,
  active           boolean NOT NULL DEFAULT true,
  UNIQUE (location_id, sku)
);

CREATE TABLE inventory_movements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          uuid NOT NULL REFERENCES inventory_items(id),
  kind             text NOT NULL CHECK (kind IN ('received','used','adjustment','retired')),
  delta            int NOT NULL,                          -- negative for usage
  reference        text,
  performed_by_user_id uuid REFERENCES users(id),
  at_time          timestamptz NOT NULL DEFAULT now()
);
```

---

## 14. Compliance

```sql
CREATE TABLE audit_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at_time          timestamptz NOT NULL DEFAULT now(),
  actor_user_id    uuid REFERENCES users(id),
  actor_role       text,
  action           text NOT NULL,                          -- 'birthday.override' | 'refund.issue' | 'appointment.cancel'
  entity           text NOT NULL,
  entity_id        text NOT NULL,
  before_value     jsonb,
  after_value      jsonb,
  ip_address       inet,
  user_agent       text
);

CREATE INDEX idx_audit_actor ON audit_log(actor_user_id, at_time DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id);

CREATE TABLE data_export_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_email  citext NOT NULL,
  client_id        uuid REFERENCES clients(id),
  status           text NOT NULL CHECK (status IN ('pending','exported','delivered','denied')),
  export_url       text,
  requested_at     timestamptz NOT NULL DEFAULT now(),
  delivered_at     timestamptz
);

CREATE TABLE data_deletion_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_email  citext NOT NULL,
  client_id        uuid REFERENCES clients(id),
  status           text NOT NULL CHECK (status IN ('pending','reviewing','completed','denied')),
  requested_at     timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz,
  hold_reason      text
);
```

---

## 15. Critical constraints — at-a-glance

| Rule | Where enforced |
|---|---|
| **Birthday is write-once from client app** | `enforce_birthday_lock` trigger on `clients` + `clients.birthday_set_at` non-null guard; operator override via `current_setting('app.actor_role')` |
| **No double-booking a station** | EXCLUDE constraint on `appointments` using `tstzrange` |
| **Deposit money is held → applied → refunded → forfeited** | `deposits.status` transitions enforced in service layer |
| **Commissions clawback on Oopsie repair** | `oopsie_tickets.commission_transfer_to_stylist_id` + `commissions.status='clawback'` row pair |
| **All financial values in integer cents** | All `*_cents` columns are `bigint` |
| **SMS marketing opt-in is explicit** | `client_consents.sms_marketing` checked before any non-transactional outbound |
| **PII access logged** | `audit_log` row on every export/edit of `clients` fields |
| **Image release required for catalog use** | `shoot_assets.image_release_id NOT NULL` for any asset where `status='live'` |
| **Multi-location isolation** | Application-layer filter on `location_id`; Postgres RLS policies on each business table |

---

## 16. Indices (beyond the primary keys)

```sql
-- Hot paths
CREATE INDEX idx_appointments_status_starts ON appointments(location_id, status, starts_at);
CREATE INDEX idx_appointments_today ON appointments(location_id, starts_at::date);
CREATE INDEX idx_client_phone ON clients(phone_e164);
CREATE INDEX idx_client_birthday ON clients(birthday_month, birthday_day)
   WHERE birthday_set_at IS NOT NULL;
CREATE INDEX idx_concierge_threads_open ON concierge_threads(location_id, status, last_message_at DESC)
   WHERE status IN ('open','needs_human');
CREATE INDEX idx_station_states_loc ON station_states(station_id);
CREATE INDEX idx_assistance_open ON assistance_requests(station_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_rewards_client ON rewards_ledger(client_id, created_at DESC);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_availability_lookup ON availability_slots(location_id, stylist_id, starts_at);
```

---

## 17. Open business-rule values (to be confirmed with Diéssou)

These cells are needed to *seed* the data on day 1 — they're not in the schema, but they're in the application config. **Every one needs a number before we go live.**

| Rule | Status | Default for sketch | Live value (TBD) |
|---|---|---|---|
| Deposit amount | TBD | $40 (cents: 4000) | __ |
| Cancellation window for free cancellation | TBD | 48 hours | __ |
| Late-arrival grace window | TBD | 15 minutes | __ |
| No-show fee % of total | TBD | 50% | __ |
| Stylist commission rate (default) | TBD | 50% | __ |
| Commission clawback on Oopsie | TBD | 100% | __ |
| Birthday week start | TBD | 3 days before to 3 days after | __ |
| Birthday comp service value cap | TBD | Wash & Blow only | __ |
| Tier minimum points: Bronze | TBD | 0 | __ |
| Tier minimum points: Silver | TBD | 500 | __ |
| Tier minimum points: Gold | TBD | 1500 | __ |
| Tier minimum points: Diamond | TBD | 4000 | __ |
| Points per dollar spent | TBD | 1 | __ |
| Points per dollar tip | TBD | 0 | __ |
| Referral bonus (referrer) | TBD | 100 pts | __ |
| Referral bonus (referee) | TBD | $20 off first visit | __ |
| Break time cap (concurrent stylists on break) | TBD | 4 of 30 | __ |
| Standard break length | TBD | 30 minutes | __ |
| Membership renewal day | TBD | Day of month signed up | __ |
| Membership monthly fee | TBD | $0 (auto-tier) or set | __ |
| Tax rate | TBD | NY 8.875% | __ |

---

## 18. Migration notes

1. **0001_init.sql** — locations, users, clients, stylists, basic catalog
2. **0002_booking.sql** — appointments, availability, deposits/payments
3. **0003_floor.sql** — stations, station_states, assistance_requests, service_progress
4. **0004_loyalty.sql** — memberships, rewards, birthday lock trigger
5. **0005_comms.sql** — concierge threads/messages, escalations, app_invites, notifications
6. **0006_content.sql** — hair_journey, shoot_signups, image_releases, shoot_assets
7. **0007_quality.sql** — oopsie, reviews
8. **0008_ops.sql** — inventory, register sessions
9. **0009_compliance.sql** — audit_log, RLS policies, data subject requests
10. **0010_seed.sql** — seed Harlem location + Bronze/Silver/Gold/Diamond tiers + standard add-ons (Wash, Takedown, Beads, Edges)

---

## 19. What this schema deliberately doesn't cover

These are out of scope for v1 or handled outside the database:

- **Real-time floor map state diffing** — handled in Redis/PubSub, not Postgres
- **Twilio webhook signatures** — handled in API middleware
- **Image storage** — S3-equivalent (Supabase Storage); only URLs live in Postgres
- **Calendar sync (Google/Apple)** — Phase 2
- **Inventory cost accounting (COGS)** — counts only in v1; valuation deferred
- **Payroll for stylists** — out of scope; only commission *accrual* tracked
