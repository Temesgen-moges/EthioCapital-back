
import axios from 'axios';

const tx_ref = 'tx-38c13790-beb9-46af-b9d1-dc3b52e679f4'; // Your latest txRef
const secretKey = 'CHASECK_TEST-on7KfZzHhBYww4l2eiN7oupayH9yOY70'; // From your .env

try {
  const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  console.log('Chapa response:', JSON.stringify(response.data, null, 2));
} catch (error) {
  console.error('Chapa error:', error.response?.data || error.message);
}
