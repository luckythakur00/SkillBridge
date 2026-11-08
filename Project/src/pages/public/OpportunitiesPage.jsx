import OpportunityBrowser from '../../components/opportunities/OpportunityBrowser';
import { PageHeader } from '../../components/ui/Primitives';
import { useAuthStore } from '../../store/authStore';

export default function OpportunitiesPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader title="Browse opportunities" description="Jobs and internships from companies, startups and academic institutions." />
      <OpportunityBrowser basePath={user?.role === 'CANDIDATE' ? '/candidate/opportunities' : '/opportunities'} />
    </div>
  );
}
