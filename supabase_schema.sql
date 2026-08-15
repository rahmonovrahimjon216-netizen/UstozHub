-- ===================================================
-- USTOZHUB PLATFORM SUPABASE DATABASE SCHEMA
-- Copy and run this script in Supabase SQL Editor
-- ===================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT,
    room TEXT,
    class_code TEXT,
    description TEXT,
    schedule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id TEXT,
    full_name TEXT NOT NULL,
    student_id TEXT,
    phone TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    date_of_birth TEXT,
    gender TEXT DEFAULT 'male',
    status TEXT DEFAULT 'active',
    notes TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'sick', 'late')),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Grades Table
CREATE TABLE IF NOT EXISTS public.grades (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    type TEXT DEFAULT 'homework',
    score NUMERIC NOT NULL CHECK (score >= 1 AND score <= 5),
    date DATE DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Homework Table
CREATE TABLE IF NOT EXISTS public.homework (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Schedule Table
CREATE TABLE IF NOT EXISTS public.schedule (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL,
    class_name TEXT,
    subject TEXT,
    day TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    room TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies for Teacher Data Isolation
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow teachers to manage only their own records
CREATE POLICY "Allow individual teacher access to classes" ON public.classes FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Allow individual teacher access to students" ON public.students FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Allow individual teacher access to attendance" ON public.attendance FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Allow individual teacher access to grades" ON public.grades FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Allow individual teacher access to homework" ON public.homework FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Allow individual teacher access to schedule" ON public.schedule FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Allow individual teacher access to notifications" ON public.notifications FOR ALL USING (auth.uid() = teacher_id);
