'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleCard } from '@/components/onboarding/role-card';
import { selectPrimaryRole } from '@/lib/actions/onboarding';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface RoleSelectionFormProps {
	hasCreatorProfile?: boolean;
	hasRoasterProfile?: boolean;
}

export function RoleSelectionForm({
	hasCreatorProfile = false,
	hasRoasterProfile = false,
}: RoleSelectionFormProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const isAddingSecondRole = searchParams.get('add_role') === 'true';

	// Automatically pre-select the missing role if adding a second role
	const missingRole =
		hasCreatorProfile && !hasRoasterProfile
			? 'roaster'
			: !hasCreatorProfile && hasRoasterProfile
			? 'creator'
			: null;

	const [selectedRole, setSelectedRole] = useState<
		'creator' | 'roaster' | null
	>(isAddingSecondRole && missingRole ? missingRole : null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		if (!selectedRole) return;

		setIsLoading(true);
		setError(null);

		try {
			await selectPrimaryRole(selectedRole);
			startTransition(() => {
				router.push('/onboarding/profile-setup');
			});
		} catch (error) {
			console.error('Role selection error:', error);
			setError('An error occurred. Please try again.');
			setIsLoading(false);
		}
	};

	return (
		<div className='space-y-8'>
			{isAddingSecondRole && (
				<Alert className='bg-blue-50 border-blue-200'>
					<Info className='h-4 w-4 text-blue-600' />
					<AlertDescription className='text-blue-900'>
						You're about to add a second profile to your account. This
						will allow you to switch between both roles whenever you want!
					</AlertDescription>
				</Alert>
			)}

			<div className='grid md:grid-cols-2 gap-8'>
				<RoleCard
					role='creator'
					isSelected={selectedRole === 'creator'}
					onSelect={setSelectedRole}
					isDisabled={isAddingSecondRole && hasCreatorProfile}
					disabledMessage='You already have a Creator profile'
				/>
				<RoleCard
					role='roaster'
					isSelected={selectedRole === 'roaster'}
					onSelect={setSelectedRole}
					isDisabled={isAddingSecondRole && hasRoasterProfile}
					disabledMessage='You already have a Roaster profile'
				/>
			</div>

			{error && (
				<div className='text-center'>
					<p className='text-red-400 text-sm'>{error}</p>
				</div>
			)}

			{selectedRole && (
				<div className='text-center'>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || isPending}
						size='lg'
						className='bg-orange-600 hover:bg-orange-700 px-8'>
						{isLoading || isPending ? 'Loading...' : 'Continue'}
					</Button>
				</div>
			)}
		</div>
	);
}
