// Bulletproof fallback & offline curriculum store for AccessEd
// Ensures 100% flawless presentation on static hosting (web-a2z.com, XAMPP, or offline evaluation)

export const SEED_PROFILES = [
  {
    id: '3a12b45c-6789-4def-0123-456789abcdef',
    email: 'anu@gmail.com',
    full_name: 'Anu',
    role: 'STUDENT',
    organization: 'AccessEd Learning Community',
    selected_teacher_id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb'
  },
  {
    id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb',
    email: 'priya@gmail.com',
    full_name: 'Priya Sharma',
    role: 'TEACHER',
    organization: 'Department of Inclusive Computing & Cognitive Accessibility',
    bio: 'Specialist in Universal Design for Learning (UDL), assistive technologies, and neurodiverse learning pathways.',
    courses_count: 1
  },
  {
    id: '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7',
    email: 'abc@gmail.com',
    full_name: 'ABC',
    role: 'TEACHER',
    organization: 'Department of Computer Science & Engineering',
    bio: 'Lead educator in Systems Architecture, Python Memory Engineering, and WCAG Standards.',
    courses_count: 2
  },
  {
    id: '7b14d23e-8f92-41eb-92c1-6e47cb7891fa',
    email: 'rajesh@gmail.com',
    full_name: 'Rajesh Kumar',
    role: 'TEACHER',
    organization: 'Department of Artificial Intelligence & Data Systems',
    bio: 'Professor of Machine Intelligence, Algorithms, and Multi-Modal Computing Systems.',
    courses_count: 1
  },
  {
    id: 'eval-techbees5-id-00000',
    email: 'techbees5@gmail.com',
    full_name: 'Faculty Evaluator',
    role: 'STUDENT',
    organization: 'Academic Examination Board',
    selected_teacher_id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb'
  }
];

export const SEED_COURSES = [
  {
    id: '22222222-2222-4222-8222-111111111111',
    teacher_id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb',
    instructor_name: 'Priya Sharma',
    instructor_email: 'priya@gmail.com',
    instructor_organization: 'Department of Inclusive Computing & Cognitive Accessibility',
    title: 'Universal Design for Learning & Cognitive Accessibility',
    slug: 'universal-design-for-learning-udl',
    description: 'Pedagogical frameworks for multi-sensory curriculum presentation, ADHD/dyslexia optimizations, and auditory guidance.',
    category: 'Pedagogy & Design',
    difficulty_level: 'Beginner',
    is_published: true,
    modules: [
      {
        id: '22222222-2222-4222-8222-222222222221',
        title: 'Module 1: Cognitive Load Theory in Digital Classrooms',
        description: 'Techniques for presenting complex academic information across multiple sensory channels.',
        lessons: [
          {
            id: '22222222-2222-4222-8222-333333333331',
            slug: 'dual-coding-theory-multi-modal',
            title: 'Dual-Coding Theory and Multi-Modal Learning',
            estimated_minutes: 15,
            content_raw: `# Lesson 1: Dual-Coding Theory and Multi-Modal Learning

Dual-coding theory (Paivio, 1986) states that human working memory processes verbal and non-verbal information through separate, parallel cognitive channels.

## 1. Principles of Dual Coding
* **Verbal Channel**: Auditory speech, written sentences, semantic narratives.
* **Visual/Spatial Channel**: Diagrams, structured tables, interactive simulations.

By presenting content both textually and via structured auditory descriptions simultaneously, working memory capacity is doubled without increasing cognitive strain.

## 2. Practical Application for Inclusive Learning
1. Pair key terminology with high-contrast illustrative diagrams.
2. Provide synchronized auditory narration for textual explanations.
3. Allow student pacing control with screen reader orientation announcements.`,
            content_simplified: `# Learning with Both Ears and Eyes

Your brain understands concepts much better when it hears an explanation while looking at an organized visual aid.

* **Hearing & Reading**: Your verbal brain process.
* **Pictures & Layout**: Your visual brain process.

When you use both together, you remember twice as much without feeling overwhelmed!`,
            summary: 'Learn how dual-coding theory enhances comprehension for all students, including neurodiverse and low-vision learners.',
            audio_transcript: 'Welcome to Dual-Coding Theory and Multi-Modal Learning. We examine how verbal and visual processing channels operate in parallel to optimize student retention.'
          }
        ]
      }
    ]
  },
  {
    id: '11111111-1111-4111-8111-111111111111',
    teacher_id: '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7',
    instructor_name: 'ABC',
    instructor_email: 'abc@gmail.com',
    instructor_organization: 'Department of Computer Science & Engineering',
    title: 'Python Fundamentals & Memory Architecture',
    slug: 'python-fundamentals-memory-architecture',
    description: 'Master low-level object references, pointer behavior, mutability vs immutability, and memory layout in Python.',
    category: 'Computer Science',
    difficulty_level: 'Intermediate',
    is_published: true,
    modules: [
      {
        id: '11111111-1111-4111-8111-222222222221',
        title: 'Module 1: Memory References and Object Mutability',
        description: 'Deep dive into memory identity, pointer referencing, and garbage collection.',
        lessons: [
          {
            id: '11111111-1111-4111-8111-333333333331',
            slug: 'object-references-and-identity',
            title: 'Object References and Identity (id and is)',
            estimated_minutes: 15,
            content_raw: `# Lesson 1: Object References & Identity (id and is)

In Python, variables do not store values directly; they store **memory references** pointing to objects allocated on the heap.

## 1. Identity vs Equality
* **Equality (\`==\`)**: Compares whether two objects have equivalent contents or values.
* **Identity (\`is\`)**: Compares whether two identifiers point to the exact same memory address (\`id(a) == id(b)\`).

\`\`\`python
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)  # True (same values)
print(a is b)  # False (different heap memory addresses)
\`\`\`

## 2. Integer Caching (Small Integer Optimization)
CPython pre-allocates global singleton objects for integers between \`-5\` and \`256\`. Therefore, variables assigned numbers within this range point to identical memory addresses.`,
            content_simplified: `# Object References Made Simple

Think of a variable as a sticky note or tag with a name, and an object as a box holding the actual data.
* \`==\` checks if what is inside the two boxes looks the same.
* \`is\` checks if both sticky notes are stuck to the exact same physical box.`,
            summary: 'Understand Python memory pointer allocation, difference between equality and memory identity, and CPython integer pooling.',
            audio_transcript: 'Welcome to Object References and Identity. In Python, variables hold memory references pointing to objects allocated on the heap rather than storing raw values directly.'
          }
        ]
      }
    ]
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    teacher_id: '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7',
    instructor_name: 'ABC',
    instructor_email: 'abc@gmail.com',
    instructor_organization: 'Department of Computer Science & Engineering',
    title: 'Accessible Web Engineering & WCAG 2.2 Standards',
    slug: 'accessible-web-engineering-wcag-standards',
    description: 'Practical engineering for WCAG 2.2 AA and AAA compliance, ARIA landmarks, screen reader trees, and keyboard focus traps.',
    category: 'Web Engineering',
    difficulty_level: 'Intermediate',
    is_published: true,
    modules: [
      {
        id: '11111111-1111-4111-8111-222222222222',
        title: 'Module 1: Semantic DOM & Screen Reader Tree',
        description: 'Constructing accessible accessibility trees using native HTML semantics.',
        lessons: [
          {
            id: '11111111-1111-4111-8111-333333333332',
            slug: 'aria-landmarks-keyboard-focus',
            title: 'ARIA Landmarks, Keyboard Focus & Screen Readers',
            estimated_minutes: 20,
            content_raw: `# Lesson 1: ARIA Landmarks and Keyboard Navigation

Modern accessible web interfaces require explicit semantic structures that assist assistive technologies like NVDA, VoiceOver, and Orca.

## 1. Native HTML5 Landmarks
* \`<header>\` or \`<div role="banner">\`
* \`<nav>\` or \`<div role="navigation">\`
* \`<main>\`: The single primary content container for the document.
* \`<footer>\` or \`<div role="contentinfo">\`

## 2. Managing Focus & Skip Links
Always provide a skip-to-content link as the very first focusable element for keyboard-only navigators.`,
            content_simplified: `# Accessible Navigation Simplified

Screen readers rely on landmarks to let blind and low-vision users jump directly to parts of a page without listening to every item in order.`,
            summary: 'Implement skip links, proper landmarks, and logical tab navigation order according to WCAG 2.2 guidelines.',
            audio_transcript: 'This lesson covers ARIA landmarks and keyboard navigation fundamentals for universal accessibility.'
          }
        ]
      }
    ]
  },
  {
    id: '33333333-3333-4333-8333-111111111111',
    teacher_id: '7b14d23e-8f92-41eb-92c1-6e47cb7891fa',
    instructor_name: 'Rajesh Kumar',
    instructor_email: 'rajesh@gmail.com',
    instructor_organization: 'Department of Artificial Intelligence & Data Systems',
    title: 'Data Structures & Multi-Modal Algorithm Design',
    slug: 'data-structures-algorithm-design',
    description: 'Rigorous algorithmic problem solving, asymptotic Big-O runtime bounds, memory trees, and inclusive code diagrams.',
    category: 'Algorithms',
    difficulty_level: 'Advanced',
    is_published: true,
    modules: [
      {
        id: '33333333-3333-4333-8333-222222222221',
        title: 'Module 1: Asymptotic Bounds and Spatial Cache Efficiency',
        description: 'Analyzing worst-case time complexities and CPU cache locality in collections.',
        lessons: [
          {
            id: '33333333-3333-4333-8333-333333333331',
            slug: 'big-o-complexity-and-memory-tradeoffs',
            title: 'Big-O Complexity and Memory Tradeoffs',
            estimated_minutes: 25,
            content_raw: `# Lesson 1: Big-O Complexity and Memory Tradeoffs

Every algorithm balances two foundational computational costs: **time complexity** (CPU cycles) and **space complexity** (allocated memory).

## 1. Asymptotic Notations
* $O(1)$: Constant execution time regardless of input size.
* $O(\\log n)$: Logarithmic scaling, typical of balanced binary search trees and binary search.
* $O(n)$: Linear execution scaling proportional to input element count.
* $O(n \\log n)$: Quasilinear, optimal comparison-based sorting bound (MergeSort, HeapSort).`,
            content_simplified: `# How Fast Does Code Run?

Big-O notation is a standardized way to describe how much slower an algorithm gets as the amount of data grows from ten items to ten million.`,
            summary: 'Master the formal foundations of time and space complexity with accessible analogies and memory visualizations.',
            audio_transcript: 'Welcome to Big-O Complexity and Memory Tradeoffs. We analyze how computational runtimes scale with data size.'
          }
        ]
      }
    ]
  }
];

export const SEED_QUIZZES = [
  {
    id: '614e2cab-28a2-4ffd-945f-876024a6dfc2',
    course_id: '22222222-2222-4222-8222-111111111111',
    lesson_id: '22222222-2222-4222-8222-333333333331',
    title: 'UDL Mastery Quiz: Representation Frameworks',
    description: 'Diagnostic quiz on multi-modal accessibility guidelines.',
    passing_score: 75,
    total_questions: 2,
    questions: [
      {
        id: 'udl-q1',
        question_text: 'What does Principle 1 of Universal Design for Learning (UDL) emphasize?',
        options: [
          'Multiple Means of Representation',
          'Multiple Means of Action & Expression',
          'Multiple Means of Grading',
          'Strict Exam Constraints'
        ],
        correct_answer: ['Multiple Means of Representation'],
        explanation: 'Principle 1 addresses providing multiple ways to perceive and comprehend information.'
      },
      {
        id: 'udl-q2',
        question_text: 'According to Dual-Coding Theory, what are the two separate cognitive channels in working memory?',
        options: [
          'Verbal channel and Visual/Spatial channel',
          'Short-term channel and Long-term channel',
          'Left hemisphere and Right hemisphere',
          'Text only and Audio only'
        ],
        correct_answer: ['Verbal channel and Visual/Spatial channel'],
        explanation: 'Paivio dual-coding establishes distinct verbal and visual processing pathways.'
      }
    ]
  },
  {
    id: '11111111-1111-4111-8111-444444444441',
    course_id: '11111111-1111-4111-8111-111111111111',
    lesson_id: '11111111-1111-4111-8111-333333333331',
    title: 'Diagnostic Mastery: Object References & Identity',
    description: 'Test understanding of memory addressing, pointer references, and equality vs identity.',
    passing_score: 70,
    total_questions: 2,
    questions: [
      {
        id: 'q1',
        question_text: "What is the primary difference between the '==' operator and the 'is' operator in Python?",
        options: [
          "'==' checks value equality, whereas 'is' checks memory identity (address)",
          "'is' checks value equality, whereas '==' checks memory identity",
          'Both operators perform bitwise memory comparison',
          "'==' is only for strings and 'is' is only for numbers"
        ],
        correct_answer: ["'==' checks value equality, whereas 'is' checks memory identity (address)"],
        explanation: "'==' invokes __eq__() to check content equality, whereas 'is' verifies whether id(a) == id(b)."
      },
      {
        id: 'q2',
        question_text: "Why do variables assigned to integer 100 evaluate to 'True' with 'is' in CPython?",
        options: [
          'CPython pre-caches small integers from -5 to 256 as singleton heap objects',
          'Python compiler converts all numbers into strings',
          'Integers are stored directly in CPU registers',
          'Numbers in Python do not have memory addresses'
        ],
        correct_answer: ['CPython pre-caches small integers from -5 to 256 as singleton heap objects'],
        explanation: 'CPython pre-allocates an array of integer objects for values between -5 and 256 for performance.'
      }
    ]
  }
];

export const SEED_ASSIGNMENTS = [
  {
    id: 'asg-udl-001',
    course_id: '22222222-2222-4222-8222-111111111111',
    teacher_id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb',
    course_title: 'Universal Design for Learning & Cognitive Accessibility',
    instructor_name: 'Priya Sharma',
    instructor_email: 'priya@gmail.com',
    title: 'Problem Set: Universal Design Multiple Means of Representation',
    instructions: `1. Select one complex technical concept from computer science (e.g. pointer arithmetic or recursion).
2. Author an inclusive representation plan providing:
   a) A clear verbal definition with everyday analogy.
   b) A visual ASCII or Mermaid diagram.
   c) Auditory guidance transcript for blind or low-vision learners.
3. Submit your solution text in the response box below.`,
    max_score: 100,
    due_date: '2026-11-25T18:30:00.000Z',
    status: 'ASSIGNED',
    submission: null,
    score: null,
    feedback: null
  },
  {
    id: 'asg-py-002',
    course_id: '11111111-1111-4111-8111-111111111111',
    teacher_id: '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7',
    course_title: 'Python Fundamentals & Memory Architecture',
    instructor_name: 'ABC',
    instructor_email: 'abc@gmail.com',
    title: 'Python Dict Comprehensions & Hash Invariants',
    instructions: 'Demonstrate the O(1) average lookup invariant using key hashes in Python 3.11+. Write a concise code example verifying hash collisions and bucket distribution.',
    max_score: 50,
    due_date: '2026-11-28T18:30:00.000Z',
    status: 'ASSIGNED',
    submission: null,
    score: null,
    feedback: null
  }
];

export const SEED_STUDY_DOCS = [
  {
    job_id: 'doc-udl-notes-01',
    teacher_id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb',
    title: 'Inclusive Computing Lecture Notes - Multi-Sensory Modalities',
    file_name: 'UDL_Inclusive_Pedagogy_Reference.pdf',
    concepts_detected: ['Dual-Coding Theory', 'Auditory Transcripts', 'WCAG AAA Standards', 'Cognitive Accessibility'],
    markdown_preview: 'Comprehensive pedagogical guidelines for neurodiverse and sensory-adapted academic classrooms. Emphasizes synchronized text-to-speech, high contrast color palettes, and auditory navigational waypoints.',
    extracted_markdown: `# Inclusive Computing & UDL Framework Notes

## Core Guidelines
1. **Perception**: Information must be presentable to users in ways they can perceive (auditory, visual, tactile).
2. **Operability**: Interface components and navigation must be operable via standard keyboard and screen reader.
3. **Understandability**: Information and operation must be understandable through plain-language and analogies.

### Pedagogical References
- Rose, D. H., & Meyer, A. (2002). Teaching every student in the digital age.
- Paivio, A. (1986). Mental representations: A dual coding approach.`
  },
  {
    job_id: 'doc-py-notes-02',
    teacher_id: '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7',
    title: 'Python Memory Addressing & CPython Internals Guide',
    file_name: 'Python_Memory_Architecture_DeepDive.pdf',
    concepts_detected: ['Pointer References', 'Heap vs Stack', 'CPython Small Int Caching', 'Garbage Collection'],
    markdown_preview: 'Technical guide analyzing CPython PyObject structures, reference counting, cyclic garbage collection, and memory aliasing.',
    extracted_markdown: `# CPython Memory Internals

Every object in Python is represented as a \`PyObject\` struct on the heap, containing:
1. \`ob_refcnt\`: Reference count for automatic memory reclamation.
2. \`ob_type\`: Pointer to the object type descriptor.

When you execute \`x = [1, 2, 3]\`, \`x\` holds the memory address of the list struct, not the array elements themselves.`
  }
];
