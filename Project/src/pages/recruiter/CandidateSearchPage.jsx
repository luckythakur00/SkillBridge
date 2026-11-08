import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, SearchX } from 'lucide-react';
import { MatchBadge } from '../../components/opportunities/OpportunityCard';
import { FilterSelect, SearchInput } from '../../components/ui/Form';
import { Avatar, Badge, Card, CardGridSkeleton, EmptyState, ErrorState, PageHeader, Pagination, SkillTag } from '../../components/ui/Primitives';
import { useRecruiterStore } from '../../store/recruiterStore';
import { useJobStore } from '../../store/jobStore';
import { CANDIDATE_CATEGORIES, CANDIDATE_CATEGORY_LABELS } from '../../constants';
import { pluralize } from '../../utils/format';

export default function CandidateSearchPage() {
  const results = useRecruiterStore((state) => state.candidateResults);
  const loading = useRecruiterStore((state) => state.loading.candidates);
  const error = useRecruiterStore((state) => state.errors.candidates);
  const searchCandidates = useRecruiterStore((state) => state.searchCandidates);
  const postings = useJobStore((state) => state.postings);
  const fetchPostings = useJobStore((state) => state.fetchPostings);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [opportunityId, setOpportunityId] = useState('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPostings();
  }, [fetchPostings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const params = { q: debouncedQuery, category, opportunityId, verifiedOnly: verifiedOnly ? 'true' : '', page, pageSize: 9 };
  const load = () => searchCandidates(params);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, category, opportunityId, verifiedOnly, page]);

  const resetPageAnd = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <PageHeader title="Candidate search" description="Find candidates by skill, and rank them against one of your postings." />

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name, skill, institution or location" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:flex md:flex-wrap md:items-center">
          <FilterSelect label="Category" value={category} onChange={resetPageAnd(setCategory)} allLabel="All categories" options={CANDIDATE_CATEGORIES} />
          <FilterSelect label="Rank against posting" value={opportunityId} onChange={resetPageAnd(setOpportunityId)} allLabel="Don't rank by a posting" options={postings.map((posting) => ({ value: posting.id, label: posting.title }))} />
          <label className="flex cursor-pointer items-center gap-2 px-1 py-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={verifiedOnly} onChange={(event) => resetPageAnd(setVerifiedOnly)(event.target.checked)} className="size-4 accent-brand-600" />
            Has verified skills
          </label>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-500" aria-live="polite">{loading ? 'Searching…' : `${pluralize(results.total, 'candidate')} found`}</p>

      {error && <Card><ErrorState message={error} onRetry={load} /></Card>}
      {!error && loading && !results.items.length && <CardGridSkeleton />}
      {!error && !loading && !results.items.length && (
        <Card><EmptyState icon={SearchX} title="No candidates found" description="Try a different skill or remove some filters." /></Card>
      )}
      {!error && results.items.length > 0 && (
        <>
          <ul className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {results.items.map((candidate) => {
              const verified = candidate.skills.filter((skill) => skill.verified);
              const ordered = [...verified, ...candidate.skills.filter((skill) => !skill.verified)];
              return (
                <li key={candidate.id}>
                  <article className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-raised">
                    <div className="flex items-start gap-3">
                      <Avatar name={candidate.fullName} />
                      <div className="min-w-0">
                        <h2 className="text-[15px] font-bold">
                          <Link to={`/recruiter/candidates/${candidate.id}`} className="after:absolute after:inset-0 after:rounded-xl hover:text-brand-700">{candidate.fullName}</Link>
                        </h2>
                        <p className="line-clamp-2 text-sm text-slate-500">{candidate.headline}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge tone="brand">{CANDIDATE_CATEGORY_LABELS[candidate.category]}</Badge>
                      {candidate.matchScore !== null && <MatchBadge score={candidate.matchScore} />}
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-slate-600">
                      {candidate.university && <li className="flex items-center gap-2"><GraduationCap className="size-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="truncate">{candidate.university}</span></li>}
                      {candidate.location && <li className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="truncate">{candidate.location}</span></li>}
                    </ul>
                    <div className="mt-4 flex flex-1 flex-wrap content-end gap-1.5">
                      {ordered.slice(0, 4).map((skill) => <SkillTag key={skill.name} verified={skill.verified}>{skill.name}</SkillTag>)}
                      {ordered.length > 4 && <SkillTag muted>+{ordered.length - 4}</SkillTag>}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
          <Pagination page={results.page} totalPages={results.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
