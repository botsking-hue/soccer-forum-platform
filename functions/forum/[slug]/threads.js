// pages/api/forum/[slug]/threads.js
import { supabase } from '@lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { slug } = req.query;

  // Get forum by slug
  const { data: forum, error: forumError } = await supabase
    .from('forums')
    .select('id')
    .eq('slug', slug)
    .single();

  if (forumError || !forum) {
    return res.status(404).json({ error: 'Forum not found' });
  }

  // Get threads for this forum
  const { data: threads, error } = await supabase
    .from('threads')
    .select(`
      *,
      users:creator_id (username),
      forums:forum_id (name)
    `)
    .eq('forum_id', forum.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ threads });
}