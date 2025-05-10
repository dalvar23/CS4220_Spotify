import axios from "axios";
import dotenv from "dotenv";
import querystring from 'querystring';

dotenv.config();

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const tokenUrl = 'https://accounts.spotify.com/api/token';

export const getToken = async () => {
    try {
        const response = await axios.post(tokenUrl,
            querystring.stringify({ grant_type: 'client_credentials' }), // Properly encode body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64')
                }
            }
        );
    
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching token:', error.response?.data || error.message);
        throw error;
    }
};

export const searchAPI = async (searchName) => {
    try {
        const token = await getToken();

        const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchName)}&type=artist&limit=5`;
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data.artists;
    } catch (error) {
        console.log('Error fetching artist', error.response?.data || error.message);
        throw error;
    }
};

export const searchID = async (id) => {
    try {
        const token = await getToken();

        const endpoint = `https://api.spotify.com/v1/artists/${encodeURIComponent(id)}`;
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    } catch (error) {
        console.log('Error fetching id', error.response?.data || error.message);
        throw error;
    }
};

// const art = await searchAPI('track','Stan');
// console.log(art);
// const arts = await searchAPI('artist','Metallica');
// console.log(arts);
// const testing = await searchID('0C0XlULifJtAgn6ZNCW2eu');
// console.log(testing);
