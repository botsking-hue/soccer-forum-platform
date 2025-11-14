// pages/api/tournament/fixtures.js
import { supabase } from '@lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { tournament_id } = req.query;
  if (!tournament_id) return res.status(400).json({ error: 'Missing tournament_id' });

  // Get fixtures for the tournament
  const { data: fixtures, error } = await supabase
    .from('tournament_fixtures')
    .select('*')
    .eq('tournament_id', tournament_id)
    .order('round_number', { ascending: true })
    .order('match_order', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });

  // If no fixtures exist, generate them
  if (!fixtures || fixtures.length === 0) {
    const generatedFixtures = await generateFixtures(tournament_id);
    return res.status(200).json({ fixtures: generatedFixtures });
  }

  res.status(200).json({ fixtures });
}

async function generateFixtures(tournament_id) {
  // Get tournament participants
  const { data: participants, error } = await supabase
    .from('tournament_participants')
    .select('user_id')
    .eq('tournament_id', tournament_id);

  if (error || !participants || participants.length < 2) {
    return [];
  }

  // Simple round-robin fixture generation
  const participantIds = participants.map(p => p.user_id);
  const fixtures = [];
  let matchOrder = 1;

  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      fixtures.push({
        tournament_id,
        team1_id: participantIds[i],
        team2_id: participantIds[j],
        round_number: 1,
        match_order: matchOrder++,
        status: 'scheduled'
      });
    }
  }

  // Insert generated fixtures
  const { data: insertedFixtures, error: insertError } = await supabase
    .from('tournament_fixtures')
    .insert(fixtures)
    .select();

  return insertError ? [] : insertedFixtures;
}