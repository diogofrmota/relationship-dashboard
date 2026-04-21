/**
 * API endpoint for user data CRUD operations
 * Handles GET and POST/PUT requests for media tracker data
 */

import { getUserData, saveUserData } from '../lib/db.js';

export default async function handler(req, res) {
  // CORS headers for PWA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate user ID
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ 
      error: 'Missing user ID',
      message: 'Please provide x-user-id header'
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const result = await getUserData(userId);
        const data = result?.data || { movies: [], anime: [], books: [] };
        return res.status(200).json(data);
      }

      case 'POST':
      case 'PUT': {
        const { data } = req.body;
        
        if (!data) {
          return res.status(400).json({ 
            error: 'Missing data',
            message: 'Request body must contain data object'
          });
        }

        // Validate data structure
        if (!data.movies || !data.anime || !data.books) {
          return res.status(400).json({ 
            error: 'Invalid data structure',
            message: 'Data must contain movies, anime, and books arrays'
          });
        }

        const result = await saveUserData(userId, data);
        return res.status(200).json({ 
          success: true,
          updatedAt: result.updatedAt
        });
      }

      default:
        return res.status(405).json({ 
          error: 'Method not allowed',
          allowedMethods: ['GET', 'POST', 'PUT']
        });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message
    });
  }
}