import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star } from 'lucide-react';
import { getRoasterStatsRealTime } from '@/lib/actions/real-time-stats';

export async function RoasterStatsRealTime() {
	// Calculer TOUTES les stats en temps réel
	const stats = await getRoasterStatsRealTime();

	// Calculer les missions de cette session seulement (non utilisé pour l'instant)
	// const sessionCompleted = acceptedApplications.filter((app) => {
	// 	const feedback = app.roastRequest.feedbacks[0];
	// 	return feedback && feedback.status === 'completed';
	// }).length;

	const getLevelBadge = (level: string) => {
		const levelConfig = {
			rookie: { color: 'bg-muted text-muted-foreground', label: 'Rookie' },
			junior: { color: 'bg-blue-100 text-blue-800', label: 'Junior' },
			confirmed: {
				color: 'bg-purple-100 text-purple-800',
				label: 'Confirmé',
			},
			senior: { color: 'bg-orange-100 text-orange-800', label: 'Senior' },
			expert: { color: 'bg-yellow-100 text-yellow-800', label: 'Expert' },
		};

		const config =
			levelConfig[level as keyof typeof levelConfig] || levelConfig.rookie;
		return <Badge className={config.color}>{config.label}</Badge>;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-lg font-medium'>
					Vos statistiques
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border'>
					<div className='flex flex-col items-center justify-center space-y-2 p-4'>
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<Star className='w-5 h-5 text-yellow-400' />
							<span>Niveau</span>
						</div>
						{getLevelBadge(stats.level)}
						<div className='text-xl font-bold text-foreground'>
							{stats.rating.toFixed(1)}/5
						</div>
					</div>

					<div className='flex flex-col items-center justify-center space-y-3 p-4'>
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<Clock className='w-5 h-5 text-blue-400' />
							<span>Missions Actives</span>
						</div>
						<div className='text-3xl font-bold text-blue-400'>
							{stats.currentActive}
						</div>
						<p className='text-sm text-muted-foreground'>En cours</p>
					</div>

					<div className='space-y-4 p-4 flex flex-col justify-center'>
						<div className='flex justify-between items-center text-sm'>
							<span className='text-muted-foreground'>Roasts terminés</span>
							<span className='font-semibold text-foreground'>
								{stats.completedRoasts}
							</span>
						</div>
						<div className='flex justify-between items-center text-sm'>
							<span className='text-muted-foreground'>Gains totaux</span>
							<span className='font-semibold text-green-400'>
								{stats.totalEarned.toFixed(0)}€
							</span>
						</div>
						<div className='flex justify-between items-center text-sm'>
							<span className='text-muted-foreground'>Taux de complétion</span>
							<span className='font-semibold text-foreground'>
								{stats.completionRate}%
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
