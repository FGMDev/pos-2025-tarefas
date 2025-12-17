import { POKEMON_COUNT } from './utils.js';

export const fetchAllPokemon = async () => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_COUNT}`);
        const data = await response.json();
        const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
        
        const allPokemonData = await Promise.all(pokemonPromises);
        allPokemonData.sort((a, b) => a.id - b.id);
        return allPokemonData;
    } catch (error) {
        console.error("Falha ao buscar dados dos Pokémon:", error);
        throw new Error("Erro ao carregar os dados. Tente recarregar a página.");
    }
};

export const fetchPokemonEvolutionDetails = async (pokemon) => {
    try {
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();
        const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionChainData = await evolutionChainResponse.json();
        return { speciesData, evolutionChainData };
    } catch (error) {
        console.error("Erro ao buscar detalhes da evolução:", error);
        throw new Error("Não foi possível carregar os detalhes da evolução.");
    }
};
