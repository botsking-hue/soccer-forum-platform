// pages/api/follow/unfollow-user.js
import { supabase } from '@lib/supabaseClient';
import { authenticate } from '@lib/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { unfollowUserId } = req.body;
  if (!unfollowUserId) return res.status(400).json({ error: 'Missing unfollowUserId' });

  const { error } = await supabase
    .from('user_followers')
    .delete()
    .match({ 
      follower_id: user.id, 
      followed_user_id: unfollowUserId 
    });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Unfollowed successfully' });
}