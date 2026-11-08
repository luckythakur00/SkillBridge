import { useEffect } from 'react';
import ProgramBrowser, { EnrollmentsPanel } from '../../components/programs/ProgramBrowser';
import { PageHeader } from '../../components/ui/Primitives';
import { useTrainingStore } from '../../store/trainingStore';
import { LEARNING_PROGRAM_TYPES } from '../../constants';

const PARAMS = { group: 'LEARNING' };

export default function LearningPage() {
  const enrollments = useTrainingStore((state) => state.enrollments);
  const fetchEnrollments = useTrainingStore((state) => state.fetchEnrollments);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return (
    <div>
      <PageHeader title="Learning programs" description="Industry training, certification courses, workshops, mentorship and live projects." />
      <EnrollmentsPanel enrollments={enrollments} />
      <ProgramBrowser params={PARAMS} types={LEARNING_PROGRAM_TYPES} emptyTitle="No programs found" />
    </div>
  );
}
