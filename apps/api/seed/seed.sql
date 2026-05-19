-- Bridge database seed (snapshot from local Postgres on 2026-05-19)
--
-- Includes personas (with ElevenLabs agent IDs), demo users (alice@demo.test,
-- bob@demo.test), journeys, summaries, and one sample match.
-- Excludes magic_link_tokens (ephemeral auth).
--
-- Prerequisite: tables must exist (start API once or run SQLAlchemy create_all).
--
-- Apply:
--   PGPASSWORD=bridge psql -h localhost -U bridge -d bridge -f apps/api/seed/seed.sql
--
-- Personas only:
--   PGPASSWORD=bridge psql -h localhost -U bridge -d bridge -f apps/api/seed/seed-personas.sql
--
-- Regenerate from a running database:
--   ./scripts/dump-seed.sh

BEGIN;

TRUNCATE TABLE
  connection_cards,
  wingman_sessions,
  summaries,
  matches,
  user_journeys,
  magic_link_tokens,
  deletion_audit,
  users,
  personas
RESTART IDENTITY CASCADE;

-- personas
INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('a015bab4-95df-4e66-a70a-46f41c0837c7', 'Noor', 'Late-night playlists and unhurried conversation', '["What''s the last song that stopped you mid-scroll?", "Best small venue you''ve found in the city?"]', 'agent_9301krznpgyhepqsm8dqetbc8ngd', 'voice_noor', 1, true);
INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('8d3a63a2-5115-463d-9e86-9fb5376de39a', 'Milan', 'Dry humour, big opinions on coffee', '["Team espresso or something weirder?", "What''s a hill you''ll die on that''s actually harmless?"]', 'agent_9901krznv60qfkcsr26j6389djn5', 'voice_milan', 2, true);
INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('5f92a3d0-d8ed-4272-93a5-169b3a0f4293', 'Sage', 'Calm energy, curious about everything', '["What did you learn recently that surprised you?", "Sunday morning ritual — what''s yours?"]', 'agent_6701krznvhtqfj59v7wz48zhx0nb', 'voice_sage', 3, true);
INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('1111bac7-e07f-4bea-90e5-f108d4a6366b', 'Ravi', 'Spontaneous plans, always finding a gig', '["Last minute yes that actually paid off?", "Hidden spot you''d take a friend to?"]', 'agent_6801krznvxb5f91bgcpdzcdk4yb1', 'voice_ravi', 4, true);

-- users
INSERT INTO public.users (id, email, current_phase, consent_at, created_at, deleted_at) VALUES ('b086b13e-7772-458b-9719-7f5f98f1a843', 'example@gmail.com', 'MATCHED', '2026-05-19 08:07:55.58513+00', '2026-05-19 08:07:17.899426+00', NULL);
INSERT INTO public.users (id, email, current_phase, consent_at, created_at, deleted_at) VALUES ('88f0723e-8b73-4218-b4ff-70f954405a23', 'alis@demo.test', 'KNOW', '2026-05-19 09:20:54.303341+00', '2026-05-19 09:20:40.791978+00', NULL);
INSERT INTO public.users (id, email, current_phase, consent_at, created_at, deleted_at) VALUES ('e744bdb0-44ee-4598-870e-86339f418052', 'alice@demo.test', 'KNOW', '2026-05-19 10:37:29.175701+00', '2026-05-19 08:19:33.408846+00', NULL);
INSERT INTO public.users (id, email, current_phase, consent_at, created_at, deleted_at) VALUES ('31f1fe40-50c8-4e83-a6f1-39ed7f125e27', 'bob@demo.test', 'KNOW', '2026-05-19 10:38:09.137125+00', '2026-05-19 08:19:38.500251+00', NULL);

-- user_journeys
INSERT INTO public.user_journeys (id, user_id, persona_id, phase, phase_started_at, phase_ends_at, elevenlabs_conversation_id, summary_ready, match_reveal_delivered, created_at) VALUES ('aae1822f-3d26-49b3-8ebc-5d316bc7392d', 'b086b13e-7772-458b-9719-7f5f98f1a843', '8d3a63a2-5115-463d-9e86-9fb5376de39a', 'MATCHED', '2026-05-19 08:07:55.597173+00', '2026-05-19 08:37:55.597173+00', 'conv_1779178076087', true, false, '2026-05-19 08:07:17.899426+00');
INSERT INTO public.user_journeys (id, user_id, persona_id, phase, phase_started_at, phase_ends_at, elevenlabs_conversation_id, summary_ready, match_reveal_delivered, created_at) VALUES ('8acfaced-f9dc-4453-bc77-ea2fa6664e0f', '88f0723e-8b73-4218-b4ff-70f954405a23', 'a015bab4-95df-4e66-a70a-46f41c0837c7', 'KNOW', '2026-05-19 09:20:54.315349+00', '2026-05-19 09:50:54.315349+00', 'conv_1779182454695', false, false, '2026-05-19 09:20:40.791978+00');
INSERT INTO public.user_journeys (id, user_id, persona_id, phase, phase_started_at, phase_ends_at, elevenlabs_conversation_id, summary_ready, match_reveal_delivered, created_at) VALUES ('37496697-8d8e-4b56-9cce-b4f472a885f7', 'e744bdb0-44ee-4598-870e-86339f418052', 'a015bab4-95df-4e66-a70a-46f41c0837c7', 'KNOW', '2026-05-19 10:37:29.194973+00', '2026-05-19 11:07:29.194973+00', 'conv_1779182957186', false, false, '2026-05-19 08:19:33.408846+00');
INSERT INTO public.user_journeys (id, user_id, persona_id, phase, phase_started_at, phase_ends_at, elevenlabs_conversation_id, summary_ready, match_reveal_delivered, created_at) VALUES ('ed5cd1d1-8c58-44f8-a626-65e50f4e51e3', '31f1fe40-50c8-4e83-a6f1-39ed7f125e27', '8d3a63a2-5115-463d-9e86-9fb5376de39a', 'KNOW', '2026-05-19 10:38:09.147149+00', '2026-05-19 11:08:09.147149+00', 'conv_1779178811087', false, false, '2026-05-19 08:19:38.500251+00');

-- summaries
INSERT INTO public.summaries (id, user_id, journey_id, structured_summary, created_at, expires_at, deleted_at) VALUES ('0342852f-f4e6-4755-9026-2c6506705537', 'b086b13e-7772-458b-9719-7f5f98f1a843', 'aae1822f-3d26-49b3-8ebc-5d316bc7392d', '{"notes": "PoC demo summary", "humour": "dry, gentle", "interests": ["live music", "coffee", "urban walks"], "availability": [{"day": "friday", "end": "21:00", "start": "19:00"}, {"day": "saturday", "end": "17:00", "start": "14:00"}], "energy_level": "evening person", "communication_style": "warm and curious"}', '2026-05-19 08:08:10.972366+00', '2026-05-26 08:08:10.981063+00', '2026-05-19 08:20:13.410754+00');
INSERT INTO public.summaries (id, user_id, journey_id, structured_summary, created_at, expires_at, deleted_at) VALUES ('459a6eb3-27e7-4166-bfbf-1122a5b95cd0', 'b086b13e-7772-458b-9719-7f5f98f1a843', 'aae1822f-3d26-49b3-8ebc-5d316bc7392d', '{"notes": "PoC demo summary", "humour": "dry, gentle", "interests": ["live music", "coffee", "urban walks"], "availability": [{"day": "friday", "end": "21:00", "start": "19:00"}, {"day": "saturday", "end": "17:00", "start": "14:00"}], "energy_level": "evening person", "communication_style": "warm and curious"}', '2026-05-19 08:08:04.203442+00', '2026-05-26 08:08:04.210099+00', '2026-05-19 08:20:13.410737+00');
INSERT INTO public.summaries (id, user_id, journey_id, structured_summary, created_at, expires_at, deleted_at) VALUES ('4a305b0e-95eb-433f-b26d-341431eb0a33', 'b086b13e-7772-458b-9719-7f5f98f1a843', 'aae1822f-3d26-49b3-8ebc-5d316bc7392d', '{"notes": "PoC demo summary", "humour": "dry, gentle", "interests": ["live music", "coffee", "urban walks"], "availability": [{"day": "friday", "end": "21:00", "start": "19:00"}, {"day": "saturday", "end": "17:00", "start": "14:00"}], "energy_level": "evening person", "communication_style": "warm and curious"}', '2026-05-19 08:08:11.764751+00', '2026-05-26 08:08:11.769116+00', '2026-05-19 08:20:13.410758+00');
INSERT INTO public.summaries (id, user_id, journey_id, structured_summary, created_at, expires_at, deleted_at) VALUES ('a277f0c9-9272-468e-90e7-78225ec14f46', 'b086b13e-7772-458b-9719-7f5f98f1a843', 'aae1822f-3d26-49b3-8ebc-5d316bc7392d', '{"notes": "PoC demo summary", "humour": "dry, gentle", "interests": ["live music", "coffee", "urban walks"], "availability": [{"day": "friday", "end": "21:00", "start": "19:00"}, {"day": "saturday", "end": "17:00", "start": "14:00"}], "energy_level": "evening person", "communication_style": "warm and curious"}', '2026-05-19 08:08:12.194833+00', '2026-05-26 08:08:12.199229+00', '2026-05-19 08:20:13.410761+00');
INSERT INTO public.summaries (id, user_id, journey_id, structured_summary, created_at, expires_at, deleted_at) VALUES ('f8e209e6-af24-4fa1-b1e1-b24b1a8cd7a8', '31f1fe40-50c8-4e83-a6f1-39ed7f125e27', 'ed5cd1d1-8c58-44f8-a626-65e50f4e51e3', '{"notes": "PoC demo summary", "humour": "dry, gentle", "interests": ["live music", "coffee", "urban walks"], "availability": [{"day": "friday", "end": "21:00", "start": "19:00"}, {"day": "saturday", "end": "17:00", "start": "14:00"}], "energy_level": "evening person", "communication_style": "warm and curious"}', '2026-05-19 08:20:13.33825+00', '2026-05-26 08:20:13.347388+00', '2026-05-19 08:20:13.405098+00');
INSERT INTO public.summaries (id, user_id, journey_id, structured_summary, created_at, expires_at, deleted_at) VALUES ('73af3baf-eefe-49ca-aa95-736b11a6113f', 'e744bdb0-44ee-4598-870e-86339f418052', '37496697-8d8e-4b56-9cce-b4f472a885f7', '{"notes": "PoC demo summary", "humour": "dry, gentle", "interests": ["live music", "coffee", "urban walks"], "availability": [{"day": "friday", "end": "21:00", "start": "19:00"}, {"day": "saturday", "end": "17:00", "start": "14:00"}], "energy_level": "evening person", "communication_style": "warm and curious"}', '2026-05-19 08:20:25.24287+00', '2026-05-26 08:20:25.256588+00', NULL);
INSERT INTO public.summaries (id, user_id, journey_id, structured_summary, created_at, expires_at, deleted_at) VALUES ('c2fb7de2-6554-40cc-8689-2505ec5b7a30', 'e744bdb0-44ee-4598-870e-86339f418052', '37496697-8d8e-4b56-9cce-b4f472a885f7', '{"notes": "PoC demo summary", "humour": "dry, gentle", "interests": ["live music", "coffee", "urban walks"], "availability": [{"day": "friday", "end": "21:00", "start": "19:00"}, {"day": "saturday", "end": "17:00", "start": "14:00"}], "energy_level": "evening person", "communication_style": "warm and curious"}', '2026-05-19 08:20:27.184451+00', '2026-05-26 08:20:27.190224+00', NULL);

-- matches
INSERT INTO public.matches (id, user_a_id, user_b_id, status, scheduled_call_at, compatibility_notes, created_at) VALUES ('07bd6a46-8db3-480c-bbc3-51e46efb2297', '31f1fe40-50c8-4e83-a6f1-39ed7f125e27', 'b086b13e-7772-458b-9719-7f5f98f1a843', 'CALL_SCHEDULED', '2026-05-22 19:00:00+00', 'fallback matcher', '2026-05-19 08:20:13.370212+00');

-- connection_cards
INSERT INTO public.connection_cards (id, match_id, card_text, shared_topics, created_at, expires_at) VALUES ('57e80640-7c0d-46ae-9f73-0e30afcaefae', '07bd6a46-8db3-480c-bbc3-51e46efb2297', 'You both light up around urban walks — and you''ve got a similar easy energy in how you talk. Worth a proper hello.', '["urban walks", "live music", "coffee"]', '2026-05-19 08:20:13.370212+00', '2026-06-18 08:20:13.398695+00');

COMMIT;
