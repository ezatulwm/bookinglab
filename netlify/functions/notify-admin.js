const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // Node 18+
exports.handler = async function(event, context) {
  const { name, email, bookingInfo } = JSON.parse(event.body);

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Set your admin email in Netlify
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Booking Bot <onboarding@resend.dev>", // Use a verified domain later for production!
      to: ADMIN_EMAIL,
      subject: "New Booking Form Submission",
      text: `A new booking was submitted.\n\nName: ${name}\nEmail: ${email}\nBooking Info: ${JSON.stringify(bookingInfo, null, 2)}`,
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
