import React, { useState, useEffect } from 'react';
import * as api from './pokeApi.js';
import { PokemonCard, PokemonModal } from './components.jsx';

function App() {
    const [allPokemonData, setAllPokemonData] = useState([]);
    const [filteredPokemon, setFilteredPokemon] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [evolutionChain, setEvolutionChain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            const pokemonData = await api.fetchAllPokemon();
            setAllPokemonData(pokemonData);
            setFilteredPokemon(pokemonData);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCardClick = async (pokemon) => {
        try {
            const { evolutionChainData } = await api.fetchPokemonEvolutionDetails(pokemon);
            setSelectedPokemon(pokemon);
            setEvolutionChain(evolutionChainData);
            setShowModal(true);
        } catch (err) {
            console.error("Erro ao buscar detalhes do Pokémon:", err);
            setError("Não foi possível carregar os detalhes.");
        }
    };

    const handleEvolutionClick = (pokemonName) => {
        const newPokemon = allPokemonData.find(p => p.name === pokemonName);
        if (newPokemon) {
            handleCardClick(newPokemon);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = allPokemonData.filter(pokemon =>
            pokemon.name.toLowerCase().includes(term) ||
            pokemon.id.toString().padStart(3, '0').includes(term)
        );
        setFilteredPokemon(filtered);
    };

    return (
        <>
            <header className="bg-gradient-to-br from-red-600 to-red-800 shadow-lg border-b-4 border-black/20 sticky top-0 z-50 w-full">
                <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball" className="h-10 w-10" />
                        <h1 className="text-3xl font-black text-white tracking-wider text-shadow" style={{ fontWeight: 900 }}>PokéDex</h1>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Pesquise..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="px-5 py-2 rounded-full bg-red-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75 transition-all w-72"
                        />
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4">
                {loading ? (
                    <div className="text-center py-10">
                        <p className="text-xl font-semibold text-gray-700">Carregando Pokémon...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <p className="text-xl font-semibold text-red-500">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredPokemon.map(pokemon => (
                            <PokemonCard key={pokemon.id} pokemon={pokemon} onCardClick={handleCardClick} />
                        ))}
                    </div>
                )}
            </main>

            {showModal && selectedPokemon && evolutionChain && (
                <PokemonModal
                    pokemon={selectedPokemon}
                    evolutionChain={evolutionChain}
                    onEvolutionClick={handleEvolutionClick}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

export default App;
