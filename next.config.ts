import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'utfs.io',
				port: '',
				pathname: '/f/**',
			},
			{
				protocol: 'https',
				hostname: 'f3eu4r8oyp.ufs.sh',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
