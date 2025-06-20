'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	CheckCircle,
	MessageSquare,
	ExternalLink,
	ArrowRight,
} from 'lucide-react';
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
			<Card className='bg-gray-800/50 border-gray-700'>
				<CardContent className='py-12 text-center'>
					<CheckCircle className='mx-auto h-12 w-12 text-gray-400 mb-4' />
					<h3 className='text-lg font-medium text-gray-100 mb-2'>
						Aucune mission acceptée
					</h3>
					<p className='text-gray-300 mb-6'>
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

		return (
			<div key={application.id} className='group flex flex-col'>
				<Link href={`/roast/${roast.id}`}>
					<div className='relative aspect-video w-full overflow-hidden rounded-xl cursor-pointer'>
						{roast.coverImage ? (
							<Image
								src={roast.coverImage}
								alt={roast.title}
								fill
								className='object-cover transition-transform duration-300 group-hover:scale-105'
								sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
							/>
						) : (
							<div className='w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center'>
								<ExternalLink className='h-8 w-8 text-gray-500' />
							</div>
						)}
						<div
							className={`absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-sm ${
								isCompleted ? 'bg-green-500' : 'bg-orange-500'
							}`}>
							{isCompleted ? `+${earnings}€` : `~${earnings}€`}
						</div>
					</div>
				</Link>

				<div className='mt-3 flex items-start gap-3'>
					<div className='flex-shrink-0'>
						<Avatar>
							<AvatarFallback>
								{roast.creator.name?.charAt(0).toUpperCase() || 'C'}
							</AvatarFallback>
						</Avatar>
					</div>
					<div className='flex-1'>
						<h3 className='font-semibold text-gray-100 line-clamp-2 leading-snug hover:text-white'>
							<Link href={`/roast/${roast.id}`}>{roast.title}</Link>
						</h3>
						<div className='text-sm text-gray-400 mt-1'>
							<div>{roast.creator.name}</div>
							<div>
								<span>
									{roast.questions.length} question
									{roast.questions.length > 1 ? 's' : ''}
								</span>
								<span className='mx-1.5'>·</span>
								<span>{isCompleted ? 'Terminée' : 'En cours'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className='space-y-6'>
			{/* Missions en cours / à commencer */}
			{ongoingMissions.length > 0 && (
				<div>
					<div className='flex items-center gap-3 mb-4'>
						<h2 className='text-lg font-semibold text-gray-200'>
							Missions en cours ({ongoingMissions.length})
						</h2>
						<Badge className='bg-orange-500/20 text-orange-300 border-orange-500/30'>
							À compléter
						</Badge>
					</div>
					<div className='grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{ongoingMissions.map(renderMissionCard)}
					</div>
				</div>
			)}

			{/* Missions terminées */}
			{completedMissions.length > 0 && (
				<div>
					<div className='flex items-center gap-3 mb-4'>
						<h2 className='text-lg font-semibold text-gray-200'>
							Missions terminées ({completedMissions.length})
						</h2>
						<Badge className='bg-green-500/20 text-green-300 border border-green-500/30'>
							Complétées
						</Badge>
					</div>
					<div className='grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{completedMissions.map(renderMissionCard)}
					</div>
				</div>
			)}
		</div>
	);
}
