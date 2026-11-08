import { useEffect, useMemo } from 'react';
import ProgramBrowser, { EnrollmentsPanel } from '../../components/programs/ProgramBrowser';
import { PageHeader } from '../../components/ui/Primitives';
import { useTrainingStore } from '../../store/trainingStore';
import { COLLABORATION_PROGRAM_TYPES } from '../../constants';

const TYPES = [...COLLABORATION_PROGRAM_TYPES, 'WORKSHOP'];
const isAcademic = (program) => TYPES.includes(program.type) && program.audience.includes('ACADEMICIAN');

export default function AcademicPage() {
  const enrollments = useTrainingStore((state) => state.enrollments);
  const fetchEnrollments = useTrainingStore((state) => state.fetchEnrollments);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const academicEnrollments = useMemo(() => enrollments.filter((entry) => isAcademic(entry.program)), [enrollments]);

  return (
    <div>
      <PageHeader
        title="Academic opportunities"
        description="Faculty internships, industrial training, development programs, consultancy, research and guest lectures."
      />
      <EnrollmentsPanel enrollments={academicEnrollments} />
      <ProgramBrowser types={TYPES} filter={isAcademic} emptyTitle="No academic opportunities found" />
    </div>
  );
}
