const https = require('https')

interface Character {
    id: number
    name: string
    status: string
    species: string
    type: string
    gender: string
    origin: any
    location: any
    image: string
    episodes: string[]
    url: string
}

interface Episode {
    id: number
    name: string
    air_date: string
    episode: string
    characters: any
    url: string
    created: Date
}

class XHttpClient {
    public static get(url:string, callbackFn: Function): void {
        let data = ''

        https.get(url, res => {
            res.on('data', chunk => {
                data += chunk
            })

            res.on('end', () => {
                try {
                    callbackFn(JSON.parse(data));
                } catch(err) {
                    callbackFn({
                        error: err
                    });
                }
            })
        }).on('error', err => {
            console.error(err)
        })
    }
}

export class RickAndMortyAPI {
    private static fetchAllEpisodes(callbackFn: Function): void {
        XHttpClient.get('https://rickandmortyapi.com/api/episode', (response: any) => {
            callbackFn(response);
        });
    }

    private static fetchCharacter(url: string, callbackFn: Function): void {
        XHttpClient.get(url, (response: Character) => {
            callbackFn(response);
        });
    }

    public static getAllEpisodesWithCharacterObject(): any {
        return new Promise<Episode[]>(resolve => {
            this.fetchAllEpisodes((resp: any) => {
                const episodes: Episode[] = resp.results;
                const characterPromises: Promise<Character>[] = [];
                
                for (let epIndex = 0; epIndex < episodes.length; epIndex++) {
                    const ep: Episode = episodes[epIndex]

                    for (let charIndex = 0; charIndex < ep.characters.length; charIndex++) {
                        const characterUrl: string = ep.characters[charIndex]
                       
                        const promise: Promise<Character> = new Promise(resolve => {
                            this.fetchCharacter(characterUrl, (characterObject: Character) => {
                                ep.characters[charIndex] = characterObject
                                resolve(characterObject)
                            })
                        });
                        
                        characterPromises.push(promise)
                    };


                    Promise.all(characterPromises).then(() => {
                        if (epIndex === episodes.length - 1) {
                            resolve(episodes);
                        }
                    })
                }
            })
        })
    }
}

(() => {
    RickAndMortyAPI.getAllEpisodesWithCharacterObject().then((detailedEpisodes) => {
        console.log(detailedEpisodes);
    });
})()