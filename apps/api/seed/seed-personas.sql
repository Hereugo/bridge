-- Personas only (ElevenLabs agent IDs from local DB snapshot).
-- Safe to run on a DB that already has users: truncates personas only if empty
-- is not guaranteed — use DELETE or TRUNCATE personas when re-applying.
--
--   PGPASSWORD=bridge psql -h localhost -U bridge -d bridge -f apps/api/seed/seed-personas.sql

BEGIN;

DELETE FROM public.personas;

INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('a015bab4-95df-4e66-a70a-46f41c0837c7', 'Noor', 'Late-night playlists and unhurried conversation', '["What''s the last song that stopped you mid-scroll?", "Best small venue you''ve found in the city?"]', 'agent_9301krznpgyhepqsm8dqetbc8ngd', 'voice_noor', 1, true);
INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('8d3a63a2-5115-463d-9e86-9fb5376de39a', 'Milan', 'Dry humour, big opinions on coffee', '["Team espresso or something weirder?", "What''s a hill you''ll die on that''s actually harmless?"]', 'agent_9901krznv60qfkcsr26j6389djn5', 'voice_milan', 2, true);
INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('5f92a3d0-d8ed-4272-93a5-169b3a0f4293', 'Sage', 'Calm energy, curious about everything', '["What did you learn recently that surprised you?", "Sunday morning ritual — what''s yours?"]', 'agent_6701krznvhtqfj59v7wz48zhx0nb', 'voice_sage', 3, true);
INSERT INTO public.personas (id, display_name, tagline, opener_examples, elevenlabs_agent_id, elevenlabs_voice_id, sort_order, active) VALUES ('1111bac7-e07f-4bea-90e5-f108d4a6366b', 'Ravi', 'Spontaneous plans, always finding a gig', '["Last minute yes that actually paid off?", "Hidden spot you''d take a friend to?"]', 'agent_6801krznvxb5f91bgcpdzcdk4yb1', 'voice_ravi', 4, true);

COMMIT;
