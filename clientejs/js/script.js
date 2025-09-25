document.addEventListener('DOMContentLoaded', () => {
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

    const pokemonListContainer = document.getElementById('pokemon-list');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('pokemon-modal');
    const closeModalButton = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');
    const loadMoreButton = document.getElementById('load-more');

    const pokemonCache = [];
    const pokemonByName = new Map();
    let allPokemonList = [];
    let nextBatchIndex = 0;
    const BATCH_SIZE = 50;

    const typeGradientColors = {
        normal:  ['#A8A77A', '#C6C6A7'],
        fire:    ['#EE8130', '#FFB86B'],
        water:   ['#6390F0', '#9DC8FF'],
        electric:['#F7D02C', '#FFF59D'],
        grass:   ['#7AC74C', '#B7F5A6'],
        ice:     ['#96D9D6', '#D7F7F7'],
        fighting:['#C22E28', '#F4A19A'],
        poison:  ['#A33EA1', '#D99ED9'],
        ground:  ['#E2BF65', '#F2E2B2'],
        flying:  ['#A98FF3', '#D9CFFF'],
        psychic: ['#F95587', '#FFBBCF'],
        bug:     ['#A6B91A', '#E2EE8A'],
        rock:    ['#B6A136', '#E3D89A'],
        ghost:   ['#735797', '#BDA7E0'],
        dragon:  ['#6F35FC', '#B7A5FF'],
        dark:    ['#705746', '#A8907E'],
        steel:   ['#B7B7CE', '#E6E6F0'],
        fairy:   ['#D685AD', '#F7CFE0']
    };

    const typeColors = {
        fire: 'bg-red-500', water: 'bg-blue-500', grass: 'bg-green-500',
        electric: 'bg-yellow-400', psychic: 'bg-pink-500', ice: 'bg-teal-300',
        dragon: 'bg-indigo-600', dark: 'bg-gray-800', fairy: 'bg-pink-300',
        normal: 'bg-gray-400', fighting: 'bg-orange-700', flying: 'bg-indigo-300',
        poison: 'bg-purple-600', ground: 'bg-yellow-600', rock: 'bg-yellow-700',
        bug: 'bg-lime-500', ghost: 'bg-indigo-800', steel: 'bg-gray-500',
    };

    const hexToRgb = (hex) => {
        const h = hex.replace('#', '');
        return {
            r: parseInt(h.substring(0,2),16),
            g: parseInt(h.substring(2,4),16),
            b: parseInt(h.substring(4,6),16)
        };
    };
    const rgbToHex = (r,g,b) => '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    const averageColor = (c1, c2) => {
        const a = hexToRgb(c1), b = hexToRgb(c2);
        return rgbToHex(Math.round((a.r+b.r)/2), Math.round((a.g+b.g)/2), Math.round((a.b+b.b)/2));
    };
    const luminance = (hex) => {
        const {r,g,b} = hexToRgb(hex);
        const srgb = [r,g,b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
        });
        return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
    };
    const pickTextColorForBg = (c1, c2) => {
        const avg = averageColor(c1,c2);
        const lum = luminance(avg);
        return lum < 0.5 ? 'text-white' : 'text-gray-900';
    };

    const fetchAllPokemonList = async () => {
        try {
            const first = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
            const firstData = await first.json();
            const total = firstData.count || 100000;
            const listResp = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${total}`);
            const listData = await listResp.json();
            allPokemonList = listData.results;
        } catch (err) {
            console.error('Erro ao buscar lista completa:', err);
            loader.textContent = 'Não foi possível obter a lista de Pokémon.';
        }
    };

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

    const loadNextBatch = async () => {
        loader.style.display = '';
        const slice = allPokemonList.slice(nextBatchIndex, nextBatchIndex + BATCH_SIZE);
        if (slice.length === 0) {
            loader.style.display = 'none';
            loadMoreButton.classList.add('hidden');
            return;
        }
        await fetchDetailsForBatch(slice);
        renderPokemonsAppend(slice.length);
        nextBatchIndex += BATCH_SIZE;
        if (nextBatchIndex >= allPokemonList.length) {
            loadMoreButton.classList.add('hidden');
            loader.style.display = 'none';
        } else {
            loadMoreButton.classList.remove('hidden');
            loader.style.display = 'none';
        }
    };

    const renderPokemonsAppend = (recentCount = 0) => {
        pokemonListContainer.innerHTML = '';
        pokemonCache.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            pokemonListContainer.appendChild(card);
        });
    };

    const getGradientForPokemon = (pokemon) => {
        const types = pokemon.types.map(t => t.type.name);
        const primary = types[0];
        const secondary = types[1];

        const primaryColors = typeGradientColors[primary] || ['#777', '#bbb'];
        let color1 = primaryColors[0], color2 = primaryColors[1];

        if (secondary) {
            const secondaryColors = typeGradientColors[secondary] || [color1, color2];
            color2 = secondaryColors[0];
        }

        return { css: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`, color1, color2 };
    };

    const createPokeballSvgString = () => {
        return `
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="6" fill="none"/>
                <path d="M6 50h88" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
                <circle cx="50" cy="50" r="14" stroke="currentColor" stroke-width="6" fill="none"/>
            </svg>
        `;
    };

const createPokemonCard = (pokemon) => {
    const pokemonCard = document.createElement('div');
    // inicial: fundo neutro (mantém classes light/dark), bordas e efeitos
    // importante: overflow-hidden para que a pokeball grande seja cortada nas bordas
    pokemonCard.className = 'relative p-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden bg-white dark:bg-gray-800 border border-transparent';

    // imagem (prioriza sprites animadas)
    const animated = pokemon.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default;
    const pokemonImage = animated || pokemon.sprites?.front_default || '';

    // criamos elementos para poder trocar classes no hover
    const imgWrap = document.createElement('div');
    imgWrap.className = 'w-full h-24 flex items-center justify-center bg-transparent';
    const img = document.createElement('img');
    img.src = pokemonImage;
    img.alt = pokemon.name;
    img.className = 'h-20 object-contain';
    imgWrap.appendChild(img);

    const nameElem = document.createElement('h3');
    // cor padrão: adapta ao tema (dark:text-white)
    nameElem.className = 'text-center mt-2 font-semibold capitalize text-gray-900 dark:text-white';
    nameElem.textContent = pokemon.name;

    const idElem = document.createElement('p');
    idElem.className = 'text-center text-sm text-gray-700 dark:text-gray-300 opacity-80';
    idElem.textContent = `#${String(pokemon.id).padStart(3, '0')}`;

    // pokeball wrapper (posicionado bottom-right). pointer-events none para não bloquear clique.
    const pokeballWrapper = document.createElement('div');
    pokeballWrapper.className = 'absolute';
    // tamanho maior para "sair" do canto; valores negativos para que seja parcialmente cortada
    pokeballWrapper.style.width = '88px';
    pokeballWrapper.style.height = '88px';
    // posicionamento propositalmente negativo — o overflow-hidden do card faz o recorte
    pokeballWrapper.style.bottom = '-22px';
    pokeballWrapper.style.right = '-22px';
    pokeballWrapper.style.opacity = '0.12';
    pokeballWrapper.style.pointerEvents = 'none';
    // leve rotação para dar dinamismo
    pokeballWrapper.style.transform = 'rotate(-12deg)';
    // cor padrão sutil (vai usar currentColor inside svg)
    pokeballWrapper.style.color = (document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
    pokeballWrapper.innerHTML = createPokeballSvgString();

    // adiciona conteúdo
    pokemonCard.appendChild(imgWrap);
    pokemonCard.appendChild(nameElem);
    pokemonCard.appendChild(idElem);
    pokemonCard.appendChild(pokeballWrapper);

    // hover: aplicar degradê + ajuste de cor do texto e pokeball
    let hoverGrad = null;
    pokemonCard.addEventListener('mouseenter', () => {
        hoverGrad = getGradientForPokemon(pokemon);
        pokemonCard.style.background = hoverGrad.css;
        pokemonCard.style.border = '1px solid rgba(0,0,0,0.06)';
        pokemonCard.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
        // escolhe cor do texto com base no degradê
        const textColorClass = pickTextColorForBg(hoverGrad.color1, hoverGrad.color2);
        // aplica diretamente as classes (substitui classes de texto padrão)
        nameElem.className = `text-center mt-2 font-semibold capitalize ${textColorClass}`;
        idElem.className = `text-center text-sm ${textColorClass} opacity-80`;

        // ajusta cor da pokeball para combinar: se texto branco -> pokeball clara, senão escura sutil
        if (textColorClass === 'text-white') {
            pokeballWrapper.style.color = 'rgba(255,255,255,0.18)';
        } else {
            pokeballWrapper.style.color = 'rgba(0,0,0,0.06)';
        }

        // leve escurecimento no hover para "dar contraste"
        pokemonCard.style.filter = 'brightness(0.98)';
    });

    pokemonCard.addEventListener('mouseleave', () => {
        // restaura fundo neutro (claro/escuro pelo tailwind classes)
        pokemonCard.style.background = '';
        pokemonCard.style.border = '1px solid rgba(0,0,0,0.04)';
        pokemonCard.style.boxShadow = '0 8px 18px rgba(0,0,0,0.06)';
        pokemonCard.style.filter = '';
        // restaura classes originais que respeitam o tema
        nameElem.className = 'text-center mt-2 font-semibold capitalize text-gray-900 dark:text-white';
        idElem.className = 'text-center text-sm text-gray-700 dark:text-gray-300 opacity-80';
        // restaura pokeball para cor padrão
        pokeballWrapper.style.color = (document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
    });

    pokemonCard.addEventListener('click', () => displayPokemonDetails(pokemon));
    return pokemonCard;
};


    // exibição detalhada em modal
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

    // busca
    searchInput.addEventListener('input', async (event) => {
        const term = event.target.value.trim().toLowerCase();
        if (term === '') {
            renderPokemonsAppend();
            return;
        }

        const matches = allPokemonList.filter(p => p.name.includes(term));
        if (matches.length === 0) {
            pokemonListContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum Pokémon encontrado.</p>`;
            return;
        }

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
            const fetched = await fetchDetailsForBatch(toFetch.slice(0, 50));
            resultsToShow.push(...fetched);
        }

        pokemonListContainer.innerHTML = '';
        resultsToShow.forEach(p => {
            const card = createPokemonCard(p);
            pokemonListContainer.appendChild(card);
        });
    });

    loadMoreButton.addEventListener('click', loadNextBatch);

    const init = async () => {
        loader.style.display = '';
        await fetchAllPokemonList();
        await loadNextBatch();
        if (nextBatchIndex < allPokemonList.length) {
            loadMoreButton.classList.remove('hidden');
        } else {
            loadMoreButton.classList.add('hidden');
        }
        loader.style.display = 'none';
    };

    init();
});
