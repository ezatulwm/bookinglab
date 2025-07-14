const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event) {
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

  const recipients = ADMIN_EMAIL.split(',').map(e => e.trim());
  console.log("Recipients array:", recipients);

  // Send to each admin individually!
  const results = await Promise.all(
    recipients.map(async (to) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Booking Bot <onboarding@resend.dev>",
          to,
          subject: "New Booking Form Submission",
          text: `A new booking was submitted.\n\nName: ${name}\nBooking Info: ${JSON.stringify(bookingInfo, null, 2)}`,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        console.log(`Failed for ${to}: ${text}`);
      }
      return res.ok;
    })
  );

  if (results.every(r => r)) {
    return { statusCode: 200, body: JSON.stringify({ message: "Emails sent!" }) };
  } else {
    return { statusCode: 500, body: JSON.stringify({ error: "One or more emails failed." }) };
  }
};
