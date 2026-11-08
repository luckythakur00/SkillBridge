import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import OpportunityCard from './OpportunityCard';
import Button from '../ui/Button';
import { FilterSelect, SearchInput } from '../ui/Form';
import { Card, CardGridSkeleton, EmptyState, ErrorState, Pagination } from '../ui/Primitives';
import { useJobStore } from '../../store/jobStore';
import { useAuthStore } from '../../store/authStore';
import { EXPERIENCE_LEVELS, ORGANIZATION_TYPES, WORK_MODES } from '../../constants';
import { pluralize } from '../../utils/format';

const TYPE_OPTIONS = [{ value: 'JOB', label: 'Jobs' }, { value: 'INTERNSHIP', label: 'Internships' }];
const FILTER_DEFAULTS = { q: '', type: 'ALL', workMode: 'ALL', organizationType: 'ALL', experienceLevel: 'ALL', sort: 'recent' };

// Filters live in the URL, so a filtered list can be shared and survives the back button.
export default function OpportunityBrowser({ basePath }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const results = useJobStore((state) => state.results);
  const loading = useJobStore((state) => state.loading.results);
  const error = useJobStore((state) => state.errors.results);
  const search = useJobStore((state) => state.search);
  const isCandidate = useAuthStore((state) => state.user?.role === 'CANDIDATE');

  const filters = Object.fromEntries(
    Object.entries(FILTER_DEFAULTS).map(([key, fallback]) => [key, searchParams.get(key) ?? fallback]),
  );
  const page = Number(searchParams.get('page')) || 1;
  const [query, setQuery] = useState(filters.q);

  const setFilter = (key, value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value === FILTER_DEFAULTS[key] || value === '') next.delete(key);
      else next.set(key, value);
      if (key !== 'page') next.delete('page');
      return next;
    }, { replace: true });
  };

  // Waits for a pause in typing before searching.
  useEffect(() => {
    if (query === filters.q) return undefined;
    const timer = setTimeout(() => setFilter('q', query.trim()), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const paramsKey = searchParams.toString();
  const load = () => search({ ...filters, page, pageSize: 9 });
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const hasFilters = Object.entries(FILTER_DEFAULTS).some(([key, fallback]) => key !== 'sort' && filters[key] !== fallback);
  const clearFilters = () => {
    setQuery('');
    setSearchParams({}, { replace: true });
  };
  const sortOptions = [
    { value: 'recent', label: 'Newest first' },
    { value: 'deadline', label: 'Closing soon' },
    ...(isCandidate ? [{ value: 'match', label: 'Best skill match' }] : []),
  ];

  return (
    <div>
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by role, organization, location or skill" label="Search opportunities" />
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-wrap">
          <FilterSelect label="Opportunity type" value={filters.type} onChange={(value) => setFilter('type', value)} allLabel="All types" options={TYPE_OPTIONS} />
          <FilterSelect label="Work mode" value={filters.workMode} onChange={(value) => setFilter('workMode', value)} allLabel="Any work mode" options={WORK_MODES} />
          <FilterSelect label="Organization type" value={filters.organizationType} onChange={(value) => setFilter('organizationType', value)} allLabel="Any organization" options={ORGANIZATION_TYPES} />
          <FilterSelect label="Experience" value={filters.experienceLevel} onChange={(value) => setFilter('experienceLevel', value)} allLabel="Any experience" options={EXPERIENCE_LEVELS} />
          <div className="md:ml-auto">
            <FilterSelect label="Sort by" value={filters.sort} onChange={(value) => setFilter('sort', value)} options={sortOptions} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-slate-500" aria-live="polite">{loading ? 'Searching…' : `${pluralize(results.total, 'opportunity', 'opportunities')} found`}</p>
        {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>}
      </div>

      {error && <Card><ErrorState message={error} onRetry={load} /></Card>}
      {!error && loading && !results.items.length && <CardGridSkeleton />}
      {!error && !loading && !results.items.length && (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No opportunities match your search"
            description="Try a different keyword, or remove some filters."
            action={hasFilters && <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
          />
        </Card>
      )}
      {!error && results.items.length > 0 && (
        <>
          <div className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {results.items.map((item) => <OpportunityCard key={item.id} opportunity={item} basePath={basePath} />)}
          </div>
          <Pagination page={results.page} totalPages={results.totalPages} onChange={(next) => setFilter('page', String(next))} />
        </>
      )}
    </div>
  );
}
