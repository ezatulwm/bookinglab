const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event) {
  // Validate request body
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "No request body received" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { name, bookingInfo } = data;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!ADMIN_EMAIL || !RESEND_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ADMIN_EMAIL or RESEND_API_KEY is not set in env variables." })
    };
  }

  const recipients = ADMIN_EMAIL.split(',').map(e => e.trim());
  const fromEmail = "onboarding@resend.dev"; // Change this if you have a verified sender

  const subject = "New Booking Form Submission";
  const text = `A new booking was submitted.

Name: ${name || "N/A"}
Booking Info: ${bookingInfo ? JSON.stringify(bookingInfo, null, 2) : "N/A"}
`;

  let errors = [];
  let sent = [];

  for (const to of recipients) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          text,
        }),
      });

      const resText = await response.text();
      if (response.ok) {
        sent.push(to);
      } else {
        errors.push({ to, error: resText });
        console.error(`Resend error for ${to}:`, resText);
      }
    } catch (err) {
      errors.push({ to, error: err.message });
      console.error(`Exception for ${to}:`, err.message);
    }
  }

  if (errors.length === 0) {
    return { statusCode: 200, body: JSON.stringify({ message: "Emails sent!", sent }) };
  } else {
    return { statusCode: 500, body: JSON.stringify({ error: "Some emails failed", errors }) };
  }
};
