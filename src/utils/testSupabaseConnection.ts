/**
 * Utility to test Supabase connection
 * Use this to verify your Supabase setup is working correctly
 */
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    url?: string;
    projectId?: string;
    error?: string;
  };
}

/**
 * Tests the Supabase connection by attempting to query the database
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    // Check if environment variables are set
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

    if (!url || !key) {
      return {
        success: false,
        message: 'Missing required environment variables',
        details: {
          url: url || 'MISSING',
          projectId: projectId || 'MISSING',
        },
      };
    }

    // Test connection by making a simple query
    // Try to get the current session (this doesn't require any tables)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        details: {
          url,
          projectId,
          error: sessionError.message,
        },
      };
    }

    // Try a simple database query (check if we can access the database)
    // Using a query that should work even if tables are empty
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1);

    // If it's a table not found error, that's okay - it means connection works
    if (dbError && !dbError.message.includes('relation') && !dbError.message.includes('does not exist')) {
      return {
        success: false,
        message: 'Database connection error',
        details: {
          url,
          projectId,
          error: dbError.message,
        },
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase',
      details: {
        url,
        projectId,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
