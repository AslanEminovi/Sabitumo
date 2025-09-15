import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json()

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Prepare images for OpenAI Vision API
    const imageMessages = images.map((image: string) => ({
      type: "image_url",
      image_url: {
        url: image,
        detail: "high"
      }
    }))

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze these product images and extract detailed product information. Return a JSON object with the following structure:

{
  "name_en": "Product name in English",
  "name_ka": "Product name in Georgian (translated)",
  "description_en": "Detailed product description in English (2-3 sentences, focus on features, materials, use cases)",
  "description_ka": "Detailed product description in Georgian (translated)",
  "category": "Main category (e.g., Boots, Knives, Backpacks, Gloves, etc.)",
  "brand": "Brand name if visible or identifiable from logos/markings, or empty string if no brand visible",
  "subcategory": "Specific subcategory (e.g., Tactical Boots, Hiking Boots, Combat Boots)",
  "material": "Primary materials used (e.g., Leather, Nylon, Steel, etc.)",
  "tags": ["array", "of", "relevant", "tags", "like", "waterproof", "tactical", "military"],
  "weight": "Estimated weight with unit (e.g., 1.2 kg)",
  "dimensions": "Estimated dimensions (e.g., 25 x 15 x 10 cm)",
  "color": "Primary color(s) of the product",
  "confidence": 0.85
}

For Georgian translations, use appropriate Georgian text. Focus on tactical/military/outdoor equipment context. Be specific about materials, features, and intended use. Confidence should be between 0.7-0.95 based on image clarity and identifiable features.`
            },
            ...imageMessages
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const analysisText = response.choices[0]?.message?.content
    
    if (!analysisText) {
      throw new Error('No analysis received from AI')
    }

    // Parse the JSON response
    let analysisResult
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        analysisResult = JSON.parse(analysisText)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the response structure
    const requiredFields = [
      'name_en', 'name_ka', 'description_en', 'description_ka',
      'category', 'brand', 'subcategory', 'material', 'tags',
      'weight', 'dimensions', 'color', 'confidence'
    ]

    for (const field of requiredFields) {
      if (!(field in analysisResult)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Ensure tags is an array
    if (!Array.isArray(analysisResult.tags)) {
      analysisResult.tags = []
    }

    // Ensure confidence is a number between 0 and 1
    if (typeof analysisResult.confidence !== 'number') {
      analysisResult.confidence = 0.8
    }
    analysisResult.confidence = Math.max(0, Math.min(1, analysisResult.confidence))

    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('AI Analysis Error:', error)
    
    // Return a fallback response for development/testing
    return NextResponse.json(
      { 
        error: 'AI analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        // Fallback mock data for testing
        fallback: {
          name_en: "Tactical Product",
          name_ka: "ტაქტიკური პროდუქტი",
          description_en: "High-quality tactical equipment designed for professional use. Features durable materials and reliable performance.",
          description_ka: "მაღალი ხარისხის ტაქტიკური აღჭურვილობა პროფესიონალური გამოყენებისთვის. გამოირჩევა გამძლე მასალებით და საიმედო მუშაობით.",
          category: "Tactical",
          brand: "Unknown",
          subcategory: "Professional Equipment",
          material: "Synthetic",
          tags: ["tactical", "professional", "durable"],
          weight: "1.0 kg",
          dimensions: "25 x 15 x 10 cm",
          color: "Black",
          confidence: 0.7
        }
      },
      { status: 500 }
    )
  }
}
