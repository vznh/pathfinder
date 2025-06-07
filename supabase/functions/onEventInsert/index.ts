import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
console.info('server started');
const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER } = Deno.env.toObject();
async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  }).then((r)=>r.json());
  return res.access_token;
}
function encodeBase64Url(input) {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function buildRaw({ from, to, subject, html }) {
  const msg = `From: ${from}\r\n` + `To: ${to}\r\n` + `Subject: ${subject}\r\n` + `MIME-Version: 1.0\r\n` + `Content-Type: text/html; charset="UTF-8"\r\n\r\n` + // blank line!
  html;
  return encodeBase64Url(msg);
}
async function sendEmail({ organization, eventTitle, url, to }) {
  const accessToken = await getAccessToken();
  const raw = buildRaw({
    from: `"pathfinder" <${GMAIL_SENDER}>`,
    to: `<${to}>`,
    subject: `${organization} just posted an event`,
    html: `<p>${organization} published: <a href="${url}">${eventTitle}</a></p>`
  });
  const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw
    })
  });
  if (!gmailRes.ok) {
    console.error('Gmail error:', await gmailRes.json());
    throw new Error(`Gmail send failed: ${gmailRes.statusText}`);
  }
}
serve(async (req)=>{
  const payload = await req.json();
  console.log(payload);
  const organization_id = payload?.record?.organization_id;
  const event_title = payload?.record?.event;
  const event_id = payload?.record?.id;
  if (organization_id != null) {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      },
      db: {
        schema: 'authenticated'
      }
    });
    const { data, error } = await supabase.from('subscriptions_v0').select(`
    ...profiles_v0!inner(
      email
    ),
    ...organizations_v0!inner(
      name
    )
    `).eq('organization_id', organization_id);
    if (error) {
      throw error;
    }
    console.log("email addresses to send to: ", data);
    // const data = {
    //   message: `Hello ${table}!`
    // };
    // console.log(table);
    const access_token = await getAccessToken();
    for (const row of data){
      await sendEmail({
        organization: row?.name,
        eventTitle: event_title,
        url: "https://pathfinder-hobin.vercel.app/events/" + event_id,
        to: row?.email
      });
    }
    return new Response("Sent emails", {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  }
  {
    console.log("no org id");
    return new Response("No org id", {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  }
});
