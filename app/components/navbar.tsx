'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const { data: session, isPending } = authClient.useSession();

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await authClient.signOut();
			router.push('/');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<nav className='sticky top-0 z-50 w-full border-b border-border bg-background'>
			<div className='container mx-auto flex h-16 items-center justify-between px-4'>
				<div className='flex items-center space-x-4'>
					<Link href='/' className='flex items-center space-x-2'>
						<div className='h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center'>
							<span className='text-white font-bold text-sm'>🔥</span>
						</div>
						<span className='font-bold text-xl bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent'>
							RoastMyApp
						</span>
					</Link>
				</div>

				<div className='flex items-center space-x-4'>
					{isPending ? (
						<div className='flex items-center space-x-2'>
							<div className='h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-orange-500'></div>
							<span className='text-sm text-muted-foreground'>
								Loading...
							</span>
						</div>
					) : session?.user ? (
						<div className='flex items-center space-x-4'>
							<div className='hidden sm:flex items-center space-x-2'>
								<div className='h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center'>
									<span className='text-white text-sm font-medium'>
										{session.user.name?.charAt(0).toUpperCase() ||
											session.user.email.charAt(0).toUpperCase()}
									</span>
								</div>
								<span className='text-sm font-medium text-foreground'>
									{session.user.name || session.user.email}
								</span>
							</div>

							<Link
								href='/profile'
								className='inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-border bg-secondary hover:bg-accent text-foreground hover:text-accent-foreground h-9 px-4 py-2'>
								Profile
							</Link>

							<button
								onClick={handleLogout}
								disabled={isLoggingOut}
								className='inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2'>
								{isLoggingOut ? (
									<>
										<div className='h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-muted-foreground mr-2'></div>
										Logging out...
									</>
								) : (
									'Logout'
								)}
							</button>
						</div>
					) : (
						<div className='flex items-center space-x-3'>
							<Link
								href='/login'
								className='inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-border bg-secondary hover:bg-accent text-foreground hover:text-accent-foreground h-9 px-4 py-2'>
								Login
							</Link>

							<Link
								href='/login?mode=signup'
								className='inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 h-9 px-4 py-2 shadow-md'>
								Sign up
							</Link>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
