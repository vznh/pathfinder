# pages
The `pages` folder is especially important. If you want to create a new page to access, create it in `pages/[page_name]`, and it'll appear in the router as`[our domain name]/[page_name]`.

However, we aren't making new pages or anything of the sort. Our app is specially designed to work on one view. You can use the `pages/api` folder to create methods that pertain to connecting front-end calls with back-end.

# Example
For example, placing a file in `pages/api` named `mapbox_event_creation` using Axios to interact with Supabase:
```ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type EventCreationParams {
  coords: [number, number];     // Coordinates of specific event
  event_name: string;           // Typically the name of the event, which will be sanitized to be less than 50 char
  event_desc?: string;          // Optionally the event description in plaintext
  date: Date;                   // Typically the date of when the event will happen
  time_range: [number, number]; // Typically depicted in military time; [1400, 1500]

  cruzID: string;               // Who created the event?
  creation_date: Date;          // Creation date

  // roles later?
}

type EventCreationResponse {
  code?: number;    // Typically 200 or any of the 400 series
  success: boolean; // True = call succeeded, False = call failed
  error?: string;   // Typically a string that depicts the error
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventCreationResponse>,
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      code: 405,
      success: false,
      error: 'Method not allowed, only POST is accepted'
    });
  }

  try {
    const data = req.body as EventCreationParams;

    // Validate required fields
    if (
      !data.coords      ||
      !data.event_name  ||
      !data.date        ||
      !data.time_range  ||
      !data.cruzID      ||
      !data.creation_date
    ) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: 'Missing required fields'
      });
    }

    // Sanitize event name to be less than 50 chars
    const sanitizedEventName = data.event_name.slice(0, 50);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        code: 500,
        success: false,
        error: 'Server configuration error: Missing Supabase credentials'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert data into Supabase
    const { data: insertedData, error } = await supabase
      .from('events')
      .insert({
        coords: data.coords,
        event_name: sanitizedEventName,
        event_desc: data.event_desc || null,
        date: new Date(data.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
        time_start: data.time_range[0],
        time_end: data.time_range[1],
        cruz_id: data.cruzID,
        creation_date: new Date(data.creation_date).toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      code: 200,
      success: true
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      code: 500,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
```
