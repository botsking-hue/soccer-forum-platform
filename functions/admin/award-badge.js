// pages/api/tournament/create.js
import { supabase } from '@lib/supabaseClient';
import { authenticate } from '@lib/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, game_version, max_teams } = req.body;
  if (!name || !game_version || !max_teams) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('tournaments')
    .insert([{ 
      name, 
      game_version, 
      max_teams, 
      creator_id: user.id,
      status: 'pending'
    }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ tournament: data[0] });
}