import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, amount = 5, jenjang = "Umum", kelas = "" } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_API_KEY')

    if (!apiKey) throw new Error('Google API Key not configured')

    const genAI = new GoogleGenerativeAI(apiKey)

    
    const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" })

    const prompt = `
      Buatkan ${amount} soal pilihan ganda untuk tingkat ${jenjang} ${kelas} dengan topik: "${topic}".
      
      Instruksi Output:
      1. Output WAJIB JSON Array murni.
      2. Jangan gunakan markdown (seperti \`\`\`json).
      3. Format per objek: {"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "...", "explanation": "..."}
      4. Pastikan "correct_answer" sama persis dengan salah satu string di "options".
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    text = text.replace(/```json/g, '').replace(/```/g, '').trim()
    
    let questions
    try {
      questions = JSON.parse(text)
    } catch (e) {
      console.error("Raw Text:", text)
      throw new Error("Format jawaban AI tidak valid (JSON Parse Error).")
    }

    return new Response(JSON.stringify({ data: questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})