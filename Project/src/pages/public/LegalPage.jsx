import { Card, PageHeader } from '../../components/ui/Primitives';
import { APP_NAME } from '../../config/app';

// Placeholder text. Replace it with reviewed legal documents before launch.
const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Information we collect', 'Account details, profile information, uploaded documents and activity needed to run the platform.'],
      ['How we use it', 'To match candidates with opportunities, share application details with the recruiters a candidate applies to, and send relevant notifications.'],
      ['Your choices', 'You can edit your profile, choose whether your portfolio is public, change notification settings, and delete your account from Settings.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      ['Using the platform', `Provide accurate information and use ${APP_NAME} only for genuine recruitment, learning and collaboration.`],
      ['Accounts', 'There are two account types, candidate and recruiter. You are responsible for keeping your login details secure.'],
      ['Content', 'You remain responsible for what you post. Organizations must publish only genuine opportunities.'],
    ],
  },
};

export default function LegalPage({ kind }) {
  const { title, sections } = CONTENT[kind];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title={title} description="Sample text for the demo. It is not a final legal document." />
      <Card className="space-y-6">
        {sections.map(([heading, text]) => (
          <section key={heading}>
            <h2 className="text-base font-bold">{heading}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
          </section>
        ))}
      </Card>
    </div>
  );
}
