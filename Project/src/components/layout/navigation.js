import {
  Award, BarChart3, Bell, BookOpen, Briefcase, Building2, ClipboardList, FolderKanban, GraduationCap,
  Handshake, LayoutDashboard, Library, School, Search, Settings, Target, UserRound,
} from 'lucide-react';

export const NAVIGATION = {
  CANDIDATE: [
    {
      items: [
        { label: 'Dashboard', to: '/candidate/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', to: '/candidate/profile', icon: UserRound },
        { label: 'Digital Portfolio', to: '/candidate/portfolio', icon: FolderKanban },
      ],
    },
    {
      title: 'Skills',
      items: [
        { label: 'Assessments', to: '/candidate/assessments', icon: Award },
        { label: 'Skill Mapping', to: '/candidate/skill-mapping', icon: Target },
      ],
    },
    {
      title: 'Opportunities',
      items: [
        { label: 'Jobs & Internships', to: '/candidate/opportunities', icon: Briefcase },
        { label: 'My Applications', to: '/candidate/applications', icon: ClipboardList },
      ],
    },
    {
      title: 'Growth',
      items: [
        { label: 'Learning Programs', to: '/candidate/learning', icon: BookOpen },
        { label: 'Academic Opportunities', to: '/candidate/academic', icon: GraduationCap, categories: ['ACADEMICIAN'] },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Notifications', to: '/candidate/notifications', icon: Bell, badge: 'notifications' },
        { label: 'Settings', to: '/candidate/settings', icon: Settings },
      ],
    },
  ],
  RECRUITER: [
    {
      items: [
        { label: 'Dashboard', to: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'Organization Profile', to: '/recruiter/organization', icon: Building2 },
      ],
    },
    {
      title: 'Recruitment',
      items: [
        { label: 'Jobs', to: '/recruiter/jobs', icon: Briefcase },
        { label: 'Internships', to: '/recruiter/internships', icon: GraduationCap },
        { label: 'Applications', to: '/recruiter/applications', icon: ClipboardList },
        { label: 'Candidate Search', to: '/recruiter/candidates', icon: Search },
      ],
    },
    {
      title: 'Programs',
      items: [
        { label: 'Learning Programs', to: '/recruiter/programs', icon: Library },
        { label: 'Collaborations', to: '/recruiter/collaborations', icon: Handshake },
      ],
    },
    {
      title: 'Insights',
      items: [
        { label: 'Analytics', to: '/recruiter/analytics', icon: BarChart3 },
        { label: 'Institution Insights', to: '/recruiter/institution-insights', icon: School, organizationTypes: ['COLLEGE', 'UNIVERSITY', 'EDUCATIONAL_INSTITUTION'] },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Notifications', to: '/recruiter/notifications', icon: Bell, badge: 'notifications' },
        { label: 'Settings', to: '/recruiter/settings', icon: Settings },
      ],
    },
  ],
};

export const PROFILE_LINK = { CANDIDATE: '/candidate/profile', RECRUITER: '/recruiter/organization' };
