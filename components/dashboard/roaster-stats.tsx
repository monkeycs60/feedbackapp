import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, TrendingUp } from 'lucide-react';

type AcceptedApplication = {
	id: string;
	status: string;
	roastRequest: {
		feedbacks: Array<{
			id: string;
			status: string;
		}>;
	};
};

interface RoasterStatsProps {
	acceptedApplications: AcceptedApplication[];
	roasterProfile: {
		rating: number;
		completedRoasts: number;
		level: string;
		totalEarned: number;
	} | null;
}

export function RoasterStats({
	acceptedApplications,
	roasterProfile,
}: RoasterStatsProps) {
	const activeMissions = acceptedApplications.filter((app) => {
		const feedback = app.roastRequest.feedbacks[0];
		return !feedback || feedback.status !== 'completed';
	}).length;

	console.log({ acceptedApplications });

	const completedMissions = acceptedApplications.filter((app) => {
		const feedback = app.roastRequest.feedbacks[0];
		return feedback && feedback.status === 'completed';
	}).length;

	const getLevelBadge = (level: string) => {
		const levelConfig = {
			rookie: { color: 'bg-gray-100 text-gray-800', label: 'Rookie' },
			verified: { color: 'bg-blue-100 text-blue-800', label: 'Verified' },
			expert: { color: 'bg-purple-100 text-purple-800', label: 'Expert' },
			master: { color: 'bg-yellow-100 text-yellow-800', label: 'Master' },
		};

		const config =
			levelConfig[level as keyof typeof levelConfig] || levelConfig.rookie;
		return <Badge className={config.color}>{config.label}</Badge>;
	};

	if (!roasterProfile) {
		return null;
	}

	console.log({ roasterProfile });

	return (
		<div className='space-y-6'>
			{/* Niveau et rating */}
			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='text-lg flex items-center gap-2'>
						<Star className='w-5 h-5 text-yellow-500' />
						Mon niveau
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-center space-y-3'>
						{getLevelBadge(roasterProfile.level)}
						<div className='text-2xl font-bold text-yellow-600'>
							{roasterProfile.rating.toFixed(1)}/5
						</div>
						<p className='text-sm text-gray-600'>Note moyenne</p>
					</div>
				</CardContent>
			</Card>

			{/* Missions en cours */}
			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='text-lg flex items-center gap-2'>
						<Clock className='w-5 h-5 text-blue-500' />
						Missions actives
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-center'>
						<div className='text-2xl font-bold text-blue-600 mb-1'>
							{activeMissions}
						</div>
						<p className='text-sm text-gray-600'>En cours</p>
					</div>
				</CardContent>
			</Card>

			{/* Statistiques */}
			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='text-lg flex items-center gap-2'>
						<TrendingUp className='w-5 h-5 text-green-500' />
						Statistiques
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex justify-between items-center'>
						<span className='text-sm text-gray-600'>Roasts terminés</span>
						<span className='font-semibold'>
							{roasterProfile.completedRoasts}
						</span>
					</div>
					<div className='flex justify-between items-center'>
						<span className='text-sm text-gray-600'>Gains totaux</span>
						<span className='font-semibold text-green-600'>
							{roasterProfile.totalEarned.toFixed(0)}€
						</span>
					</div>
					<div className='flex justify-between items-center'>
						<span className='text-sm text-gray-600'>Cette session</span>
						<span className='font-semibold'>
							{completedMissions} terminé
							{completedMissions > 1 ? 's' : ''}
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
