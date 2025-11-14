// pages/api/tournament/join.js
import { supabase } from '@lib/supabaseClient';
import { authenticate } from '@lib/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { tournament_id } = req.body;
  if (!tournament_id) return res.status(400).json({ error: 'Missing tournament_id' });

  // Check if tournament exists and has space
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournament_id)
    .single();

  if (tournamentError || !tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  // Check if user already joined
  const { data: existingParticipant } = await supabase
    .from('tournament_participants')
    .select('*')
    .eq('tournament_id', tournament_id)
    .eq('user_id', user.id)
    .single();

  if (existingParticipant) {
    return res.status(400).json({ error: 'Already joined this tournament' });
  }

  // Check if tournament is full
  const { count } = await supabase
    .from('tournament_participants')
    .select('*', { count: 'exact' })
    .eq('tournament_id', tournament_id);

  if (count >= tournament.max_teams) {
    return res.status(400).json({ error: 'Tournament is full' });
  }

  const { data, error } = await supabase
    .from('tournament_participants')
    .insert([{ 
      tournament_id, 
      user_id: user.id,
      team_name: `${user.username}'s Team`
    }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ participant: data[0] });
}