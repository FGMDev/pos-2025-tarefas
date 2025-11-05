import './style.css';
import * as api from './src/pokeApi.js';
import * as dom from './src/dom.js';

let allPokemonData = [];

async function handleCardClick(pokemon) {
    try {
        const { evolutionChainData } = await api.fetchPokemonEvolutionDetails(pokemon);
        dom.displayModal(pokemon, evolutionChainData, handleEvolutionClick);
        dom.showModal(true);
    } catch (error) {
        console.error("Erro ao buscar detalhes do Pokémon:", error);
        dom.domElements.modalContent.innerHTML = "<p class='p-6'>Não foi possível carregar os detalhes.</p>";
        dom.showModal(true);
    }
}

function handleEvolutionClick(pokemonName) {
    const newPokemon = allPokemonData.find(p => p.name === pokemonName);
    if (newPokemon) {
        handleCardClick(newPokemon);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPokemon = allPokemonData.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm) ||
        pokemon.id.toString().padStart(3, '0').includes(searchTerm)
    );
    dom.displayPokemon(filteredPokemon, handleCardClick);
}

function handleModalClose(e) {
    if (e.target.id === 'pokemon-modal' || e.target.closest('#close-modal-inner')) {
        dom.showModal(false);
    }
}

async function initializeApp() {
    dom.createInitialShell();

    dom.domElements.searchInput.addEventListener('input', handleSearch);
    dom.domElements.modal.addEventListener('click', handleModalClose);

    try {
        allPokemonData = await api.fetchAllPokemon();
        dom.showLoader(false);
        dom.displayPokemon(allPokemonData, handleCardClick);
    } catch (error) {
        dom.setLoaderMessage(error.message, true);
    }
}

initializeApp();