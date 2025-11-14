// pages/api/forums/follow.js
import { supabase } from '@lib/supabaseClient';
import { authenticate } from '@lib/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { forumId } = req.body;
  if (!forumId) return res.status(400).json({ error: 'Missing forumId' });

  const { data, error } = await supabase
    .from('forum_followers')
    .insert([{ 
      user_id: user.id, 
      forum_id: forumId 
    }])
    .select();

  if (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Already following this forum' });
    }
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: 'Followed forum successfully', follow: data[0] });
}