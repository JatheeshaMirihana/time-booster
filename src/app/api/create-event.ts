import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, description, date } = req.body;

    // Configure the OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      const event = {
        summary: title,
        description,
        start: {
          date,
        },
        end: {
          date,
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      res.status(200).json({ success: true, eventId: response.data.id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create event', details: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
