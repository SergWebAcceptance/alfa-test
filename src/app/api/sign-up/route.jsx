import axios from 'axios';

// Assuming your environment variables are set as shown previously
const apiKey = process.env.NEXT_PUBLIC_REST_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL;

export async function POST(request) {
    const requestBody = await request.text();
    const bodyJSON = JSON.parse(requestBody);
    const { email, password } = bodyJSON;
    

    try {
        // Construct the URL for registration
        const registerUrl = `${apiUrl}auth/local/register`;

        // Make the POST request using axios
        const response = await axios.post(registerUrl, {
            username: email,
            email: email,
            password: password,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            }
        });

        // Success: Log and return the response data
        console.log('User profile', response.data.user);
        console.log('User token', response.data.jwt);

        return new Response(JSON.stringify({ message: "Success: email was sent", user: response.data }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        // Log the error
        console.error('An error occurred:', error.response ? error.response : error.message);

        // Return a response indicating failure
        return new Response(JSON.stringify({ message: "COULD NOT SEND MESSAGE", error: error.response ? error.response.data : error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
