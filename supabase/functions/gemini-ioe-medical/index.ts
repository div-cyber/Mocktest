import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface TestGenerationRequest {
  examType: 'engineering' | 'medical'
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount?: number
  subjects?: string[]
  driveLink?: string
  adaptiveLevel?: number
}

interface MCQ {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  marks: number
}

interface TestPaper {
  examType: 'engineering' | 'medical'
  subjects: {
    subject: string
    marks: number
    questions: MCQ[]
  }[]
  totalMarks: number
  timeLimit: number
  isAdaptive: boolean
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
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const { examType, difficulty, questionCount = 50, subjects, driveLink, adaptiveLevel = 1 }: TestGenerationRequest = await req.json()

    // Define exam-specific subjects and structure
    const examConfig = {
      engineering: {
        name: 'IOE Entrance Examination',
        subjects: [
          { name: 'Mathematics', questions: 20, marks: 40, timePerQuestion: 90 },
          { name: 'Physics', questions: 15, marks: 30, timePerQuestion: 90 },
          { name: 'Chemistry', questions: 10, marks: 20, timePerQuestion: 90 },
          { name: 'English', questions: 5, marks: 10, timePerQuestion: 60 }
        ],
        totalTime: 180, // 3 hours (10800 seconds)
        syllabus: `
        Mathematics: Algebra, Trigonometry, Coordinate Geometry, Calculus, Statistics, Probability
        Physics: Mechanics, Heat, Light, Sound, Electricity, Magnetism, Modern Physics
        Chemistry: Physical Chemistry, Inorganic Chemistry, Organic Chemistry
        English: Grammar, Vocabulary, Reading Comprehension, Writing Skills
        `
      },
      medical: {
        name: 'Medical Entrance Examination (MBBS/BDS)',
        subjects: [
          { name: 'Biology', questions: 20, marks: 40, timePerQuestion: 90 },
          { name: 'Chemistry', questions: 15, marks: 30, timePerQuestion: 90 },
          { name: 'Physics', questions: 10, marks: 20, timePerQuestion: 90 },
          { name: 'English', questions: 5, marks: 10, timePerQuestion: 60 }
        ],
        totalTime: 180, // 3 hours (10800 seconds)
        syllabus: `
        Biology: Cell Biology, Genetics, Evolution, Ecology, Human Physiology, Plant Biology, Animal Biology
        Chemistry: Physical Chemistry, Inorganic Chemistry, Organic Chemistry, Biochemistry
        Physics: Mechanics, Thermodynamics, Optics, Electricity, Modern Physics
        English: Grammar, Vocabulary, Reading Comprehension, Medical Terminology
        `
      }
    }

    const config = examConfig[examType]
    let contentFromDrive = ''

    // If Google Drive link is provided, fetch content (simplified - in production use proper Google Drive API)
    if (driveLink) {
      try {
        // This is a simplified approach - in production, you'd use Google Drive API
        const driveResponse = await fetch(driveLink)
        if (driveResponse.ok) {
          contentFromDrive = await driveResponse.text()
        }
      } catch (error) {
        console.error('Error fetching from Google Drive:', error)
      }
    }

    // Generate adaptive difficulty adjustment
    const adaptiveDifficultyMap = {
      1: 'easy',
      2: 'medium', 
      3: 'hard'
    }
    const adaptiveDifficulty = adaptiveDifficultyMap[Math.min(3, Math.max(1, adaptiveLevel))] || difficulty

    const testPaper: TestPaper = {
      examType,
      subjects: [],
      totalMarks: 0,
      timeLimit: 10800, // 3 hours in seconds
      isAdaptive: true
    }

    // Generate questions for each subject
    for (const subjectConfig of config.subjects) {
      const prompt = `You are an expert question setter for the ${config.name} in Nepal. 

EXAM CONTEXT:
- Exam: ${config.name}
- Subject: ${subjectConfig.name}
- Difficulty Level: ${adaptiveDifficulty}
- Questions Required: ${subjectConfig.questions}
- Time per Question: ${subjectConfig.timePerQuestion} seconds
- Marks per Question: ${subjectConfig.marks / subjectConfig.questions}

SYLLABUS REFERENCE:
${config.syllabus}

${contentFromDrive ? `ADDITIONAL CONTENT FROM DRIVE:\n${contentFromDrive.substring(0, 2000)}` : ''}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${subjectConfig.questions} high-quality multiple-choice questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Only ONE option should be correct
4. Questions must be at ${adaptiveDifficulty} difficulty level
5. Include detailed explanations for correct answers
6. Questions should test conceptual understanding, not just memorization
7. Vary question types: conceptual (40%), analytical (35%), application-based (25%)
8. Ensure questions are relevant to ${examType} entrance exam standards in Nepal
9. Include numerical problems where appropriate for the subject
10. Questions should be solvable within ${subjectConfig.timePerQuestion} seconds

QUESTION DISTRIBUTION FOR ${subjectConfig.name.toUpperCase()}:
${subjectConfig.name === 'Mathematics' ? `
- Algebra: 25%
- Trigonometry: 20% 
- Coordinate Geometry: 20%
- Calculus: 20%
- Statistics/Probability: 15%
` : subjectConfig.name === 'Physics' ? `
- Mechanics: 30%
- Heat & Thermodynamics: 15%
- Optics: 15%
- Electricity & Magnetism: 25%
- Modern Physics: 15%
` : subjectConfig.name === 'Chemistry' ? `
- Physical Chemistry: 40%
- Inorganic Chemistry: 30%
- Organic Chemistry: 30%
` : subjectConfig.name === 'Biology' ? `
- Cell Biology & Genetics: 25%
- Human Physiology: 30%
- Plant Biology: 20%
- Animal Biology: 25%
` : `
- Grammar: 40%
- Vocabulary: 30%
- Reading Comprehension: 30%
`}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "unique_question_id",
    "question": "Question text here with proper formatting",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed step-by-step explanation of why this answer is correct, including relevant formulas or concepts",
    "subject": "${subjectConfig.name}",
    "difficulty": "${adaptiveDifficulty}",
    "timeLimit": ${subjectConfig.timePerQuestion},
    "marks": ${subjectConfig.marks / subjectConfig.questions}
  }
]

Generate exactly ${subjectConfig.questions} questions following this format. Ensure mathematical expressions are properly formatted and all questions are unique and challenging.`

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      )

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error for ${subjectConfig.name}: ${geminiResponse.status}`)
      }

      const geminiData = await geminiResponse.json()
      const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error(`No content generated for ${subjectConfig.name}`)
      }

      // Parse the JSON response
      let questions: MCQ[]
      try {
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0])
        } else {
          questions = JSON.parse(generatedText)
        }
      } catch (parseError) {
        console.error(`JSON parsing error for ${subjectConfig.name}:`, parseError)
        // Fallback questions if parsing fails
        questions = Array.from({ length: subjectConfig.questions }, (_, i) => ({
          id: `${subjectConfig.name.toLowerCase()}_${i + 1}`,
          question: `Sample ${subjectConfig.name} question ${i + 1} (Generation failed - please retry)`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "This is a fallback question due to generation error.",
          subject: subjectConfig.name,
          difficulty: adaptiveDifficulty as 'easy' | 'medium' | 'hard',
          timeLimit: subjectConfig.timePerQuestion,
          marks: subjectConfig.marks / subjectConfig.questions
        }))
      }

      // Validate and clean questions
      const validatedQuestions = questions
        .filter(q => 
          q.question && 
          Array.isArray(q.options) && 
          q.options.length === 4 &&
          typeof q.correctAnswer === 'number' &&
          q.correctAnswer >= 0 && 
          q.correctAnswer < 4 &&
          q.explanation
        )
        .slice(0, subjectConfig.questions) // Ensure exact count
        .map((q, index) => ({
          ...q,
          id: q.id || `${subjectConfig.name.toLowerCase()}_${index + 1}`,
          subject: subjectConfig.name,
          difficulty: adaptiveDifficulty as 'easy' | 'medium' | 'hard',
          timeLimit: subjectConfig.timePerQuestion,
          marks: subjectConfig.marks / subjectConfig.questions
        }))

      // Fill remaining questions if needed
      while (validatedQuestions.length < subjectConfig.questions) {
        const index = validatedQuestions.length
        validatedQuestions.push({
          id: `${subjectConfig.name.toLowerCase()}_${index + 1}`,
          question: `Additional ${subjectConfig.name} question ${index + 1}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "Additional question to meet requirement.",
          subject: subjectConfig.name,
          difficulty: adaptiveDifficulty as 'easy' | 'medium' | 'hard',
          timeLimit: subjectConfig.timePerQuestion,
          marks: subjectConfig.marks / subjectConfig.questions
        })
      }

      testPaper.subjects.push({
        subject: subjectConfig.name,
        marks: subjectConfig.marks,
        questions: validatedQuestions
      })

      testPaper.totalMarks += subjectConfig.marks
    }

    return new Response(
      JSON.stringify(testPaper),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Test generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to generate test paper'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})