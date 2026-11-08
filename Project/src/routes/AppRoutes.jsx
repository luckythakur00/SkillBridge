import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../components/layout/Layouts';
import DashboardLayout from '../components/layout/DashboardLayout';
import { PageLoader } from '../components/ui/Primitives';
import { DashboardRedirect, GuestRoute, ProtectedRoute } from './guards';

const page = (loader) => lazy(loader);

const LandingPage = page(() => import('../pages/public/LandingPage'));
const PublicOpportunities = page(() => import('../pages/public/OpportunitiesPage'));
const PublicOpportunityDetail = page(() => import('../pages/public/OpportunityDetailPage'));
const PublicPortfolio = page(() => import('../pages/public/PublicPortfolioPage'));
const LegalPage = page(() => import('../pages/public/LegalPage'));
const NotFoundPage = page(() => import('../pages/public/NotFoundPage'));

const LoginPage = page(() => import('../pages/auth/LoginPage'));
const RegisterPage = page(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = page(() => import('../pages/auth/ForgotPasswordPage'));

const CandidateDashboard = page(() => import('../pages/candidate/DashboardPage'));
const CandidateProfile = page(() => import('../pages/candidate/ProfilePage'));
const AssessmentsPage = page(() => import('../pages/candidate/AssessmentsPage'));
const TakeAssessmentPage = page(() => import('../pages/candidate/TakeAssessmentPage'));
const SkillMappingPage = page(() => import('../pages/candidate/SkillMappingPage'));
const CandidateOpportunities = page(() => import('../pages/candidate/OpportunitiesPage'));
const CandidateOpportunityDetail = page(() => import('../pages/candidate/OpportunityDetailPage'));
const MyApplicationsPage = page(() => import('../pages/candidate/ApplicationsPage'));
const LearningPage = page(() => import('../pages/candidate/LearningPage'));
const AcademicPage = page(() => import('../pages/candidate/AcademicPage'));
const PortfolioPage = page(() => import('../pages/candidate/PortfolioPage'));

const RecruiterDashboard = page(() => import('../pages/recruiter/DashboardPage'));
const OrganizationPage = page(() => import('../pages/recruiter/OrganizationPage'));
const PostingsPage = page(() => import('../pages/recruiter/PostingsPage'));
const PostingFormPage = page(() => import('../pages/recruiter/PostingFormPage'));
const ReceivedApplicationsPage = page(() => import('../pages/recruiter/ApplicationsPage'));
const CandidateSearchPage = page(() => import('../pages/recruiter/CandidateSearchPage'));
const CandidateDetailPage = page(() => import('../pages/recruiter/CandidateDetailPage'));
const ProgramsPage = page(() => import('../pages/recruiter/ProgramsPage'));
const AnalyticsPage = page(() => import('../pages/recruiter/AnalyticsPage'));
const InstitutionInsightsPage = page(() => import('../pages/recruiter/InstitutionInsightsPage'));

const NotificationsPage = page(() => import('../pages/shared/NotificationsPage'));
const SettingsPage = page(() => import('../pages/shared/SettingsPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8"><PageLoader /></div>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/opportunities" element={<PublicOpportunities />} />
          <Route path="/opportunities/:id" element={<PublicOpportunityDetail />} />
          <Route path="/portfolio/:id" element={<PublicPortfolio />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Navigate to="/login/candidate" replace />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/register/candidate" replace />} />
          <Route path="/register/:role" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/profile" element={<Navigate to="/candidate/profile" replace />} />

        <Route element={<ProtectedRoute role="CANDIDATE" />}>
          <Route path="/candidate" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="profile" element={<CandidateProfile />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="assessments/:id" element={<TakeAssessmentPage />} />
            <Route path="skill-mapping" element={<SkillMappingPage />} />
            <Route path="opportunities" element={<CandidateOpportunities />} />
            <Route path="opportunities/:id" element={<CandidateOpportunityDetail />} />
            <Route path="applications" element={<MyApplicationsPage />} />
            <Route path="learning" element={<LearningPage />} />
            <Route path="academic" element={<AcademicPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="RECRUITER" />}>
          <Route path="/recruiter" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="organization" element={<OrganizationPage />} />
            <Route path="jobs" element={<PostingsPage type="JOB" />} />
            <Route path="jobs/new" element={<PostingFormPage type="JOB" />} />
            <Route path="jobs/:id/edit" element={<PostingFormPage type="JOB" />} />
            <Route path="internships" element={<PostingsPage type="INTERNSHIP" />} />
            <Route path="internships/new" element={<PostingFormPage type="INTERNSHIP" />} />
            <Route path="internships/:id/edit" element={<PostingFormPage type="INTERNSHIP" />} />
            <Route path="applications" element={<ReceivedApplicationsPage />} />
            <Route path="candidates" element={<CandidateSearchPage />} />
            <Route path="candidates/:id" element={<CandidateDetailPage />} />
            <Route path="programs" element={<ProgramsPage group="LEARNING" />} />
            <Route path="collaborations" element={<ProgramsPage group="COLLABORATION" />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="institution-insights" element={<InstitutionInsightsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
