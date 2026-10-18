-- ============================================================
-- ACCESS-ED SEED DATA
-- ============================================================

-- Teacher Profile
INSERT INTO profiles (id, email, full_name, role, bio, organization)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'prof.sharma@accessed.edu',
    'Prof. Ananya Sharma',
    'TEACHER',
    'Senior Lecturer in Computer Science and Accessibility Systems Research.',
    'Department of Computing & Inclusive Technology'
) ON CONFLICT (email) DO NOTHING;

-- Student Profile
INSERT INTO profiles (id, email, full_name, role, bio, organization)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'rahul.verma@accessed.edu',
    'Rahul Verma',
    'STUDENT',
    'Computer Science Undergraduate & Screen-Reader user interested in AI and distributed systems.',
    'AccessEd Learning Cohort'
) ON CONFLICT (email) DO NOTHING;

-- Student Accessibility Preferences
INSERT INTO accessibility_preferences (
    profile_id,
    auditory_orientation,
    read_ai_responses_aloud,
    read_lesson_content_aloud,
    navigation_announcements,
    verbosity,
    speech_rate,
    font_size_scale,
    high_contrast,
    reduced_motion,
    focus_mode,
    selected_language
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    TRUE,
    TRUE,
    FALSE,
    TRUE,
    'STANDARD',
    1.0,
    1.1,
    FALSE,
    FALSE,
    FALSE,
    'en'
) ON CONFLICT (profile_id) DO NOTHING;

-- Course 1: Python Fundamentals & Computational Thinking
INSERT INTO courses (
    id,
    teacher_id,
    title,
    slug,
    description,
    category,
    difficulty_level,
    is_published
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Python Fundamentals & Computational Thinking',
    'python-fundamentals',
    'Master computational logic, data structures, and algorithmic reasoning designed with multimodal equivalent representations.',
    'Computer Science',
    'Beginner',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Module 1
INSERT INTO course_modules (id, course_id, title, description, order_index)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Module 1: Core Syntax, Data Types & Memory',
    'Foundations of Python variables, dynamic typing, mutable vs immutable structures, and memory references.',
    1
) ON CONFLICT (id) DO NOTHING;

-- Lesson 1
INSERT INTO lessons (
    id,
    module_id,
    title,
    slug,
    content_raw,
    content_simplified,
    summary,
    order_index,
    estimated_minutes,
    audio_transcript,
    is_published
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Variables, Data Types and Memory References',
    'variables-and-memory',
    '# Variables, Data Types, and Memory References

In Python, variables are symbolic names that act as references (pointers) to objects residing in memory. Unlike static languages where a variable is an allocated box of fixed byte width, a Python variable is simply a pointer tag bound to a heap-allocated object.

```python
x = 42
y = x
x = x + 1
```

### 1. The Assignment Mechanism
When you evaluate `x = 42`, Python:
1. Allocates an integer object with value `42` in heap memory.
2. Sets its reference count to 1.
3. Binds the symbol `x` in the local namespace table to this object address.

When you subsequently write `y = x`, no new integer is created. Instead, `y` points to the exact same memory address as `x`. You can inspect this with `id(x) == id(y)`.

### 2. Mutability vs Immutability
- **Immutable Types:** Integers, floats, booleans, strings, tuples, and frozensets. Any transformation produces a new object in memory.
- **Mutable Types:** Lists, dictionaries, sets, and custom user classes. Modifications alter the internal state in-place without altering the reference address.

```python
# Mutable demonstration
numbers = [1, 2, 3]
alias_numbers = numbers
alias_numbers.append(4)
print(numbers) # Output: [1, 2, 3, 4]
```

### 3. Key Takeaway
Always distinguish between variable binding and object mutation. Understanding references prevents subtle aliasing bugs in complex algorithms.',
    '# Variables and Memory (Simplified)

- In Python, a variable is like a label on a container, not the container itself.
- When you do `x = 42`, Python creates the number 42 and sticks the name tag "x" on it.
- **Numbers, text, and tuples cannot change** once made (they are *immutable*).
- **Lists and dictionaries can change** (they are *mutable*).
- If two variables share the same list, changing one changes both!',
    'This lesson explains how Python manages variables as memory references rather than fixed containers, clarifying the critical distinction between mutable and immutable data types.',
    1,
    15,
    'Welcome to Variables, Data Types, and Memory References. In this lesson, we explore how Python handles object references in memory. Python variables do not store values directly; they are symbolic references pointing to objects in the heap.',
    TRUE
) ON CONFLICT (module_id, slug) DO NOTHING;

-- Quiz for Lesson 1
INSERT INTO quizzes (
    id,
    lesson_id,
    title,
    description,
    passing_score
) VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'Mastery Check: Python Memory & Mutability',
    'Test your conceptual understanding of references, aliasing, and immutable types.',
    70
) ON CONFLICT (id) DO NOTHING;

-- Quiz Question 1
INSERT INTO quiz_questions (
    id,
    quiz_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    order_index
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'If `a = [10, 20]` and `b = a`, what occurs in memory when you execute `b.append(30)`?',
    'MULTIPLE_CHOICE',
    '[
        {"id": "a", "text": "A new list is copied to b, leaving a unchanged."},
        {"id": "b", "text": "Both a and b reference the same list object, which now has 3 elements."},
        {"id": "c", "text": "An error is raised because lists are immutable in Python."},
        {"id": "d", "text": "a is deleted to free memory for b."}
    ]'::jsonb,
    '["b"]'::jsonb,
    'Lists are mutable objects in Python. Since b was assigned from a (b = a), both variables point to the same memory reference. Calling append modifies the underlying list in-place.',
    1
) ON CONFLICT (id) DO NOTHING;

-- Quiz Question 2
INSERT INTO quiz_questions (
    id,
    quiz_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    order_index
) VALUES (
    '10000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'Which of the following built-in Python types is IMMUTABLE?',
    'MULTIPLE_CHOICE',
    '[
        {"id": "a", "text": "List"},
        {"id": "b", "text": "Dictionary"},
        {"id": "c", "text": "Tuple"},
        {"id": "d", "text": "Set"}
    ]'::jsonb,
    '["c"]'::jsonb,
    'Tuples are immutable sequences. Once created, their elements and length cannot be modified. Lists, Dictionaries, and Sets are all mutable.',
    2
) ON CONFLICT (id) DO NOTHING;

-- Enrollment
INSERT INTO course_enrollments (student_id, course_id, is_completed)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    FALSE
) ON CONFLICT (student_id, course_id) DO NOTHING;
