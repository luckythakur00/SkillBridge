import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Globe, Lock, Pencil } from 'lucide-react';
import PortfolioView from '../../components/profile/PortfolioView';
import Button from '../../components/ui/Button';
import { Card, ErrorState, PageHeader, PageLoader } from '../../components/ui/Primitives';
import { candidateService } from '../../services/candidateService';
import { useAuthStore } from '../../store/authStore';
import { useCandidateStore } from '../../store/candidateStore';
import { useAction } from '../../hooks/useAction';
import { toast } from '../../store/toastStore';

export default function PortfolioPage() {
  const candidateId = useAuthStore((state) => state.user?.candidateId);
  const updateProfile = useCandidateStore((state) => state.updateProfile);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    candidateService.getPortfolio(candidateId).then(setPortfolio).catch((failure) => setError(failure.message));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const [setVisibility, saving] = useAction(async (isPublic) => {
    await updateProfile({ portfolioPublic: isPublic });
    setPortfolio((current) => ({ ...current, portfolioPublic: isPublic }));
    toast.success(isPublic ? 'Your portfolio is now public.' : 'Your portfolio is now private.');
  });

  const publicUrl = `${window.location.origin}/portfolio/${candidateId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Link copied.');
    } catch {
      toast.error(`Could not copy automatically. Your link is ${publicUrl}`);
    }
  };

  if (error) return <Card><ErrorState message={error} onRetry={load} /></Card>;
  if (!portfolio) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Digital portfolio"
        description="A single page showing your verified skills, projects and achievements."
        actions={<Button to="/candidate/profile" variant="secondary" icon={Pencil}>Edit content</Button>}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${portfolio.portfolioPublic ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {portfolio.portfolioPublic ? <Globe className="size-4" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{portfolio.portfolioPublic ? 'Anyone with the link can view this' : 'Only you and recruiters can view this'}</p>
              <p className="text-sm break-all text-slate-500">{portfolio.portfolioPublic ? publicUrl : 'Make it public to share a link. Your email and phone are never shown.'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {portfolio.portfolioPublic && (
              <>
                <Button variant="secondary" size="sm" icon={Copy} onClick={copyLink}>Copy link</Button>
                <Button variant="secondary" size="sm" icon={ExternalLink} to={`/portfolio/${candidateId}`}>View</Button>
              </>
            )}
            <Button variant={portfolio.portfolioPublic ? 'ghost' : 'primary'} size="sm" loading={saving} onClick={() => setVisibility(!portfolio.portfolioPublic)}>
              {portfolio.portfolioPublic ? 'Make private' : 'Make public'}
            </Button>
          </div>
        </div>
      </Card>

      <PortfolioView portfolio={portfolio} />
    </div>
  );
}
