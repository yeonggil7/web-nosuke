import { supabase } from './supabaseClient';
import { JobPosting } from '@/schema/jobSchema';

// 環境変数が設定されていない場合のモックデータ
const mockJobs: JobPosting[] = [
  {
    id: 'mock-1',
    title: 'フロントエンドエンジニア',
    summary: 'React、Next.js、TypeScriptを使用したWebアプリケーション開発',
    tags: ['React', 'Next.js', 'TypeScript'],
    imageurl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    content: 'フロントエンドエンジニアとして、当社のWebアプリケーション開発に参加していただきます。React、Next.js、TypeScriptを使用した開発経験がある方を求めています。',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    title: 'バックエンドエンジニア',
    summary: 'Node.js、Express、PostgreSQLを使用したAPI開発',
    tags: ['Node.js', 'Express', 'PostgreSQL'],
    imageurl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    content: 'バックエンドエンジニアとして、当社のAPIサーバー開発に参加していただきます。Node.js、Express、PostgreSQLを使用した開発経験がある方を求めています。',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    title: 'フルスタックエンジニア',
    summary: 'フロントエンドからバックエンドまで幅広い開発',
    tags: ['React', 'Node.js', 'MongoDB'],
    imageurl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    content: 'フルスタックエンジニアとして、当社のWebアプリケーション開発に参加していただきます。フロントエンドからバックエンドまで幅広い開発経験がある方を求めています。',
    created_at: new Date().toISOString()
  }
];

// Supabaseが正しく設定されているかチェック
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && url !== '' && key !== '';
};

export async function getAllJobs(): Promise<JobPosting[]> {
  console.log('Fetching all jobs from Supabase...');
  
  // Supabaseが設定されていない場合はモックデータを返す
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabaseが設定されていないため、モックデータを使用します');
    return mockJobs;
  }
  
  try {
  const { data, error } = await supabase
    .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching jobs:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // エラーの場合もモックデータを返す
      console.warn('エラーが発生したため、モックデータを使用します');
      return mockJobs;
  }
  
    console.log('Jobs fetched successfully:', data?.length, 'jobs');
  return data || [];
  } catch (err) {
    console.error('Unexpected error fetching jobs:', err);
    console.warn('予期しないエラーが発生したため、モックデータを使用します');
    return mockJobs;
  }
}

export async function getJobById(id: string): Promise<JobPosting | null> {
  console.log(`Fetching job with id ${id} from Supabase...`);
  
  // Supabaseが設定されていない場合はモックデータから検索
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabaseが設定されていないため、モックデータを使用します');
    return mockJobs.find(job => job.id === id) || null;
  }
  
  try {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching job with id ${id}:`, error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // エラーの場合はモックデータから検索
      return mockJobs.find(job => job.id === id) || null;
  }
  
  console.log('Job fetched successfully:', data);
  return data;
  } catch (err) {
    console.error(`Unexpected error fetching job with id ${id}:`, err);
    return mockJobs.find(job => job.id === id) || null;
  }
}

// 新しい求人を作成する
export async function createJob(job: Omit<JobPosting, 'id'>): Promise<{ data: JobPosting | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { 
      data: null, 
      error: { message: 'Supabaseが設定されていません。環境変数を確認してください。' }
    };
  }
  
  try {
  const { data, error } = await supabase
    .from('jobs')
    .insert([job])
    .select()
    .single();
  
  return { data, error };
  } catch (err) {
    console.error('Unexpected error creating job:', err);
    return { data: null, error: err };
  }
}

// 求人を更新する
export async function updateJob(id: string, job: Partial<JobPosting>): Promise<{ data: JobPosting | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { 
      data: null, 
      error: { message: 'Supabaseが設定されていません。環境変数を確認してください。' }
    };
  }
  
  try {
  const { data, error } = await supabase
    .from('jobs')
    .update(job)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
  } catch (err) {
    console.error('Unexpected error updating job:', err);
    return { data: null, error: err };
  }
}

// 求人を削除する
export async function deleteJob(id: string): Promise<{ error: any }> {
  if (!isSupabaseConfigured()) {
    return { 
      error: { message: 'Supabaseが設定されていません。環境変数を確認してください。' }
    };
  }
  
  try {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
  
  return { error };
  } catch (err) {
    console.error('Unexpected error deleting job:', err);
    return { error: err };
  }
}

// 求人を検索する
export async function searchJobs(
  query?: string,
  tags?: string[],
  limit?: number
): Promise<JobPosting[]> {
  console.log('Searching jobs with query:', query, 'tags:', tags);
  
  // Supabaseが設定されていない場合はモックデータから検索
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabaseが設定されていないため、モックデータを使用します');
    let filteredJobs = mockJobs;
    
    // クエリによる検索
    if (query && query.trim()) {
      const searchQuery = query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery) ||
        job.summary.toLowerCase().includes(searchQuery) ||
        job.content.toLowerCase().includes(searchQuery) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // タグによるフィルタリング
    if (tags && tags.length > 0) {
      filteredJobs = filteredJobs.filter(job =>
        tags.some(tag => job.tags.includes(tag))
      );
    }
    
    // 制限数の適用
    if (limit) {
      filteredJobs = filteredJobs.slice(0, limit);
    }
    
    return filteredJobs;
  }
  
  try {
    let queryBuilder = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // テキスト検索
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`
      );
    }
    
    // タグフィルタリング
    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', tags);
    }
    
    // 制限数の適用
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error searching jobs:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // エラーの場合はモックデータから検索
      console.warn('エラーが発生したため、モックデータを使用します');
      let filteredJobs = mockJobs;
      
      if (query && query.trim()) {
        const searchQuery = query.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(searchQuery) ||
          job.summary.toLowerCase().includes(searchQuery) ||
          job.content.toLowerCase().includes(searchQuery) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchQuery))
        );
      }
      
      if (tags && tags.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          tags.some(tag => job.tags.includes(tag))
        );
      }
      
      if (limit) {
        filteredJobs = filteredJobs.slice(0, limit);
      }
      
      return filteredJobs;
    }
    
    console.log('Jobs searched successfully:', data?.length, 'jobs');
    return data || [];
  } catch (err) {
    console.error('Unexpected error searching jobs:', err);
    console.warn('予期しないエラーが発生したため、モックデータを使用します');
    
    let filteredJobs = mockJobs;
    
    if (query && query.trim()) {
      const searchQuery = query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery) ||
        job.summary.toLowerCase().includes(searchQuery) ||
        job.content.toLowerCase().includes(searchQuery) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    if (tags && tags.length > 0) {
      filteredJobs = filteredJobs.filter(job =>
        tags.some(tag => job.tags.includes(tag))
      );
    }
    
    if (limit) {
      filteredJobs = filteredJobs.slice(0, limit);
    }
    
    return filteredJobs;
  }
}

// 全ての利用可能なタグを取得する
export async function getAllTags(): Promise<string[]> {
  console.log('Fetching all tags from Supabase...');
  
  // Supabaseが設定されていない場合はモックデータから抽出
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabaseが設定されていないため、モックデータを使用します');
    const allTags = new Set<string>();
    mockJobs.forEach(job => {
      job.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('tags');
    
    if (error) {
      console.error('Error fetching tags:', error);
      // エラーの場合はモックデータから抽出
      const allTags = new Set<string>();
      mockJobs.forEach(job => {
        job.tags.forEach(tag => allTags.add(tag));
      });
      return Array.from(allTags).sort();
    }
    
    const allTags = new Set<string>();
    data?.forEach((job: { tags: string[] }) => {
      job.tags.forEach(tag => allTags.add(tag));
    });
    
    console.log('Tags fetched successfully:', allTags.size, 'unique tags');
    return Array.from(allTags).sort();
  } catch (err) {
    console.error('Unexpected error fetching tags:', err);
    const allTags = new Set<string>();
    mockJobs.forEach(job => {
      job.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }
} 