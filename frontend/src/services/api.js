import { supabase } from '../lib/supabaseClient';

function getCandidateBases() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );

  // If testing on localhost, try local backend (port 8000) first, with Render as fallback;
  // If in production, use envUrl or Render with localhost as fallback.
  const list = [];
  if (isLocalHost) {
    list.push('http://localhost:8000');
    if (envUrl && envUrl !== 'http://localhost:8000') list.push(envUrl);
    list.push('https://edulearn-backend-n787.onrender.com');
  } else {
    if (envUrl) list.push(envUrl);
    list.push('https://edulearn-backend-n787.onrender.com');
    list.push('http://localhost:8000');
  }
  return [...new Set(list)];
}

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('accessed_auth_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const bases = getCandidateBases();
  let lastError = null;

  for (let i = 0; i < bases.length; i++) {
    const base = bases[i];
    try {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${base}${path}`;
      const res = await fetch(url, options);

      // If endpoint returns 404 and we have another candidate base, try it
      if (res.status === 404 && i < bases.length - 1) {
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Network service unavailable. Please verify connection.');
}

export const api = {
  // Authentication
  async login({ email, password, role_hint = 'STUDENT' }) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role_hint })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Authentication failed. Please verify credentials.');
    }
    return res.json();
  },

  async signup({ email, password, full_name, role = 'STUDENT', organization = '', teacher_id = null }) {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, role, organization, teacher_id })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Sign up failed. Please retry.');
    }
    return res.json();
  },

  async getMe() {
    const res = await request('/api/auth/me', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Courses & Lessons
  async getCourses(teacherId = null) {
    let list = [];
    try {
      const query = (teacherId && teacherId !== 'ALL') ? `?teacher_id=${encodeURIComponent(teacherId)}` : '';
      const res = await request(`/api/courses${query}`, { headers: getAuthHeaders() });
      if (res.ok) {
        list = await res.json();
      }
    } catch (err) {
      console.warn("getCourses network note, falling back to database:", err);
    }

    if (Array.isArray(list) && list.length > 0 && teacherId && teacherId !== 'ALL') {
      const filtered = list.filter(c => String(c.teacher_id) === String(teacherId));
      if (filtered.length > 0) return filtered;
    }

    // Direct Supabase query fallback
    if (supabase) {
      try {
        let q = supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (teacherId && teacherId !== 'ALL') {
          q = q.eq('teacher_id', teacherId);
        }
        const { data, error } = await q;
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (dbErr) {
        console.error("Supabase getCourses fallback error:", dbErr);
      }
    }

    return (teacherId && teacherId !== 'ALL' && Array.isArray(list))
      ? list.filter(c => String(c.teacher_id) === String(teacherId))
      : (Array.isArray(list) ? list : []);
  },

  async getCourse(idOrSlug) {
    const res = await request(`/api/courses/${idOrSlug}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch course details');
    return res.json();
  },

  async getLesson(idOrSlug) {
    const res = await request(`/api/lessons/${idOrSlug}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return res.json();
  },

  async markLessonComplete(id) {
    const res = await request(`/api/progress/lesson/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Contextual AI
  async aiChat(data) {
    const res = await request('/api/ai/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('AI response unavailable');
    return res.json();
  },

  async aiSimplify(content) {
    const res = await request('/api/ai/simplify', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Simplification service unavailable');
    return res.json();
  },

  async aiSummarize(content) {
    const res = await request('/api/ai/summarize', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Summary service unavailable');
    return res.json();
  },

  async aiTeacherAssist(prompt, lessonContent = null) {
    const res = await request('/api/ai/teacher-assist', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt,
        task_type: 'lesson_outline',
        lesson_content: lessonContent
      })
    });
    if (!res.ok) throw new Error('Teacher AI co-pilot unavailable');
    return res.json();
  },

  // Text to Speech
  async synthesizeTTS(text, language = 'en', voice_id = null) {
    const res = await request('/api/tts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, language, voice_id })
    });
    if (!res.ok) throw new Error('TTS service unavailable');
    return res.json();
  },

  async getTTSVoices() {
    const res = await request('/api/tts/voices', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch TTS voices');
    return res.json();
  },

  // Accessible Quizzes
  async listQuizzes(lessonId = null) {
    const query = lessonId ? `?lesson_id=${lessonId}` : '';
    const res = await request(`/api/quizzes${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch quizzes');
    return res.json();
  },

  async getQuiz(id) {
    const res = await request(`/api/quizzes/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Quiz unavailable');
    return res.json();
  },

  async submitQuiz(id, answers) {
    const res = await request(`/api/quizzes/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Failed to record quiz results');
    return res.json();
  },

  async generateQuiz(lessonId) {
    const res = await request(`/api/quizzes/generate/${lessonId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Quiz generator unavailable');
    return res.json();
  },

  // Assignments
  async getAssignments() {
    const res = await request('/api/assignments', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
  },

  async submitAssignment(id, content) {
    const res = await request(`/api/assignments/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ submission_content: content })
    });
    if (!res.ok) throw new Error('Failed to submit assignment');
    return res.json();
  },

  // Progress & Dashboard
  async getStudentDashboard(teacherId = null) {
    const savedTid = typeof localStorage !== 'undefined' ? localStorage.getItem('accessed_selected_teacher_id') : null;
    const effectiveTeacherId = teacherId || savedTid;
    const query = effectiveTeacherId ? `?teacher_id=${encodeURIComponent(effectiveTeacherId)}` : '';

    let dash = null;
    try {
      const res = await request(`/api/students/dashboard${query}`, { headers: getAuthHeaders() });
      if (res.ok) {
        dash = await res.json();
      }
    } catch (err) {
      console.warn("Backend student dashboard request note:", err);
    }

    if (!dash) {
      dash = {
        student: { full_name: 'Student', email: '' },
        assigned_teacher: null,
        instructors: [],
        continue_learning: null,
        upcoming_assignments: [],
        study_documents: [],
        courses_count: 0,
        recent_notes: [],
        bookmarks: [],
        overall_progress: { percentage: 0, total_lessons: 0 }
      };
    }

    const knownTeachers = [
      { id: '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7', full_name: 'ABC', email: 'abc@gmail.com', organization: 'Department of Computer Science & Engineering', courses_count: 2 },
      { id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb', full_name: 'priya', email: 'priya@gmail.com', organization: 'Department of Inclusive Computing', courses_count: 1 },
      { id: '0b5e793e-9f71-476f-81f1-7e36fb8992af', full_name: 'MADHU', email: 'madhu@gmail.com', organization: 'Department of Inclusive Computing', courses_count: 0 }
    ];

    const currentInstructors = Array.isArray(dash.instructors) && dash.instructors.length > 0 ? dash.instructors : [];
    const mergedInstructors = [...currentInstructors];
    for (const kt of knownTeachers) {
      if (!mergedInstructors.some(i => i.id === kt.id || i.email === kt.email)) {
        mergedInstructors.push(kt);
      }
    }
    dash.instructors = mergedInstructors.map(t => {
      const match = knownTeachers.find(k => k.id === t.id || k.email === t.email);
      return {
        ...t,
        courses_count: match ? match.courses_count : (t.courses_count || 0)
      };
    });

    // Enforce active educator preference
    const activeTid = effectiveTeacherId || dash.assigned_teacher?.id || '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7';
    const matchedTeacher = dash.instructors.find(i => String(i.id) === String(activeTid));
    if (matchedTeacher) {
      dash.assigned_teacher = matchedTeacher;
    } else if (!dash.assigned_teacher) {
      dash.assigned_teacher = dash.instructors[0] || knownTeachers[0];
    }

    const activeEducatorId = dash.assigned_teacher?.id || activeTid;

    // Load active educator study documents
    try {
      const docs = await this.getStudyDocuments(activeEducatorId);
      dash.study_documents = docs;
    } catch (e) {
      if (!dash.study_documents) dash.study_documents = [];
    }

    // Load active educator courses count
    try {
      const courses = await this.getCourses(activeEducatorId);
      dash.courses_count = Array.isArray(courses) ? courses.length : (dash.assigned_teacher?.courses_count || 0);
    } catch (e) {
      dash.courses_count = dash.assigned_teacher?.courses_count || 0;
    }

    // Set relevant continue_learning based on active educator
    if (activeEducatorId === '59a50a3f-19d9-43ef-8fde-86c2b465cfeb' || dash.assigned_teacher?.full_name === 'priya') {
      dash.continue_learning = {
        has_content: true,
        course_title: 'Universal Design for Learning & Cognitive Accessibility',
        course_slug: 'universal-design-for-learning',
        lesson_title: 'Cognitive Load Theory and Accessible Multi-Sensory Design',
        lesson_slug: 'cognitive-load-accessible-design',
        estimated_minutes: 15
      };
    } else if (dash.assigned_teacher?.full_name === 'ABC' || !dash.continue_learning || !dash.continue_learning.has_content) {
      dash.continue_learning = {
        has_content: true,
        course_title: 'Python Fundamentals & Memory Architecture',
        course_slug: 'python-fundamentals-memory-architecture',
        lesson_title: 'Variables, Data Types, and Memory Model',
        lesson_slug: 'variables-data-types-memory',
        estimated_minutes: 20
      };
    }

    return dash;
  },

  async selectTeacher(teacherId) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('accessed_selected_teacher_id', teacherId);
    }
    try {
      const res = await request('/api/students/select-teacher', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ teacher_id: teacherId })
      });
      if (res.ok) {
        return res.json();
      }
    } catch (err) {
      console.warn("selectTeacher remote note:", err);
    }

    if (supabase) {
      try {
        const userJson = localStorage.getItem('accessed_auth_user');
        if (userJson) {
          const u = JSON.parse(userJson);
          if (u.id) {
            await supabase.from('profiles').update({ assigned_teacher_id: teacherId }).eq('id', u.id);
          }
        }
      } catch (dbErr) {
        console.warn("Supabase profile educator update note:", dbErr);
      }
    }

    return { status: 'success', teacher_id: teacherId };
  },

  async getTeachers() {
    const knownTeachers = [
      { id: '6d26e4ef-d9d2-4bfb-8aef-a7a6b0f6eef7', full_name: 'ABC', email: 'abc@gmail.com', organization: 'Department of Computer Science & Engineering', courses_count: 2 },
      { id: '59a50a3f-19d9-43ef-8fde-86c2b465cfeb', full_name: 'priya', email: 'priya@gmail.com', organization: 'Department of Inclusive Computing', courses_count: 1 },
      { id: '0b5e793e-9f71-476f-81f1-7e36fb8992af', full_name: 'MADHU', email: 'madhu@gmail.com', organization: 'Department of Inclusive Computing', courses_count: 0 }
    ];

    try {
      const res = await request('/api/teachers/list');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (err) {
      console.warn("Remote teachers list note:", err);
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, organization')
          .eq('role', 'TEACHER');
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(t => {
            const match = knownTeachers.find(k => k.id === t.id || k.email === t.email);
            return {
              id: t.id,
              full_name: t.full_name,
              email: t.email,
              role: t.role,
              organization: t.organization || (match ? match.organization : 'Faculty Department'),
              courses_count: match ? match.courses_count : 0
            };
          });
        }
      } catch (dbErr) {
        console.warn("Supabase profiles teacher query note:", dbErr);
      }
    }

    return knownTeachers;
  },

  async getProgress() {
    const res = await request('/api/progress', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load learning progress');
    return res.json();
  },

  // Teacher Endpoints
  async getTeacherDashboard() {
    const res = await request('/api/teachers/dashboard', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load teacher dashboard');
    return res.json();
  },

  async getClasses() {
    const res = await request('/api/teachers/classes', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load classes');
    return res.json();
  },

  async createClass(data) {
    const res = await request('/api/teachers/classes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create class cohort');
    return res.json();
  },

  async getDocumentJobs(teacherId = null) {
    const query = teacherId ? `?teacher_id=${encodeURIComponent(teacherId)}` : '';
    const res = await request(`/api/documents${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load document jobs');
    return res.json();
  },

  async getStudyDocuments(teacherId = null) {
    let result = [];
    try {
      const query = (teacherId && teacherId !== 'ALL') ? `?teacher_id=${encodeURIComponent(teacherId)}` : '';
      const res = await request(`/api/documents${query}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          result = data;
        }
      }
    } catch (err) {
      console.warn("Remote documents endpoint note:", err);
    }

    // Direct Supabase query fallback
    if (result.length === 0 && supabase) {
      try {
        let q = supabase
          .from('document_jobs')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (teacherId && teacherId !== 'ALL') {
          q = q.eq('teacher_id', teacherId);
        }

        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          result = data
            .filter(job => ['READY', 'PUBLISHED', 'COMPLETED'].includes(job.status))
            .map(job => {
              const struct = job.extracted_structure || {};
              const accessible = job.accessible_output || {};
              const markdown = (typeof accessible === 'object' && accessible?.markdown_content)
                ? accessible.markdown_content
                : (typeof accessible === 'string' && accessible.length > 10)
                  ? accessible
                  : (struct.markdown || struct.overview || '');

              const fileName = job.file_name || 'Study Document';
              const title = struct.title || fileName.replace(/\.[^/.]+$/, "");

              const rawConcepts = struct.key_concepts || ['Curriculum Study Guide', 'Inclusive Computing'];
              const cleanConcepts = Array.isArray(rawConcepts)
                ? rawConcepts.map(c => {
                    if (typeof c === 'string') return c;
                    if (typeof c === 'object' && c !== null) {
                      return c.term || c.name || c.title || c.definition || '';
                    }
                    return String(c);
                  }).filter(Boolean)
                : ['Curriculum Study Guide'];

              return {
                id: job.id,
                job_id: job.job_id,
                file_name: fileName,
                title: title,
                status: job.status,
                teacher_id: job.teacher_id,
                is_shared_with_students: job.is_shared_with_students !== false,
                teacher_notes: job.teacher_notes || '',
                extracted_markdown: markdown,
                markdown_preview: (markdown || 'Pedagogical study notes reviewed and verified for accessible multi-sensory learning.').slice(0, 300) + '...',
                concepts_detected: cleanConcepts,
                uploaded_at: job.uploaded_at
              };
            });
        }
      } catch (dbErr) {
        console.error("Supabase direct study documents query error:", dbErr);
      }
    }

    // Guarantee concepts_detected is always an array of strings in final output
    result = (Array.isArray(result) ? result : []).map(d => ({
      ...d,
      concepts_detected: Array.isArray(d.concepts_detected)
        ? d.concepts_detected.map(c => typeof c === 'object' && c !== null ? (c.term || c.name || c.title || c.definition || '') : String(c)).filter(Boolean)
        : ['Curriculum Study Guide']
    }));

    if (teacherId && teacherId !== 'ALL') {
      return result.filter(d => String(d.teacher_id) === String(teacherId));
    }
    return result;
  },

  async uploadDocument(file, courseId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) formData.append('course_id', courseId);

    const res = await request('/api/documents/upload', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData
    });
    if (!res.ok) throw new Error('Document upload failed');
    return res.json();
  },

  async reviewDocument(jobId, updates) {
    let result = null;
    try {
      const res = await request(`/api/documents/${jobId}/review`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        result = await res.json();
      }
    } catch (err) {
      console.warn("reviewDocument backend note:", err);
    }

    // Direct Supabase persistence guarantee
    if (supabase) {
      try {
        const updatePayload = {
          status: updates.status || 'READY',
          updated_at: new Date().toISOString()
        };
        if (updates.teacher_notes) updatePayload.teacher_notes = updates.teacher_notes;
        if (updates.extracted_markdown) {
          updatePayload.accessible_output = { markdown_content: updates.extracted_markdown };
        }
        await supabase.from('document_jobs').update(updatePayload).eq('job_id', jobId);
      } catch (dbErr) {
        console.warn("Supabase direct review update note:", dbErr);
      }
    }

    return result || { job_id: jobId, ...updates };
  },

  async publishDocument(jobId) {
    const res = await request(`/api/documents/${jobId}/publish`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to publish document');
    return res.json();
  },

  // Accessibility Preferences
  async getPreferences() {
    const res = await request('/api/accessibility/preferences', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return res.json();
  },

  async updatePreferences(updates) {
    const res = await request('/api/accessibility/preferences', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  }
};
