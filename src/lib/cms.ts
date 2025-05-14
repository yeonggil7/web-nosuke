import { supabase } from './supabaseClient';
import { JobPosting } from '@/schema/jobSchema';

export async function getAllJobs(): Promise<JobPosting[]> {
  console.log('Fetching all jobs from Supabase...');
  const { data, error } = await supabase
    .from('jobs')
    .select('*');
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  
  console.log('Jobs fetched successfully:', data);
  return data || [];
}

export async function getJobById(id: string): Promise<JobPosting | null> {
  console.log(`Fetching job with id ${id} from Supabase...`);
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching job with id ${id}:`, error);
    return null;
  }
  
  console.log('Job fetched successfully:', data);
  return data;
} 