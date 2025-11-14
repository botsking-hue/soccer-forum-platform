// pages/api/follow/user.js
import { supabase } from '@lib/supabaseClient';
import { authenticate } from '@lib/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { followUserId } = req.body;
  if (!followUserId) return res.status(400).json({ error: 'Missing followUserId' });

  // Prevent self-follow
  if (user.id === followUserId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const { data, error } = await supabase
    .from('user_followers')
    .insert([{ 
      follower_id: user.id, 
      followed_user_id: followUserId 
    }])
    .select();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Already following this user' });
    }
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: 'Followed successfully', follow: data[0] });
}