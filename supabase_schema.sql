-- ==========================================
-- USTOZHUB PLATFORM — SUPABASE SQL SCHEMA
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bigdpljqmnlgbwghhwff/sql/new
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT,
  room TEXT,
  class_code TEXT,
  description TEXT,
  schedule TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  class_id TEXT,
  full_name TEXT NOT NULL,
  student_id TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  date_of_birth DATE,
  gender TEXT DEFAULT 'male',
  status TEXT DEFAULT 'active',
  notes TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  class_id TEXT,
  student_id TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Grades Table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  class_id TEXT,
  student_id TEXT NOT NULL,
  type TEXT DEFAULT 'homework',
  score NUMERIC DEFAULT 5,
  date DATE DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Homework Table
CREATE TABLE IF NOT EXISTS public.homework (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  class_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create Schedule Table
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  class_id TEXT,
  class_name TEXT,
  subject TEXT,
  day TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  room TEXT,
  color TEXT DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS or set public access for seamless API reads/writes
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
