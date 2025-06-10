import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function DashboardHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          </div>
          
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/new-roast" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle demande
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}