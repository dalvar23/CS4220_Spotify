import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { searchArtistByKeyword, showArtistHistory } from './app.js';

const cli = yargs(hideBin(process.argv));

cli.command(
    'search <keyword>',
    'Search for an artist or band with a keyword(s)',
    (yargs) => {
        yargs.positional('keyword' , {
            desrcibe: 'The keyword to search for is: ',
            type: 'string',
    });
    },
    (argv) => {
        searchArtistByKeyword(argv.keyword);
    }
);

cli.command(
    'history <type>',
    'View your history of searches and or selections',
    (yargs) => {
        yargs.positional('type', {
            desrcibe: 'Choose between keywords or selections',
            choices: ['artists'],
        });
    },
    (argv) => {
        if (argv.type === 'artists') {
            showArtistHistory();
    }

}
);

cli.help().argv;
