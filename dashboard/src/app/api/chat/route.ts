import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, token } = body;

    // 1. Validate that we have a token
    if (!token) {
      return NextResponse.json(
        { reply: "Session expired. Please log in to your Arthonyx account." },
        { status: 401 }
      );
    }

    // 2. Forward request to Node.js (Port 4000)
    const response = await axios.post(
      'https://api-minor-project.vercel.app/api/chat-ai', 
      {
        message: message,
        // Match the 'conversation_history' key your Python service expects
        conversation_history: history || [] 
      }, 
      {
        headers: { 
          // Use the Bearer token passed from the frontend zustand store
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    // Log the detailed error to your Next.js terminal for debugging
    console.error("Dashboard Bridge Error:", error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || "DentaBot is having trouble connecting to the records.";
    
    return NextResponse.json(
      { reply: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}