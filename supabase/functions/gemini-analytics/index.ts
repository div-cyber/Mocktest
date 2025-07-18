import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface AnalyticsRequest {
  testId: string
  userId: string
  answers: { questionId: string; selectedAnswer: number; correctAnswer: number; timeTaken?: number }[]
  totalScore: number
  totalQuestions: number
  timeTaken: number
  section: 'engineering' | 'medical'
  subject?: string
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const GEMINI_API_KEY = 'AIzaSyAxetkUwp6bz0tRaZU28Go_0jKBFUEsm-k'
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const analyticsData: AnalyticsRequest = await req.json()

    // Get user's previous test results for trend analysis
    const { data: previousResults } = await supabase
      .from('test_results')
      .select('score, time_taken, completed_at, analytics')
      .eq('user_id', analyticsData.userId)
      .order('completed_at', { ascending: false })
      .limit(10)

    // Calculate performance metrics
    const correctAnswers = analyticsData.answers.filter(a => a.selectedAnswer === a.correctAnswer).length
    const accuracy = (correctAnswers / analyticsData.totalQuestions) * 100
    const averageTimePerQuestion = analyticsData.timeTaken / analyticsData.totalQuestions

    // Analyze answer patterns
    const subjectPerformance: { [key: string]: { correct: number; total: number } } = {}
    const difficultyPerformance: { [key: string]: { correct: number; total: number } } = {}

    analyticsData.answers.forEach(answer => {
      // This would need to be enhanced with actual question metadata
      const subject = analyticsData.subject || 'General'
      const difficulty = 'medium' // Would come from question metadata
      
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { correct: 0, total: 0 }
      }
      if (!difficultyPerformance[difficulty]) {
        difficultyPerformance[difficulty] = { correct: 0, total: 0 }
      }

      subjectPerformance[subject].total++
      difficultyPerformance[difficulty].total++

      if (answer.selectedAnswer === answer.correctAnswer) {
        subjectPerformance[subject].correct++
        difficultyPerformance[difficulty].correct++
      }
    })

    // Create comprehensive analytics prompt
    const examType = analyticsData.section === 'engineering' ? 'IOE entrance exam' : 'MOE entrance exam'
    
    const analyticsPrompt = `You are an expert educational analyst for ${examType} preparation. Analyze this student's test performance and provide comprehensive insights.

PERFORMANCE DATA:
- Score: ${analyticsData.totalScore}/${analyticsData.totalQuestions} (${accuracy.toFixed(1)}%)
- Time taken: ${analyticsData.timeTaken} minutes (${averageTimePerQuestion.toFixed(1)} min/question)
- Section: ${analyticsData.section}
- Subject: ${analyticsData.subject || 'Mixed'}

PREVIOUS PERFORMANCE TREND:
${previousResults ? previousResults.map((result, index) => 
  `Test ${index + 1}: ${result.score}% (${result.time_taken} min) - ${new Date(result.completed_at).toLocaleDateString()}`
).join('\n') : 'No previous tests'}

DETAILED ANSWER ANALYSIS:
${analyticsData.answers.map((answer, index) => 
  `Q${index + 1}: ${answer.selectedAnswer === answer.correctAnswer ? 'CORRECT' : 'INCORRECT'} (Selected: ${answer.selectedAnswer}, Correct: ${answer.correctAnswer})`
).join('\n')}

PROVIDE ANALYSIS IN THIS JSON FORMAT:
{
  "overallPerformance": {
    "grade": "A/B/C/D/F",
    "percentile": "estimated percentile rank",
    "summary": "brief performance summary"
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "timeManagement": {
    "analysis": "time management analysis",
    "recommendation": "specific time management advice"
  },
  "subjectAnalysis": {
    "strongSubjects": ["subject names"],
    "weakSubjects": ["subject names"],
    "recommendations": ["specific study recommendations"]
  },
  "improvementPlan": {
    "immediate": ["immediate action items"],
    "shortTerm": ["1-2 week goals"],
    "longTerm": ["1-2 month goals"]
  },
  "nextSteps": ["specific next actions"],
  "motivationalMessage": "encouraging message based on performance",
  "predictedScore": "estimated score range for actual exam",
  "studyHours": "recommended daily study hours",
  "focusAreas": ["priority topics to focus on"]
}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analyticsPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const generatedAnalysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    let analytics
    try {
      // Extract JSON from the response
      const jsonMatch = generatedAnalysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analytics = JSON.parse(jsonMatch[0])
      } else {
        analytics = JSON.parse(generatedAnalysis)
      }
    } catch (parseError) {
      console.error('Analytics parsing error:', parseError)
      // Fallback analytics
      analytics = {
        overallPerformance: {
          grade: accuracy >= 80 ? 'A' : accuracy >= 60 ? 'B' : accuracy >= 40 ? 'C' : 'D',
          percentile: `${Math.min(95, Math.max(5, accuracy))}th`,
          summary: `Scored ${accuracy.toFixed(1)}% in ${analyticsData.timeTaken} minutes`
        },
        strengths: ["Completed the test", "Showed persistence"],
        weaknesses: ["Need more practice"],
        rawAnalysis: generatedAnalysis
      }
    }

    // Store analytics in database
    const { error: updateError } = await supabase
      .from('test_results')
      .update({ analytics })
      .eq('test_id', analyticsData.testId)
      .eq('user_id', analyticsData.userId)

    if (updateError) {
      console.error('Error updating analytics:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        analytics,
        performance: {
          accuracy,
          averageTimePerQuestion,
          subjectPerformance,
          difficultyPerformance
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Analytics error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to generate analytics'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})