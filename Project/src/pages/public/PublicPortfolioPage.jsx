import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import PortfolioView from '../../components/profile/PortfolioView';
import Button from '../../components/ui/Button';
import { Card, EmptyState, ErrorState, PageLoader } from '../../components/ui/Primitives';
import { candidateService } from '../../services/candidateService';

export default function PublicPortfolioPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ key: null, portfolio: null, error: null, status: null });
  const key = `${id}-${attempt}`;

  useEffect(() => {
    let active = true;
    candidateService.getPortfolio(id)
      .then((portfolio) => active && setState({ key, portfolio, error: null, status: 200 }))
      .catch((error) => active && setState({ key, portfolio: null, error: error.message, status: error.status }));
    return () => {
      active = false;
    };
  }, [id, key]);

  const ready = state.key === key;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      {!ready && <PageLoader />}
      {ready && state.portfolio && <PortfolioView portfolio={state.portfolio} />}
      {ready && state.status === 403 && (
        <Card>
          <EmptyState icon={Lock} title="This portfolio is private" description="The owner has not made this portfolio public." action={<Button to="/opportunities" variant="secondary">Browse opportunities</Button>} />
        </Card>
      )}
      {ready && state.error && state.status !== 403 && <Card><ErrorState message={state.error} onRetry={() => setAttempt((value) => value + 1)} /></Card>}
    </div>
  );
}
