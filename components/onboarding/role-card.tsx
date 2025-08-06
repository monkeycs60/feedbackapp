import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleCardProps {
	role: 'creator' | 'roaster';
	isSelected: boolean;
	onSelect: (role: 'creator' | 'roaster') => void;
	isDisabled?: boolean;
	disabledMessage?: string;
}

const roleConfig = {
	creator: {
		icon: '🚀',
		title: 'I have an app to get roasted',
		description: 'Get brutally honest feedback',
		benefits: [
			'✓ Feedback in 24h',
			'✓ Starting from €5',
			'✓ Expert roasters',
		],
		buttonText: 'Start as Creator',
		gradient: 'from-blue-500 to-purple-600',
	},
	roaster: {
		icon: '🔥',
		title: 'I want to earn money giving feedback',
		description: 'Monetize your expertise, help the community',
		benefits: [
			'✓ €3.50 per feedback',
			'✓ Choose your tasks',
			'✓ 15-20 min of work',
		],
		buttonText: 'Start as Roaster',
		gradient: 'from-orange-500 to-red-600',
	},
};

export function RoleCard({
	role,
	isSelected,
	onSelect,
	isDisabled = false,
	disabledMessage,
}: RoleCardProps) {
	const config = roleConfig[role];

	return (
		<Card
			className={`relative overflow-hidden transition-all duration-300 ${
				isDisabled
					? 'opacity-50 cursor-not-allowed'
					: 'hover:scale-105 cursor-pointer'
			} bg-white border-gray-200 ${
				isSelected
					? 'ring-2 ring-orange-500 shadow-xl'
					: !isDisabled
					? 'hover:shadow-lg hover:border-gray-300'
					: ''
			}`}
			onClick={() => !isDisabled && onSelect(role)}
			data-testid={`${role}-card`}
			role='button'
			tabIndex={isDisabled ? -1 : 0}
			onKeyDown={(e) => {
				if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					onSelect(role);
				}
			}}
			aria-label={`Select ${role} role`}
			aria-disabled={isDisabled}>
			<div
				className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`}
			/>

			<CardContent className='p-8 relative'>
				{isDisabled && disabledMessage && (
					<div className='absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-lg'>
						<p className='text-gray-600 font-medium text-lg'>
							{disabledMessage}
						</p>
					</div>
				)}

				<div className='text-center mb-6'>
					<div className='text-6xl mb-4'>{config.icon}</div>
					<h3 className='text-2xl font-bold text-gray-900 mb-2'>
						{config.title}
					</h3>
					<p className='text-gray-600'>{config.description}</p>
				</div>

				<ul className='space-y-2 mb-6 text-gray-700'>
					{config.benefits.map((benefit, index) => (
						<li key={index}>{benefit}</li>
					))}
				</ul>

				<Button
					className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 pointer-events-none text-white`}
					size='lg'
					disabled={isDisabled}>
					{config.buttonText}
				</Button>
			</CardContent>
		</Card>
	);
}
