export const POKEMON_COUNT = 151;

export const statNameMapping = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed'
};

export const getTypeColor = (type) => {
    const colors = {
        fire: '#F08030', grass: '#78C850', water: '#6890F0', bug: '#A8B820',
        normal: '#A8A878', poison: '#A040A0', electric: '#F8D030', ground: '#E0C068',
        fairy: '#EE99AC', fighting: '#C03028', psychic: '#F85888', rock: '#B8A038',
        ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8', steel: '#B8B8D0', dark: '#705848', flying: '#A890F0'
    };
    return colors[type] || '#68A090';
};

export const adjustColor = (hex, amount) => {
    return '#' + hex.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
};

export const getPokemonIdFromUrl = (url) => url.split('/').filter(Boolean).pop();
