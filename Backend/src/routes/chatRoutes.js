const express = require('express');
const { z } = require('zod');
const { authRequired } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Define the schema for the chat request
const chatBodySchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })
  ).optional()
});

// All chat requests must be authenticated
router.use(authRequired);

// POST /api/chat (or whatever prefix you use in index.js)
router.post('/', validate({ body: chatBodySchema }), chatController.handleChat);

module.exports = { chatRoutes: router };