import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Perform a simple query to keep the database active
    const { data, error } = await supabaseClient
      .from('documents')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ status: 'Database pinged successfully' });
  } catch (error) {
    console.error('Error pinging database:', error);
    return NextResponse.json({ error: 'Failed to ping database' }, { status: 500 });
  }
}