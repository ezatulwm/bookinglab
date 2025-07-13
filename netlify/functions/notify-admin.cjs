const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No request body received" })
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const { name, bookingInfo } = data;

  // Multiple admins: comma-separated in Netlify ENV
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  // Split the string to an array (handles 1 or many admins)
  const recipients = ADMIN_EMAIL.split(',').map(e => e.trim());

  // Send email with Resend API
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Booking Bot <onboarding@resend.dev>",
      to: recipients, // <-- now an array!
      subject: "New Booking Form Submission",
      text: `A new booking was submitted.\n\nName: ${name}\nBooking Info: ${JSON.stringify(bookingInfo, null, 2)}`,
    }),
  });

  if (res.ok) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent!" })
    };
  } else {
    const error = await res.text();
    return {
      statusCode: 500,
      body: JSON.stringify({ error })
    };
  }
};
