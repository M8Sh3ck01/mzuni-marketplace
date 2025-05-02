import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <Button asChild>
          <Link href="/dashboard/create" className="text-blue-600">
            Create Listing
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Recent Activity</h3>
        {/* Activity content */}
      </Card>
    </div>
  );
}
