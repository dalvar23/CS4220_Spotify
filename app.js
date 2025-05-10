import inquirer from 'inquirer';
import * as api from './services/api.js';
import * as db from './db.js';

// display helper
const printArtist = (artist) => {
    console.log('\nArtist Info:');
    console.log(`Name: ${artist.name}`);
    console.log(`Genre: ${artist.genre}`);
    console.log(`Popularity: ${artist.popularity}`);
    console.log(`Followers: ${artist.followers}`);
    console.log(`Spotify URL: ${artist.url}`);
    console.log('----------------------------');
};

// main search function
export const searchArtistByKeyword = async (keyword) => {
    try {
        const data = await api.searchAPI(keyword);

        if (!data.items || data.items.length === 0) {
            console.log('No artists found');
            return;
        }

        const results = data.items;

        const prevKeywords = await db.find('search_history_keyword');
        const keywordExists = prevKeywords.some(k => k.keyword === keyword);
        if(!keywordExists){
            await db.insert('search_history_keyword', { keyword });
        }  // updated to duplicate check before inserting keyword
        
    

        const { selectedID } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedID',
                message: 'Select an artist',
                choices: results.map((artist) => ({
                    name: `${artist.name} (${artist.genres?.join(', ') || 'Unknown'})`,
                    value: artist.id,
                })),
            },
        ]);

        const selectedArtist = await api.searchID(selectedID);

        const prevSelections = await db.find('search_history_artist');
        const selectionExist = prevSelections.some(s => s.id === selectedArtist.id);
        if(!selectionExist){
            await db.insert('search_history_artist', selectedArtist); // updated to insert unique selected artists
        }

        

        printArtist({
            name: selectedArtist.name,
            genre: selectedArtist.genres?.join(', ') || 'Unknown',
            popularity: selectedArtist.popularity,
            followers: selectedArtist.followers?.total || selectedArtist.followers,
            url: selectedArtist.external_urls?.spotify || selectedArtist.url,
        });
        
    } catch (error) {
        console.error('Search Error:', error.message);
    }

};

//show artist history
//This function lets users see past search artists and run a search again:
export const showArtistHistory = async () => {
    try {
        const keywords = await db.find('search_history_keyword');

        if (!keywords.length) {
            console.log('No artist history found.');
            return;
        }

        const { keyword } = await inquirer.prompt([
            {
                type: 'list',
                name: 'keyword',
                message: 'Select a keyword from history or Exit:',
                choices: ['Exit', ...keywords.map(k => k.keyword)],
            }
        ]);

        if (keyword !== 'Exit') {
            await searchArtistByKeyword(keyword);
        }

    } catch (err) {
        console.error('Keyword History Error:', err.message);
    }
};

//showSelectionHistory
//This lets users see artists they've previously selected
export const showSelectionHistory = async () => {
    try {
        const selections = await db.find('search_history_artist');

        if (!selections.length) {
            console.log('No artist selection history found.');
            return;
        }

        const { artistId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'artistId',
                message: `Select an artist or Exit:`,
                choices: ['Exit', ...selections.map(a => ({
                    name: `${a.name} (${a.genres?.join(', ') || 'Unknown'})`,
                    value: a.id
                }))],
            }
        ]);

        if (artistId !== 'Exit') {
            const artist = await api.searchID(artistId);  //fetch artist info
            printArtist({
                name: artist.name,
                genre: artist.genres?.join(', ') || 'Unknown',
                popularity: artist.popularity,
                followers: artist.followers?.total || artist.followers,
                url: artist.external_urls?.spotify || artist.url,
            });
        }

    } catch (err) {
        console.error('Selection History Error:', err.message);
    }
};
