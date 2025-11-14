import { supabase } from '../../../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { threadId } = req.query;

  const { data: thread, error } = await supabase
    .from('threads')
    .select('*')
    .eq('id', threadId)
    .single();

  if (error || !thread) return res.status(404).json({ error: 'Thread not found' });

  const { data: replies, error: repliesError } = await supabase
    .from('replies')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (repliesError) return res.status(400).json({ error: repliesError.message });

  res.status(200).json({ thread, replies });
}
