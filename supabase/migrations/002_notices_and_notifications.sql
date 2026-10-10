-- ============================================================
-- ORMISSION EdTech Platform — Notices & Notifications Schema
-- Supabase PostgreSQL Migration
-- ============================================================

-- 1. Ensure site_settings Table Exists
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow Public/Students to Read Site Settings (for Notices, Banners, SEO, Social)
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
ON public.site_settings
FOR SELECT
TO public
USING (true);

-- Allow Admins and Service Role to Insert/Update Site Settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role IN ('admin', 'super_admin') OR auth.jwt()->>'email' IN ('admin@ormission.com', 'rimonaldohadi@gmail.com', 'ohidrashed0@gmail.com', 'anas226788@gmail.com', 'moirashed0@gmail.com'))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role IN ('admin', 'super_admin') OR auth.jwt()->>'email' IN ('admin@ormission.com', 'rimonaldohadi@gmail.com', 'ohidrashed0@gmail.com', 'anas226788@gmail.com', 'moirashed0@gmail.com'))
    )
);

-- 2. Seed Default Settings for Notices and Push Notifications
INSERT INTO public.site_settings (key, value, updated_at)
VALUES 
    (
        'ormission_notices',
        '[
            {
                "id": "notice-welcome",
                "title": "HSC & Admission Special Live Batch",
                "titleBn": "এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি স্পেশাল লাইভ ব্যাচ শুরু!",
                "content": "All academic and admission courses are now open with special discounts.",
                "contentBn": "সকল একাডেমিক ও ভর্তি কোর্সে সীমিত সময়ের জন্য বিশেষ ছাড় চলছে। এখনই এনরোল করুন।",
                "type": "offer",
                "showTopBanner": true,
                "showNoticeBoard": true,
                "actionText": "কোর্সসমূহ দেখুন",
                "actionUrl": "/courses",
                "isActive": true,
                "pinned": true,
                "createdAt": "2026-10-10T14:00:00.000Z"
            }
        ]'::jsonb,
        NOW()
    ),
    (
        'ormission_push_settings',
        '{
            "provider": "onesignal",
            "oneSignalAppId": "a18a75f7-2dc3-49af-a041-c167c10f6a7f",
            "oneSignalRestApiKey": "",
            "fcmServerKey": ""
        }'::jsonb,
        NOW()
    ),
    (
        'ormission_notifications_history',
        '[]'::jsonb,
        NOW()
    )
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. DEDICATED NOTICES TABLE (Relational Model for Advanced Queries)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notices (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    title_bn VARCHAR(500),
    content TEXT NOT NULL,
    content_bn TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (type IN ('emergency', 'offer', 'exam', 'general')),
    show_top_banner BOOLEAN NOT NULL DEFAULT TRUE,
    show_notice_board BOOLEAN NOT NULL DEFAULT TRUE,
    action_text VARCHAR(100),
    action_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for notices table
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Allow Public to Read Active Notices
DROP POLICY IF EXISTS "Public can view active notices" ON public.notices;
CREATE POLICY "Public can view active notices"
ON public.notices
FOR SELECT
TO public
USING (is_active = true);

-- Allow Admins Full Access to notices
DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;
CREATE POLICY "Admins can manage notices"
ON public.notices
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role IN ('admin', 'super_admin') OR auth.jwt()->>'email' IN ('admin@ormission.com', 'rimonaldohadi@gmail.com', 'ohidrashed0@gmail.com', 'anas226788@gmail.com', 'moirashed0@gmail.com'))
    )
);

-- ============================================================
-- 4. USER IN-APP NOTIFICATIONS TABLE (For Personal Alerts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast user queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
