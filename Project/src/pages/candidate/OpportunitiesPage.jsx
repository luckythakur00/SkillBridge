import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import OpportunityBrowser from '../../components/opportunities/OpportunityBrowser';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import Button from '../../components/ui/Button';
import { Card, CardGridSkeleton, EmptyState, PageHeader, Tabs } from '../../components/ui/Primitives';
import { useJobStore } from '../../store/jobStore';

const BASE_PATH = '/candidate/opportunities';

export default function OpportunitiesPage() {
  const [tab, setTab] = useState('browse');
  const saved = useJobStore((state) => state.saved);
  const savedLoading = useJobStore((state) => state.loading.saved);
  const fetchSaved = useJobStore((state) => state.fetchSaved);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  return (
    <div>
      <PageHeader title="Jobs & internships" description="Find opportunities and see how well each one matches your skills." />
      <Tabs
        label="Opportunity views"
        active={tab}
        onChange={setTab}
        tabs={[{ value: 'browse', label: 'Browse' }, { value: 'saved', label: 'Saved', count: saved.length }]}
      />
      {tab === 'browse' ? <OpportunityBrowser basePath={BASE_PATH} /> : savedLoading && !saved.length ? <CardGridSkeleton count={3} /> : saved.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bookmark}
            title="No saved opportunities"
            description="Select the bookmark on any opportunity to keep it here."
            action={<Button variant="secondary" onClick={() => setTab('browse')}>Browse opportunities</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((item) => <OpportunityCard key={item.id} opportunity={item} basePath={BASE_PATH} />)}
        </div>
      )}
    </div>
  );
}
