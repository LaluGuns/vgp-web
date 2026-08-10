begin;

alter table founder_internal.settings
    add column if not exists operating_profile jsonb not null default jsonb_build_object(
        'skills', jsonb_build_object('founder-daily-brief', true, 'content-intelligence', true, 'content-planner', true, 'lead-discovery', true, 'outreach-drafts', true, 'social-operations', true, 'seo-operations', true, 'provider-health', true, 'approval-operator', true, 'release-operator', true),
        'approvalPolicy', 'every-external-action', 'leadLimit', 25,
        'targetCountries', jsonb_build_array('US', 'JP', 'DE'),
        'targetNiches', jsonb_build_array('rappers', 'game developers', 'content creators'),
        'targetPlatforms', jsonb_build_array('instagram', 'tiktok', 'youtube', 'website'),
        'tone', 'Clear, evidence-led, and respectful.',
        'brandVoice', 'Virzy Guns Production: practical music expertise without hype.',
        'contentCadence', 0,
        'providerPreferences', jsonb_build_object('tiktokDelivery', 'draft-upload'),
        'notifications', jsonb_build_object('approvalQueue', true, 'providerHealth', true, 'dailyDigest', false),
        'dataRetentionDays', 365,
        'safetyLimits', jsonb_build_object('maxExternalActionsPerApproval', 1, 'maxLeadResearchPerRun', 25, 'maxEvidencePerDraft', 10)
    );

alter table founder_internal.settings drop constraint if exists settings_integrations_shape;
update founder_internal.settings
set integrations = (integrations - 'cloudflare-agent') || jsonb_build_object('codex-plugin', coalesce(integrations ->> 'codex-plugin', 'configured'));
alter table founder_internal.settings add constraint settings_integrations_shape check (
    jsonb_typeof(integrations) = 'object'
    and integrations - array['meta', 'tiktok', 'hostinger-email', 'codex-plugin']::text[] = '{}'::jsonb
    and integrations ?& array['meta', 'tiktok', 'hostinger-email', 'codex-plugin']::text[]
    and integrations ->> 'meta' in ('connected', 'configured', 'not-connected', 'error')
    and integrations ->> 'tiktok' in ('connected', 'configured', 'not-connected', 'error')
    and integrations ->> 'hostinger-email' in ('connected', 'configured', 'not-connected', 'error')
    and integrations ->> 'codex-plugin' in ('connected', 'configured', 'not-connected', 'error')
);

alter table founder_internal.settings add constraint settings_operating_profile_object check (jsonb_typeof(operating_profile) = 'object');
commit;
