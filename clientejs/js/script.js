document.addEventListener('DOMContentLoaded', () => {
    // Tema (preserva seu comportamento)
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const sunIcon = document.getElementById('theme-toggle-sun-icon');
    const moonIcon = document.getElementById('theme-toggle-moon-icon');

    const updateThemeUI = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        sunIcon.classList.toggle('hidden', !isDarkMode);
        moonIcon.classList.toggle('hidden', isDarkMode);
    };

    const currentTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (currentTheme === 'dark' || (!currentTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    }
    updateThemeUI();
    themeToggleButton.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDarkMode = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeUI();
    });

    // --- Pokedex logic melhorado para "todas as gerações" ---
    const pokemonListContainer = document.getElementById('pokemon-list');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('pokemon-modal');
    const closeModalButton = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');
    const loadMoreButton = document.getElementById('load-more');

    // caches/estruturas
    const pokemonCache = []; // array com objetos detalhados já carregados
    const pokemonByName = new Map(); // map name -> detailed object
    let allPokemonList = []; // lista completa (nome + url), obtida da api
    let nextBatchIndex = 0;
    const BATCH_SIZE = 50; // ajuste conforme desejar (50 é razoável)

    const typeColors = {
        fire: 'bg-red-500', water: 'bg-blue-500', grass: 'bg-green-500',
        electric: 'bg-yellow-400', psychic: 'bg-pink-500', ice: 'bg-teal-300',
        dragon: 'bg-indigo-600', dark: 'bg-gray-800', fairy: 'bg-pink-300',
        normal: 'bg-gray-400', fighting: 'bg-orange-700', flying: 'bg-indigo-300',
        poison: 'bg-purple-600', ground: 'bg-yellow-600', rock: 'bg-yellow-700',
        bug: 'bg-lime-500', ghost: 'bg-indigo-800', steel: 'bg-gray-500',
    };

    // pega a lista completa (apenas nomes + urls) e configura a paginação em batches
    const fetchAllPokemonList = async () => {
        try {
            // primeiro pega o "count" para garantir pegar todos sem hardcode
            const first = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
            const firstData = await first.json();
            const total = firstData.count || 100000;
            const listResp = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${total}`);
            const listData = await listResp.json();
            allPokemonList = listData.results; // cada item tem {name, url}
        } catch (err) {
            console.error('Erro ao buscar lista completa:', err);
            loader.textContent = 'Não foi possível obter a lista de Pokémon.';
        }
    };

    // busca detalhes para uma lista de items {name, url}
    const fetchDetailsForBatch = async (items) => {
        try {
            const promises = items.map(it => fetch(it.url).then(r => r.json()));
            const details = await Promise.all(promises);
            details.forEach(p => {
                pokemonCache.push(p);
                pokemonByName.set(p.name, p);
            });
            return details;
        } catch (err) {
            console.error('Erro ao buscar detalhes do batch:', err);
            return [];
        }
    };

    // carrega o próximo batch (usado pelo botão "carregar mais")
    const loadNextBatch = async () => {
        loader.style.display = ''; // mostra loader enquanto carrega
        const slice = allPokemonList.slice(nextBatchIndex, nextBatchIndex + BATCH_SIZE);
        if (slice.length === 0) {
            loader.style.display = 'none';
            loadMoreButton.classList.add('hidden');
            return;
        }
        await fetchDetailsForBatch(slice);
        renderPokemonsAppend(slice.length); // renderiza os já carregados (apêndice)
        nextBatchIndex += BATCH_SIZE;
        if (nextBatchIndex >= allPokemonList.length) {
            loadMoreButton.classList.add('hidden');
            loader.style.display = 'none';
        } else {
            loadMoreButton.classList.remove('hidden');
            loader.style.display = 'none';
        }
    };

    // exibe cards — modo append (não limpa) usado quando carregamos batches
    const renderPokemonsAppend = (recentCount = 0) => {
        // assumimos pokemonCache contém todos os detalhes carregados (append order)
        // exibimos todos os já carregados (ou somente os últimos N se preferir)
        // aqui vamos limpar e re-renderizar todos os já baixados para simplicidade
        pokemonListContainer.innerHTML = '';
        pokemonCache.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            pokemonListContainer.appendChild(card);
        });
    };

    const createPokemonCard = (pokemon) => {
        const pokemonCard = document.createElement('div');
        pokemonCard.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer';
        const animated = pokemon.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default;
        const pokemonImage = animated || pokemon.sprites?.front_default || '';
        pokemonCard.innerHTML = `
            <img src="${pokemonImage}" alt="${pokemon.name}" class="w-full h-24 object-contain">
            <h3 class="text-center mt-2 font-semibold capitalize">${pokemon.name}</h3>
            <p class="text-center text-sm text-gray-500 dark:text-gray-400">#${String(pokemon.id).padStart(3, '0')}</p>
        `;
        pokemonCard.addEventListener('click', () => displayPokemonDetails(pokemon));
        return pokemonCard;
    };

    // exibição detalhada em modal (usa optional chaining)
    const displayPokemonDetails = (pokemon) => {
        const mainImageUrl = pokemon.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default
            || pokemon.sprites?.front_default || '';
        document.getElementById('modal-pokemon-image').src = mainImageUrl;
        document.getElementById('modal-pokemon-name').textContent = pokemon.name;
        document.getElementById('modal-pokemon-id').textContent = `#${String(pokemon.id).padStart(3, '0')}`;
        document.getElementById('modal-pokemon-height').textContent = `${pokemon.height / 10} m`;
        document.getElementById('modal-pokemon-weight').textContent = `${pokemon.weight / 10} kg`;

        const typesContainer = document.getElementById('modal-pokemon-types');
        typesContainer.innerHTML = '';
        pokemon.types.forEach(typeInfo => {
            const typeName = typeInfo.type.name;
            const colorClass = typeColors[typeName] || 'bg-gray-500';
            const typeChip = document.createElement('span');
            typeChip.className = `px-3 py-1 text-white rounded-full text-sm ${colorClass}`;
            typeChip.textContent = typeName;
            typesContainer.appendChild(typeChip);
        });

        const statsContainer = document.getElementById('modal-pokemon-stats');
        statsContainer.innerHTML = '';
        pokemon.stats.forEach(statInfo => {
            const statElement = document.createElement('div');
            statElement.className = 'flex items-center';
            statElement.innerHTML = `
                <span class="w-1/3 capitalize font-semibold">${statInfo.stat.name.replace('-', ' ')}</span>
                <div class="w-2/3 bg-gray-200 dark:bg-gray-600 rounded-full h-4 mx-2">
                    <div class="bg-blue-500 h-4 rounded-full" style="width: ${Math.min(statInfo.base_stat, 100)}%;"></div>
                </div>
                <span class="w-12 text-right">${statInfo.base_stat}</span>
            `;
            statsContainer.appendChild(statElement);
        });

        const variationsContainer = document.getElementById('modal-pokemon-variations');
        variationsContainer.innerHTML = '';
        const animatedSprites = pokemon.sprites?.versions?.['generation-v']?.['black-white']?.animated || {};
        const variations = {
            'Normal': animatedSprites.front_default, 'Shiny': animatedSprites.front_shiny,
            'Feminino': animatedSprites.front_female, 'Shiny Feminino': animatedSprites.front_shiny_female
        };
        for (const [name, url] of Object.entries(variations)) {
            if (url) {
                const variationDiv = document.createElement('div');
                variationDiv.className = 'text-center';
                variationDiv.innerHTML = `<img src="${url}" alt="${name}" class="h-16 w-16 mx-auto"><p class="text-xs mt-1">${name}</p>`;
                variationsContainer.appendChild(variationDiv);
            }
        }
        modal.classList.remove('hidden');
    };

    closeModalButton.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.add('hidden'); });

    // busca (procura entre todos os nomes; se achar nomes sem detalhes já carregados, busca-os on-demand)
    searchInput.addEventListener('input', async (event) => {
        const term = event.target.value.trim().toLowerCase();
        if (term === '') {
            // mostra o que já foi carregado
            renderPokemonsAppend();
            return;
        }

        // procura nomes na lista completa
        const matches = allPokemonList.filter(p => p.name.includes(term));
        if (matches.length === 0) {
            pokemonListContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum Pokémon encontrado.</p>`;
            return;
        }

        // verificamos quais matches ainda não temos detalhes e buscamos apenas esses (limitado a, por ex., 100 resultados)
        const toFetch = [];
        const resultsToShow = [];
        for (let i = 0; i < matches.length && resultsToShow.length < 100; i++) {
            const m = matches[i];
            const cached = pokemonByName.get(m.name);
            if (cached) {
                resultsToShow.push(cached);
            } else {
                toFetch.push(m);
            }
        }

        if (toFetch.length > 0) {
            // busca detalhes (em um lote controlado)
            const fetched = await fetchDetailsForBatch(toFetch.slice(0, 50)); // protege de buscas enormes
            resultsToShow.push(...fetched);
        }

        // renderiza apenas os resultados encontrados/baixados
        pokemonListContainer.innerHTML = '';
        resultsToShow.forEach(p => {
            const card = createPokemonCard(p);
            pokemonListContainer.appendChild(card);
        });
    });

    // botão "carregar mais"
    loadMoreButton.addEventListener('click', loadNextBatch);

    // sequência de inicialização
    const init = async () => {
        loader.style.display = ''; // visível
        await fetchAllPokemonList(); // pega full list (nomes+urls)
        // carrega primeiro batch
        await loadNextBatch();
        // se existir mais, mostra botão
        if (nextBatchIndex < allPokemonList.length) {
            loadMoreButton.classList.remove('hidden');
        } else {
            loadMoreButton.classList.add('hidden');
        }
        loader.style.display = 'none';
    };

    init();
});
