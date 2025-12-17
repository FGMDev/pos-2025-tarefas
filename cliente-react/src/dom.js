import { getTypeColor, adjustColor, statNameMapping, getPokemonIdFromUrl } from './utils.js';

export const domElements = {};

export const createInitialShell = () => {
    document.body.innerHTML = `
        <header class="bg-gradient-to-br from-red-600 to-red-800 shadow-lg border-b-4 border-black/20 sticky top-0 z-50 w-full">
            <div class="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="flex items-center space-x-4">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball" class="h-10 w-10">
                    <h1 class="text-3xl font-black text-white tracking-wider text-shadow" style="font-weight: 900;">PokéDex</h1>
                </div>
                <div class="relative">
                    <input 
                        id="searchInput"
                        type="text" 
                        placeholder="Pesquise..."
                        class="px-5 py-2 rounded-full bg-red-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75 transition-all w-72"
                    >
                </div>
            </div>
        </header>

        <main class="container mx-auto p-4">
            <div id="pokedex-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            </div>
            <div id="loader" class="text-center py-10">
                <p class="text-xl font-semibold text-gray-700">Carregando Pokémon...</p>
            </div>
        </main>
        
        <div id="pokemon-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden z-[100] p-4">
            <div id="modal-content" class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-lg max-h-[90vh] overflow-y-auto relative">
            </div>
        </div>
    `;

    domElements.pokedexGrid = document.getElementById('pokedex-grid');
    domElements.searchInput = document.getElementById('searchInput');
    domElements.loader = document.getElementById('loader');
    domElements.modal = document.getElementById('pokemon-modal');
    domElements.modalContent = document.getElementById('modal-content');
};

export const displayPokemon = (pokemonList, onCardClick) => {
    if (!domElements.pokedexGrid) return;
    
    domElements.pokedexGrid.innerHTML = '';
    
    pokemonList.forEach(pokemon => {
        const primaryType = pokemon.types[0].type.name;
        const cardColor = getTypeColor(primaryType);
        const pokemonSprite = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default || pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

        const typesHtml = pokemon.types.map(typeInfo =>
            `<span class="text-xs font-semibold text-white px-2 py-1 rounded-full shadow-md" style="background-color: rgba(255, 255, 255, 0.2);">${typeInfo.type.name}</span>`
        ).join(' ');
        
        const card = document.createElement('div');
        card.className = 'relative rounded-xl shadow-lg p-4 flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-white overflow-hidden h-48';
        card.style.background = `linear-gradient(135deg, ${adjustColor(cardColor, 20)}, ${adjustColor(cardColor, -20)})`;

        card.innerHTML = `
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" class="absolute -bottom-4 -right-4 w-28 h-28 opacity-10 rotate-12" alt="Pokeball watermark">
            <span class="absolute top-2 right-3 font-bold text-lg" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">#${pokemon.id.toString().padStart(3, '0')}</span>
            <img src="${pokemonSprite}" alt="${pokemon.name}" class="w-20 h-20 z-10" style="filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.4));">
            <h2 class="text-xl font-bold capitalize mt-2 z-10 text-shadow-sm text-center">${pokemon.name}</h2>
            <div class="flex gap-2 mt-2 z-10">
                ${typesHtml}
            </div>
        `;
        
        card.addEventListener('click', () => onCardClick(pokemon));
        domElements.pokedexGrid.appendChild(card);
    });
};

export const displayModal = (pokemon, evolutionChain, onEvolutionClick) => {
    const primaryType = pokemon.types[0].type.name;
    const modalColor = getTypeColor(primaryType);

    const typesHtml = pokemon.types.map(typeInfo => 
        `<span class="px-3 py-1 text-sm font-semibold text-white rounded-full shadow-md" style="background-color: rgba(255, 255, 255, 0.2);">${typeInfo.type.name}</span>`
    ).join(' ');

    const statsHtml = pokemon.stats.map(stat => {
        const statName = statNameMapping[stat.stat.name] || stat.stat.name.replace('-', ' ');
        const statPercentage = (stat.base_stat / 255) * 100; 
        
        return `
        <div class="grid grid-cols-12 items-center gap-2 text-sm">
            <span class="col-span-4 font-semibold text-gray-500">${statName}</span>
            <span class="col-span-2 font-bold text-gray-800 text-right">${stat.base_stat}</span>
            <div class="col-span-6 bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full" style="width: ${statPercentage}%; background-color: ${modalColor};"></div>
            </div>
        </div>
        `
    }).join('');

    const evolutionHtml = parseEvolutionChain(evolutionChain.chain);

    domElements.modalContent.innerHTML = `
        <div class="relative p-6 rounded-t-2xl text-white" style="background: linear-gradient(135deg, ${adjustColor(modalColor, 20)}, ${adjustColor(modalColor, -20)})">
            <button id="close-modal-inner" class="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition-colors z-20">
                <span class="text-2xl font-bold">&times;</span>
            </button>
            <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="relative flex-shrink-0">
                     <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="w-32 h-32 sm:w-40 sm:h-40" style="filter: drop-shadow(2px 4px 8px rgba(0,0,0,0.4));">
                </div>
                <div class="text-center sm:text-left z-10">
                    <p class="font-bold text-lg opacity-80">#${pokemon.id.toString().padStart(3, '0')}</p>
                    <h2 class="text-4xl font-black capitalize text-shadow">${pokemon.name}</h2>
                    <div class="flex justify-center sm:justify-start gap-2 mt-3">${typesHtml}</div>
                </div>
            </div>
        </div>
        <div class="p-6 bg-white rounded-b-2xl">
            <div>
                <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Estatísticas</h3>
                <div class="space-y-3">${statsHtml}</div>
            </div>
            <div class="mt-6">
                 <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Evoluções</h3>
                 <div class="flex justify-around items-center gap-2 flex-wrap">${evolutionHtml}</div>
            </div>
        </div>
    `;
    
    domElements.modalContent.querySelectorAll('.evolution-pokemon').forEach(img => {
        img.addEventListener('click', (e) => {
            onEvolutionClick(e.currentTarget.dataset.pokemonName);
        });
    });
};

const parseEvolutionChain = (chain) => {
    let html = `
        <div class="flex flex-col items-center text-center p-2">
            <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonIdFromUrl(chain.species.url)}.png" 
                class="w-24 h-24 mx-auto hover:scale-110 transition-transform cursor-pointer evolution-pokemon"
                alt="${chain.species.name}"
                data-pokemon-name="${chain.species.name}"
            >
            <p class="capitalize font-semibold mt-1">${chain.species.name}</p>
        </div>
    `;

    if (chain.evolves_to.length > 0) {
        html += `<div class="flex items-center justify-center text-gray-400 text-2xl font-light self-center mx-2">&gt;</div>`;
        if (chain.evolves_to.length > 1) {
            html += '<div class="flex flex-col gap-4">';
            chain.evolves_to.forEach(evolution => {
                html += parseEvolutionChain(evolution);
            });
            html += '</div>';
        } else {
             html += parseEvolutionChain(chain.evolves_to[0]);
        }
    }
    return html;
};

export const showLoader = (show = true) => {
    if (domElements.loader) {
        domElements.loader.style.display = show ? 'block' : 'none';
    }
};

export const showModal = (show = true) => {
    if (domElements.modal) {
        if (show) {
            domElements.modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            domElements.modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
};

export const setLoaderMessage = (message, isError = false) => {
    if (domElements.loader) {
        domElements.loader.innerHTML = `<p class="${isError ? 'text-red-500' : 'text-gray-700'} text-xl font-semibold">${message}</p>`;
    }
};