import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './features/accessibility/AccessibilityContext';
import { AuditoryOrientationProvider } from './features/accessibility/AuditoryOrientationContext';
import { AuthProvider } from './features/auth/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { TeacherLayout } from './layouts/TeacherLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProductPage } from './pages/public/ProductPage';
import { AccessibilityPage } from './pages/public/AccessibilityPage';
import { AIPage } from './pages/public/AIPage';
import { SolutionsPage } from './pages/public/SolutionsPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { AccessibilityStatement } from './pages/public/AccessibilityStatement';
import { PrivacyPage, TermsPage } from './pages/public/LegalPages';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ProtectedRoute, PublicAuthRoute } from './components/common/ProtectedRoute';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentDocumentsPage } from './pages/student/StudentDocumentsPage';
import { CourseLibraryPage, CourseDetailPage } from './pages/student/CoursePages';
import { LessonReaderPage } from './pages/student/LessonReaderPage';
import { AITutorPage } from './pages/student/AITutorPage';
import { QuizPage } from './pages/student/QuizPage';
import { AssignmentsPage } from './pages/student/AssignmentsPage';
import { RevisionPage } from './pages/student/RevisionPage';
import { ProgressPage } from './pages/student/ProgressPage';
import { AccessibilityCenterPage } from './pages/student/AccessibilityCenterPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ClassesManagementPage } from './pages/teacher/ClassesManagementPage';
import { DocumentProcessingPage } from './pages/teacher/DocumentProcessingPage';
import { TeacherAccessibilityPreview } from './pages/teacher/TeacherAccessibilityPreview';
import { LessonBuilderPage } from './pages/teacher/LessonBuilderPage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import {
  TeacherCoursesPage,
  TeacherAIAssistantPage,
  TeacherAnalyticsPage
} from './pages/teacher/TeacherCurriculumPages';

export default function App() {
  return (
    <AccessibilityProvider>
      <AuditoryOrientationProvider>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Public Experience */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="product" element={<ProductPage />} />
                  <Route path="accessibility" element={<AccessibilityPage />} />
                  <Route path="ai" element={<AIPage />} />
                  <Route path="solutions" element={<SolutionsPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="accessibility-statement" element={<AccessibilityStatement />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route
                    path="signin"
                    element={
                      <PublicAuthRoute>
                        <SignInPage />
                      </PublicAuthRoute>
                    }
                  />
                  <Route
                    path="get-started"
                    element={
                      <PublicAuthRoute>
                        <SignUpPage />
                      </PublicAuthRoute>
                    }
                  />

                  {/* Standalone Course Details, Lesson Reader, and Quizzes */}
                  <Route path="courses/:courseSlug" element={<CourseDetailPage />} />
                  <Route path="courses/:courseSlug/lessons/:lessonSlug" element={<LessonReaderPage />} />
                  <Route path="quizzes/:quizId" element={<QuizPage />} />
                </Route>

                {/* Student Portal (Strictly guarded for STUDENTS only) */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRole="STUDENT">
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentDashboard />} />
                  <Route path="courses" element={<CourseLibraryPage />} />
                  <Route path="explore" element={<CourseLibraryPage />} />
                  <Route path="documents" element={<StudentDocumentsPage />} />
                  <Route path="courses/:courseSlug" element={<CourseDetailPage />} />
                  <Route path="ai-tutor" element={<AITutorPage />} />
                  <Route path="assignments" element={<AssignmentsPage />} />
                  <Route path="revision" element={<RevisionPage />} />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="accessibility-center" element={<AccessibilityCenterPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Teacher Portal (Strictly guarded for TEACHERS only) */}
                <Route
                  path="/teacher"
                  element={
                    <ProtectedRoute allowedRole="TEACHER">
                      <TeacherLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<TeacherDashboard />} />
                  <Route path="classes" element={<ClassesManagementPage />} />
                  <Route path="courses" element={<TeacherCoursesPage />} />
                  <Route path="courses/:courseSlug" element={<CourseDetailPage />} />
                  <Route path="documents" element={<DocumentProcessingPage />} />
                  <Route path="assignments" element={<TeacherAssignmentsPage />} />
                  <Route path="accessibility-preview" element={<TeacherAccessibilityPreview />} />
                  <Route path="ai-assistant" element={<TeacherAIAssistantPage />} />
                  <Route path="analytics" element={<TeacherAnalyticsPage />} />
                  <Route path="lessons/new" element={<LessonBuilderPage />} />
                </Route>

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </AuthProvider>
      </AuditoryOrientationProvider>
    </AccessibilityProvider>
  );
}
