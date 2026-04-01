const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Safety check: ensure hospital_id exists from auth middleware
    if (!req.user || !req.user.hospital_id) {
      return res.status(401).json({ reply: "Unauthorized: Hospital ID missing." });
    }

    const hospital_id = req.user.hospital_id;

    // Forwarding the request to your Python service on Port 5001
    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/api/chat`, {
      message,
      hospital_id,
      conversation_history: history || []
    });

    // Return the AI's response back to the Next.js frontend
    res.json(pythonResponse.data);
    
  } catch (error) {
    console.error("Node to Python Error:", error.message);
    
    // Handle cases where Python service might be down
    res.status(502).json({ 
      reply: "DentaBot is currently sleeping. Please try again in a moment.",
      error: error.message 
    });
  }
};