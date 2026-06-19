import FounderDashboardClient from './FounderDashboardClient';

export const metadata = {
    title: 'VGP Founder Portal',
    description: 'Virzy Guns Production - Private Founder Control Panel',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return <FounderDashboardClient />;
}
