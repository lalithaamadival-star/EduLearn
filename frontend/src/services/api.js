const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://edulearn-backend-n787.onrender.com';

function getAuthHeaders() {
  const token = localStorage.getItem('accessed_auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async login({ email, password, role_hint = 'STUDENT' }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
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
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
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
    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Courses & Lessons
  async getCourses(teacherId = null) {
    const url = teacherId ? `${API_BASE}/api/courses?teacher_id=${encodeURIComponent(teacherId)}` : `${API_BASE}/api/courses`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async getCourse(idOrSlug) {
    const res = await fetch(`${API_BASE}/api/courses/${idOrSlug}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch course details');
    return res.json();
  },

  async getLesson(idOrSlug) {
    const res = await fetch(`${API_BASE}/api/lessons/${idOrSlug}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return res.json();
  },

  async markLessonComplete(id) {
    const res = await fetch(`${API_BASE}/api/progress/lesson/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Contextual AI
  async aiChat(data) {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('AI response unavailable');
    return res.json();
  },

  async aiSimplify(content) {
    const res = await fetch(`${API_BASE}/api/ai/simplify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Simplification service unavailable');
    return res.json();
  },

  async aiSummarize(content) {
    const res = await fetch(`${API_BASE}/api/ai/summarize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Summary service unavailable');
    return res.json();
  },

  async aiTeacherAssist(prompt, lessonContent = null) {
    const res = await fetch(`${API_BASE}/api/ai/teacher-assist`, {
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
    const res = await fetch(`${API_BASE}/api/tts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, language, voice_id })
    });
    if (!res.ok) throw new Error('TTS service unavailable');
    return res.json();
  },

  async getTTSVoices() {
    const res = await fetch(`${API_BASE}/api/tts/voices`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch TTS voices');
    return res.json();
  },

  // Accessible Quizzes
  async listQuizzes(lessonId = null) {
    const url = lessonId ? `${API_BASE}/api/quizzes?lesson_id=${lessonId}` : `${API_BASE}/api/quizzes`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to list quizzes');
    return res.json();
  },

  async getQuiz(quizId) {
    const res = await fetch(`${API_BASE}/api/quizzes/${quizId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load quiz');
    return res.json();
  },

  async createQuiz(quizData) {
    const res = await fetch(`${API_BASE}/api/quizzes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to save quiz');
    }
    return res.json();
  },

  async submitQuiz(quizId, answers) {
    const res = await fetch(`${API_BASE}/api/quizzes/${quizId}/attempt`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quiz_id: quizId, answers })
    });
    if (!res.ok) throw new Error('Failed to submit quiz attempt');
    return res.json();
  },

  async explainQuizMistake(data) {
    const res = await fetch(`${API_BASE}/api/quizzes/explain-mistake`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Mistake explanation unavailable');
    return res.json();
  },

  // Assignments
  async getAssignments() {
    const res = await fetch(`${API_BASE}/api/assignments`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load assignments');
    return res.json();
  },

  async submitAssignment(id, content) {
    const res = await fetch(`${API_BASE}/api/assignments/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ submission_content: content })
    });
    if (!res.ok) throw new Error('Failed to submit assignment');
    return res.json();
  },

  // Progress & Dashboard
  async getStudentDashboard(teacherId = null) {
    const url = teacherId ? `${API_BASE}/api/students/dashboard?teacher_id=${encodeURIComponent(teacherId)}` : `${API_BASE}/api/students/dashboard`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load student dashboard');
    return res.json();
  },

  async selectTeacher(teacherId) {
    const res = await fetch(`${API_BASE}/api/students/select-teacher`, {
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
    const res = await fetch(`${API_BASE}/api/teachers/list`);
    if (!res.ok) throw new Error('Failed to fetch educators list');
    return res.json();
  },

  async getProgress() {
    const res = await fetch(`${API_BASE}/api/progress`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load learning progress');
    return res.json();
  },

  // Teacher Endpoints
  async getTeacherDashboard() {
    const res = await fetch(`${API_BASE}/api/teachers/dashboard`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load teacher dashboard');
    return res.json();
  },

  async getClasses() {
    const res = await fetch(`${API_BASE}/api/teachers/classes`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load classes');
    return res.json();
  },

  async createClass(data) {
    const res = await fetch(`${API_BASE}/api/teachers/classes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create class cohort');
    return res.json();
  },

  async getDocumentJobs(teacherId = null) {
    const url = teacherId ? `${API_BASE}/api/documents?teacher_id=${encodeURIComponent(teacherId)}` : `${API_BASE}/api/documents`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load document jobs');
    return res.json();
  },

  async getStudyDocuments(teacherId = null) {
    return this.getDocumentJobs(teacherId);
  },

  async uploadDocument(file, courseId = null) {
    const token = localStorage.getItem('accessed_auth_token');
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) formData.append('course_id', courseId);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error('Document upload failed');
    return res.json();
  },

  async reviewDocument(jobId, updates) {
    const res = await fetch(`${API_BASE}/api/documents/${jobId}/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update document review');
    return res.json();
  },

  async publishDocument(jobId) {
    const res = await fetch(`${API_BASE}/api/documents/${jobId}/publish`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to publish document');
    return res.json();
  },

  // Accessibility Preferences
  async getPreferences() {
    const res = await fetch(`${API_BASE}/api/accessibility/preferences`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return res.json();
  },

  async updatePreferences(updates) {
    const res = await fetch(`${API_BASE}/api/accessibility/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  }
};
