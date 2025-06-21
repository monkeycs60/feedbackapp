'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type AcceptedApplication = {
	id: string;
	status: string;
	score: number;
	selectedAt: Date | null;
	roastRequest: {
		id: string;
		title: string;
		appUrl: string;
		description: string;
		focusAreas: string[];
		maxPrice: number;
		feedbacksRequested: number;
		createdAt: Date;
		coverImage?: string | null;
		creator: {
			id: string;
			name: string | null;
			creatorProfile: {
				company: string | null;
			} | null;
		};
		questions: Array<{
			id: string;
			domain: string;
			text: string;
			order: number;
		}>;
		feedbacks: Array<{
			id: string;
			status: string;
			createdAt: Date;
		}>;
	};
};

interface AcceptedApplicationsListProps {
	applications: AcceptedApplication[];
}

export function AcceptedApplicationsList({
	applications,
}: AcceptedApplicationsListProps) {
	// Séparer les missions par statut
	const ongoingMissions = applications.filter((app) => {
		const hasFeedback = app.roastRequest.feedbacks.length > 0;
		const feedbackStatus =
			app.roastRequest.feedbacks[0]?.status || 'not_started';
		return !hasFeedback || feedbackStatus !== 'completed';
	});

	const completedMissions = applications.filter((app) => {
		const hasFeedback = app.roastRequest.feedbacks.length > 0;
		const feedbackStatus =
			app.roastRequest.feedbacks[0]?.status || 'not_started';
		return hasFeedback && feedbackStatus === 'completed';
	});

	if (applications.length === 0) {
		return (
			<Card>
				<CardContent className='py-12 text-center'>
					<CheckCircle className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
					<h3 className='text-lg font-medium text-foreground mb-2'>
						Aucune mission acceptée
					</h3>
					<p className='text-muted-foreground mb-6'>
						Vos candidatures acceptées apparaîtront ici. Consultez le
						marketplace pour postuler à de nouvelles missions !
					</p>
					<Button asChild className='bg-orange-500 hover:bg-orange-600'>
						<Link href='/marketplace'>Voir le marketplace</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	const renderMissionCard = (application: AcceptedApplication) => {
		const roast = application.roastRequest;
		const hasFeedback = roast.feedbacks.length > 0;
		const feedbackStatus = roast.feedbacks[0]?.status || 'not_started';
		const earnings = Math.round(roast.maxPrice / roast.feedbacksRequested);
		const isCompleted = hasFeedback && feedbackStatus === 'completed';

		// Get unique domains from questions
		const domains = Array.from(new Set(roast.questions.map(q => q.domain)));

		return (
			<Card key={application.id} className='group bg-backgroundlighter hover:shadow-lg py-0 gap-1 transition-all duration-200 overflow-hidden'>
				<div className='relative h-44 overflow-hidden'>
					{roast.coverImage ? (
						<Image
							src={roast.coverImage}
							alt={roast.title}
							fill
							className='object-cover transition-transform duration-300 group-hover:scale-105'
							sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
						/>
					) : (
						<div className='w-full h-full bg-muted flex items-center justify-center'>
							<ExternalLink className='h-10 w-10 text-muted-foreground/30' />
						</div>
					)}
					{/* Overlay gradient for better text readability */}
					<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
					
					{/* Title on image */}
					<div className='absolute bottom-3 left-3 right-3'>
						<h3 className='text-lg font-bold text-white line-clamp-2 drop-shadow-lg'>
							{roast.title}
						</h3>
					</div>
				</div>

				<CardContent className='px-4 pb-3 pt-3 space-y-2.5'>
					{/* Creator info */}
					<div className='flex items-center gap-2 text-sm'>
						<Avatar className='h-6 w-6'>
							<AvatarFallback className='text-xs'>
								{roast.creator.name?.charAt(0).toUpperCase() || 'C'}
							</AvatarFallback>
						</Avatar>
						<span className='text-muted-foreground'>
							{roast.creator.name}
							{roast.creator.creatorProfile?.company && (
								<span className='text-muted-foreground/70'> • {roast.creator.creatorProfile.company}</span>
							)}
						</span>
					</div>

					{/* Description */}
					<div className='h-10'>
						<p className='text-sm text-muted-foreground line-clamp-2'>
							{roast.description}
						</p>
					</div>

					{/* Domain badges */}
					{domains.length > 0 && (
						<div className='flex flex-wrap gap-1'>
							{domains.map((domain) => (
								<span 
									key={domain}
									className='text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground'
								>
									{domain}
								</span>
							))}
						</div>
					)}

					{/* Meta info and action */}
					<div className='flex items-center justify-between pt-3 pb-2 border-t'>
						<div className='flex items-center gap-3 text-sm'>
							<span className='text-foreground font-medium'>
								{earnings}€
							</span>
						</div>
						
						<Button 
							asChild 
							size='sm' 
							variant={isCompleted ? 'ghost' : 'default'}
							className={!isCompleted ? 'bg-orange-500 hover:bg-orange-600' : ''}
						>
							<Link href={`/roast/${roast.id}`}>
								{isCompleted ? 'Voir' : 'Continuer'}
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	};


	return (
		<div className='space-y-6'>
			{/* Missions en cours / à commencer */}
			{ongoingMissions.length > 0 && (
				<div>
					<div className='flex items-center gap-3 mb-4'>
						<h2 className='text-lg font-semibold'>
							Missions en cours ({ongoingMissions.length})
						</h2>
						<Badge className='bg-orange-500/20 text-orange-300 border-orange-500/30'>
							À compléter
						</Badge>
					</div>
					<div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
						{ongoingMissions.map(renderMissionCard)}
					</div>
				</div>
			)}

			{/* Missions terminées */}
			{completedMissions.length > 0 && (
				<div>
					<div className='flex items-center gap-3 mb-4'>
						<h2 className='text-lg font-semibold'>
							Missions terminées ({completedMissions.length})
						</h2>
						<Badge className='bg-green-500/20 text-green-300 border border-green-500/30'>
							Complétées
						</Badge>
					</div>
					<div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
						{completedMissions.map(renderMissionCard)}
					</div>
				</div>
			)}
		</div>
	);
}
