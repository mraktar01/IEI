exports.handler = async (event, context) => {
  // 1. Check if it's a secure POST request
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 2. Grab the EXACT variable names we are going to put in Netlify
  const EXPECTED_USERNAME = process.env.ADMIN_USERNAME; 
  const EXPECTED_PASSWORD = process.env.ADMIN_PASSWORD;

  try {
    // 3. Unpack the username and password the user typed into the login.html form
    const frontendData = JSON.parse(event.body);
    
    // 4. Compare what they typed against the secrets in Netlify
    if (frontendData.username === EXPECTED_USERNAME && frontendData.password === EXPECTED_PASSWORD) {
      // It's a match! Let them in.
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Login successful!" }),
      };
    } else {
      // No match. Kick them out.
      return {
        statusCode: 401, // 401 means "Unauthorized"
        body: JSON.stringify({ error: "Incorrect username or password." }),
      };
    }

  } catch (error) {
    return {
      statusCode: 400, 
      body: JSON.stringify({ error: "Data was formatted incorrectly." }),
    };
  }
};
