-- ==============================================================================
-- AccessEd Inclusive Learning & Accessibility Ecosystem
-- Supabase PostgreSQL Schema & Initial Seed Data
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')) DEFAULT 'STUDENT',
    bio TEXT,
    organization TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Accessibility Preferences Table
CREATE TABLE IF NOT EXISTS public.accessibility_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    auditory_orientation BOOLEAN DEFAULT TRUE,
    read_ai_responses_aloud BOOLEAN DEFAULT FALSE,
    read_lesson_content_aloud BOOLEAN DEFAULT FALSE,
    navigation_announcements BOOLEAN DEFAULT TRUE,
    verbosity TEXT CHECK (verbosity IN ('CONCISE', 'STANDARD', 'DETAILED')) DEFAULT 'STANDARD',
    voice_identifier TEXT DEFAULT 'alloy',
    speech_rate FLOAT DEFAULT 1.0,
    font_size_scale FLOAT DEFAULT 1.0,
    theme TEXT CHECK (theme IN ('dark', 'light')) DEFAULT 'dark',
    high_contrast BOOLEAN DEFAULT FALSE,
    reduced_motion BOOLEAN DEFAULT FALSE,
    focus_mode BOOLEAN DEFAULT FALSE,
    dyslexia_font BOOLEAN DEFAULT FALSE,
    selected_language TEXT DEFAULT 'en',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Computer Science',
    difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    is_published BOOLEAN DEFAULT TRUE,
    enrollment_count INT DEFAULT 0,
    completion_rate INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_raw TEXT NOT NULL,
    content_simplified TEXT,
    summary TEXT,
    order_index INT NOT NULL DEFAULT 1,
    estimated_minutes INT DEFAULT 15,
    audio_transcript TEXT,
    audio_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INT DEFAULT 70,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage FLOAT NOT NULL,
    is_passed BOOLEAN NOT NULL,
    answers JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    course_title TEXT,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    max_score INT DEFAULT 100,
    status TEXT CHECK (status IN ('ASSIGNED', 'SUBMITTED', 'GRADED')) DEFAULT 'ASSIGNED',
    submission_content TEXT,
    submitted_at TIMESTAMPTZ,
    score INT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Document Intelligence Jobs (AI Ingestion Pipeline)
CREATE TABLE IF NOT EXISTS public.document_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id TEXT UNIQUE NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('QUEUED', 'PROCESSING', 'NEEDS_REVIEW', 'COMPLETED', 'FAILED')) DEFAULT 'QUEUED',
    error_message TEXT,
    extracted_structure JSONB DEFAULT '{}'::jsonb,
    accessible_output JSONB DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published courses, modules, and lessons for accessible learning
CREATE POLICY "Public read published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public read modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Public read published lessons" ON public.lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Public read quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to read own preferences" ON public.accessibility_preferences FOR SELECT USING (true);
CREATE POLICY "Allow users to update own preferences" ON public.accessibility_preferences FOR UPDATE USING (true);
CREATE POLICY "Allow student quiz attempts" ON public.quiz_attempts FOR ALL USING (true);
CREATE POLICY "Allow assignment submissions" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Allow document jobs" ON public.document_jobs FOR ALL USING (true);

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================

-- 1. Profiles (Teacher & Student)
INSERT INTO public.profiles (id, email, full_name, role, bio, organization)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'prof.sharma@accessed.edu', 'Prof. Ananya Sharma', 'TEACHER', 'Senior Lecturer in Computer Science and Accessibility Systems Research.', 'Department of Computing & Inclusive Technology'),
    ('b0000000-0000-0000-0000-000000000001', 'rahul.verma@accessed.edu', 'Rahul Verma', 'STUDENT', 'Computer Science Undergraduate & Screen-Reader user interested in AI.', 'AccessEd Learning Cohort')
ON CONFLICT (id) DO NOTHING;

-- 2. Accessibility Preferences for Demo Student
INSERT INTO public.accessibility_preferences (user_id, auditory_orientation, read_ai_responses_aloud, navigation_announcements, verbosity, theme, selected_language)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', true, false, true, 'STANDARD', 'dark', 'en')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Courses
INSERT INTO public.courses (id, teacher_id, title, slug, description, category, difficulty_level, enrollment_count, completion_rate)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Python Fundamentals & Memory Architecture', 'python-fundamentals', 'Master computational logic, memory pointer mechanics, and algorithmic structures with multimodal equivalent access.', 'Computer Science', 'Beginner', 28, 84),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Accessible Web Systems & Semantic Architecture', 'accessible-web-systems', 'Learn WCAG 2.2 AAA guidelines, ARIA live regions, focus management, and screen-reader tree parsing.', 'Software Engineering', 'Intermediate', 42, 78)
ON CONFLICT (id) DO NOTHING;

-- 4. Modules
INSERT INTO public.modules (id, course_id, title, description, order_index)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Module 1: Core Syntax, Data Types & Memory', 'Variables, heap memory, mutable vs immutable mechanics.', 1),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Module 2: Iteration, Recursion & Complexity', 'Control flow, call stacks, time & space Big-O analysis.', 2)
ON CONFLICT (id) DO NOTHING;

-- 5. Lessons
INSERT INTO public.lessons (id, module_id, course_id, title, slug, content_raw, content_simplified, summary, order_index, estimated_minutes, audio_transcript)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
    'Variables, Data Types and Memory References', 'variables-and-memory',
    '# Variables, Data Types, and Memory References\n\nIn Python, variables are symbolic names that act as references (pointers) to objects residing in memory. Unlike statically typed languages where a variable represents a fixed allocated byte slot, a Python variable is a reference tag bound to a heap-allocated object.\n\n```python\nx = 42\ny = x\nx = x + 1\n```\n\n### 1. The Assignment Mechanism\nWhen Python evaluates `x = 42`:\n1. It allocates an integer object with value `42` in heap memory.\n2. It sets its reference count to 1.\n3. It binds the identifier `x` in the local namespace table to this object address.\n\nWhen you subsequently write `y = x`, no duplicate integer is created. Instead, `y` points to the exact same memory address as `x`. You can inspect this directly with `id(x) == id(y)`.\n\n### 2. Mutability vs Immutability\n- **Immutable Types:** Integers, floats, booleans, strings, tuples, and frozensets.\n- **Mutable Types:** Lists, dictionaries, sets, and user-defined classes.\n\n```python\n# Mutable aliasing demonstration\nnumbers = [1, 2, 3]\nalias_numbers = numbers\nalias_numbers.append(4)\nprint(numbers) # Output: [1, 2, 3, 4]\n```\n\n### 3. Key Takeaway\nAlways distinguish between variable binding and object mutation. Understanding references prevents subtle aliasing bugs in complex algorithms.',
    '# Variables and Memory (Simplified)\n\n- In Python, a variable is like a name tag on a container, not the container itself.\n- When you write `x = 42`, Python creates the number 42 and sticks the name tag "x" on it.\n- **Numbers, text, and tuples cannot change** once made (they are *immutable*).\n- **Lists and dictionaries can change** (they are *mutable*).\n- If two variables share the same list, changing one changes both!',
    'This lesson explains how Python manages variables as memory references rather than fixed containers, clarifying the critical distinction between mutable and immutable data types.',
    1, 15,
    'Welcome to Variables, Data Types, and Memory References. In this lesson, we explore how Python handles object references in memory. Python variables do not store values directly; they are symbolic references pointing to objects in the heap.'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
    'Control Flow, Truthiness & Short-Circuit Evaluation', 'control-flow-and-truthiness',
    '# Control Flow, Truthiness & Short-Circuit Evaluation\n\nPython evaluates conditional branches using truthiness protocols. In Python, every object has an inherent boolean truth value.\n\n### Truthiness Rules\nObjects considered `False`:\n- Constants: `None` and `False`\n- Zero of any numeric type: `0`, `0.0`, `0j`\n- Empty sequences and collections: `''''`, `()`, `[]`, `{}`, `set()`\n\nAll other objects evaluate to `True`.\n\n### Short-Circuit Logic\nThe boolean operators `and` and `or` do not always return `True` or `False`. Instead, they return the actual operand that resolved the expression.',
    '# Control Flow & Truthiness (Simplified)\n\n- In Python, empty things (like empty lists `[]` or empty text `""`) and the number zero `0` are considered False.\n- Almost everything else is considered True.\n- When using `and` or `or`, Python stops checking as soon as it knows the answer (short-circuiting).',
    'Learn how Python tests conditions, evaluates truthiness, and optimizes logic with short-circuit evaluation.',
    2, 12,
    'Welcome to Control Flow and Truthiness. We examine how Python evaluates expressions in if statements and while loops.')
ON CONFLICT (id) DO NOTHING;

-- 6. Quizzes
INSERT INTO public.quizzes (id, lesson_id, title, description, passing_score, questions)
VALUES 
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
    'Mastery Check: Python Memory & Mutability',
    'Assess your understanding of reference binding, object allocation, and mutable vs immutable behaviors.',
    70,
    '[
        {
            "id": "q1",
            "question_text": "If a = [10, 20] and b = a, what occurs in memory when you execute b.append(30)?",
            "question_type": "MULTIPLE_CHOICE",
            "options": [
                {"id": "a", "text": "A new list is copied to b, leaving a unchanged."},
                {"id": "b", "text": "Both a and b reference the same list object, which now has 3 elements."},
                {"id": "c", "text": "An error is raised because lists are immutable in Python."},
                {"id": "d", "text": "a is deleted to free memory for b."}
            ],
            "correct_answer": ["b"],
            "explanation": "Lists are mutable objects in Python. Since b was assigned from a (b = a), both variables point to the same memory reference. Calling append modifies the underlying list in-place."
        },
        {
            "id": "q2",
            "question_text": "Which of the following built-in Python types is IMMUTABLE?",
            "question_type": "MULTIPLE_CHOICE",
            "options": [
                {"id": "a", "text": "List"},
                {"id": "b", "text": "Dictionary"},
                {"id": "c", "text": "Tuple"},
                {"id": "d", "text": "Set"}
            ],
            "correct_answer": ["c"],
            "explanation": "Tuples are immutable sequences. Once created, their elements and length cannot be modified. Lists, Dictionaries, and Sets are all mutable."
        },
        {
            "id": "q3",
            "question_text": "What does the expression id(x) == id(y) test in Python?",
            "question_type": "MULTIPLE_CHOICE",
            "options": [
                {"id": "a", "text": "Whether x and y have equivalent string lengths"},
                {"id": "b", "text": "Whether x and y point to the exact same object in memory"},
                {"id": "c", "text": "Whether x and y are in alphabetical order"},
                {"id": "d", "text": "Whether x and y have the same variable name"}
            ],
            "correct_answer": ["b"],
            "explanation": "The id() function returns the memory address of an object. Comparing id(x) == id(y) checks if both variables refer to the exact same heap memory object."
        }
    ]'::jsonb)
ON CONFLICT (id) DO NOTHING;
