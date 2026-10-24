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
    const query = teacherId ? `?teacher_id=${encodeURIComponent(teacherId)}` : '';
    const res = await request(`/api/courses${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
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
    const query = teacherId ? `?teacher_id=${encodeURIComponent(teacherId)}` : '';
    const res = await request(`/api/students/dashboard${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load student dashboard');
    return res.json();
  },

  async selectTeacher(teacherId) {
    const res = await request('/api/students/select-teacher', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teacher_id: teacherId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to select educator');
    }
    return res.json();
  },

  async getTeachers() {
    const res = await request('/api/teachers/list');
    if (!res.ok) throw new Error('Failed to fetch educators list');
    return res.json();
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
    return this.getDocumentJobs(teacherId);
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
    const res = await request(`/api/documents/${jobId}/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update document review');
    return res.json();
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
