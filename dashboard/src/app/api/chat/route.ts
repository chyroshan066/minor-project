import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, token } = body;

    if (!token) {
      return NextResponse.json(
        { reply: "Session expired. Please log in to your Arthonyx account." },
        { status: 401 }
      );
    }

    // ADDED: Decode the JWT payload to extract hospital_id.
    // JWT structure is: header.payload.signature — all base64url encoded.
    // We only need the payload (index 1) to get hospital_id.
    const jwtPayload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString('utf-8')
    );
    const hospital_id = jwtPayload.hospital_id;

    // ADDED: Guard — if hospital_id is missing in the token, reject early.
    if (!hospital_id) {
      return NextResponse.json(
        { reply: "Session expired. Please log in to your Arthonyx account." },
        { status: 401 }
      );
    }

    // CHANGED: Now calling the Python Lambda directly with all required fields.
    // Python FastAPI expects: { message, hospital_id, conversation_history }
    const response = await axios.post(
      'https://api-minor-project.vercel.app/api/chat',
      {
        message,
        hospital_id,                    // ADDED: extracted from JWT above
        conversation_history: history || []
      },
      {
        headers: {
          "Content-Type": "application/json"
          // REMOVED: Authorization header — Python Lambda has no auth middleware,
          // hospital_id is passed in the body instead.
        },
      }
    );

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error("Dashboard Bridge Error:", error.response?.data || error.message);
    
    // CHANGED: more specific error message for easier debugging
    const errorMessage = error.response?.data?.detail 
      || error.response?.data?.message 
      || "DentaBot is having trouble connecting to the records.";
    
    return NextResponse.json(
      { reply: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}