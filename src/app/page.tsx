import { getAllJobs } from '@/lib/cms';
import JobCard from '@/components/JobCard';

export const revalidate = 3600; // 1時間ごとに再検証

export default async function Home() {
  const jobs = await getAllJobs();
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">求人一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <JobCard key={job.id} {...job} />
        ))}
      </div>
    </div>
  );
}
