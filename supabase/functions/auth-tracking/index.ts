import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface LoginTrackingRequest {
  action: 'login' | 'logout'
  userId: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { action, userId, ipAddress, userAgent, sessionId }: LoginTrackingRequest = await req.json()

    if (action === 'login') {
      // Create new login session
      const { data, error } = await supabase
        .from('login_sessions')
        .insert({
          user_id: userId,
          login_time: new Date().toISOString(),
          ip_address: ipAddress || req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: userAgent || req.headers.get('user-agent') || 'unknown'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionId: data.id,
          message: 'Login tracked successfully' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } else if (action === 'logout') {
      // Update logout time and calculate session duration
      const { error } = await supabase
        .from('login_sessions')
        .update({
          logout_time: new Date().toISOString(),
          session_duration: `${Date.now() - new Date().getTime()} milliseconds`
        })
        .eq('user_id', userId)
        .eq('logout_time', null)
        .order('login_time', { ascending: false })
        .limit(1)

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Logout tracked successfully' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Auth tracking error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})