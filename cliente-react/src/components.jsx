import React, { useState, useEffect } from 'react';
import { getTypeColor, adjustColor, statNameMapping, getPokemonIdFromUrl } from './utils.js';

export const PokemonCard = ({ pokemon, onCardClick }) => {
    const primaryType = pokemon.types[0].type.name;
    const cardColor = getTypeColor(primaryType);
    const pokemonSprite = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default || pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

    const typesHtml = pokemon.types.map(typeInfo =>
        `<span class="text-xs font-semibold text-white px-2 py-1 rounded-full shadow-md" style="background-color: rgba(255, 255, 255, 0.2);">${typeInfo.type.name}</span>`
    ).join(' ');

    return (
        <div
            onClick={() => onCardClick(pokemon)}
            className="relative rounded-xl shadow-lg p-4 flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-white overflow-hidden h-48"
            style={{
                background: `linear-gradient(135deg, ${adjustColor(cardColor, 20)}, ${adjustColor(cardColor, -20)})`
            }}
        >
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" className="absolute -bottom-4 -right-4 w-28 h-28 opacity-10 rotate-12" alt="Pokeball watermark" />
            <span className="absolute top-2 right-3 font-bold text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>#{pokemon.id.toString().padStart(3, '0')}</span>
            <img src={pokemonSprite} alt={pokemon.name} className="w-20 h-20 z-10" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))' }} />
            <h2 className="text-xl font-bold capitalize mt-2 z-10 text-shadow-sm text-center">{pokemon.name}</h2>
            <div className="flex gap-2 mt-2 z-10">
                {pokemon.types.map((typeInfo, idx) => (
                    <span key={idx} className="text-xs font-semibold text-white px-2 py-1 rounded-full shadow-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        {typeInfo.type.name}
                    </span>
                ))}
            </div>
        </div>
    );
};

const parseEvolutionChain = (chain, onEvolutionClick) => {
    return (
        <>
            <div className="flex flex-col items-center text-center p-2">
                <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonIdFromUrl(chain.species.url)}.png`}
                    className="w-24 h-24 mx-auto hover:scale-110 transition-transform cursor-pointer"
                    alt={chain.species.name}
                    onClick={() => onEvolutionClick(chain.species.name)}
                    style={{ cursor: 'pointer' }}
                />
                <p className="capitalize font-semibold mt-1">{chain.species.name}</p>
            </div>
            {chain.evolves_to.length > 0 && (
                <>
                    <div className="flex items-center justify-center text-gray-400 text-2xl font-light self-center mx-2">&gt;</div>
                    {chain.evolves_to.length > 1 ? (
                        <div className="flex flex-col gap-4">
                            {chain.evolves_to.map((evolution, idx) => (
                                <React.Fragment key={idx}>
                                    {parseEvolutionChain(evolution, onEvolutionClick)}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        parseEvolutionChain(chain.evolves_to[0], onEvolutionClick)
                    )}
                </>
            )}
        </>
    );
};

export const PokemonModal = ({ pokemon, evolutionChain, onEvolutionClick, onClose }) => {
    const primaryType = pokemon.types[0].type.name;
    const modalColor = getTypeColor(primaryType);

    const statsHtml = pokemon.stats.map(stat => {
        const statName = statNameMapping[stat.stat.name] || stat.stat.name.replace('-', ' ');
        const statPercentage = (stat.base_stat / 255) * 100;
        return (
            <div key={stat.stat.name} className="grid grid-cols-12 items-center gap-2 text-sm">
                <span className="col-span-4 font-semibold text-gray-500">{statName}</span>
                <span className="col-span-2 font-bold text-gray-800 text-right">{stat.base_stat}</span>
                <div className="col-span-6 bg-gray-200 rounded-full h-2">
                    <div
                        className="h-2 rounded-full"
                        style={{ width: `${statPercentage}%`, backgroundColor: modalColor }}
                    ></div>
                </div>
            </div>
        );
    });

    return (
        <div
            id="pokemon-modal"
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4"
        >
            <div
                id="modal-content"
                className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-lg max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="relative p-6 rounded-t-2xl text-white"
                    style={{ background: `linear-gradient(135deg, ${adjustColor(modalColor, 20)}, ${adjustColor(modalColor, -20)})` }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition-colors z-20"
                    >
                        <span className="text-2xl font-bold">&times;</span>
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-shrink-0">
                            <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} className="w-32 h-32 sm:w-40 sm:h-40" style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.4))' }} />
                        </div>
                        <div className="text-center sm:text-left z-10">
                            <p className="font-bold text-lg opacity-80">#{pokemon.id.toString().padStart(3, '0')}</p>
                            <h2 className="text-4xl font-black capitalize text-shadow">{pokemon.name}</h2>
                            <div className="flex justify-center sm:justify-start gap-2 mt-3">
                                {pokemon.types.map((typeInfo, idx) => (
                                    <span key={idx} className="px-3 py-1 text-sm font-semibold text-white rounded-full shadow-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                        {typeInfo.type.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-b-2xl">
                    <div>
                        <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Estatísticas</h3>
                        <div className="space-y-3">{statsHtml}</div>
                    </div>
                    <div className="mt-6">
                        <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Evoluções</h3>
                        <div className="flex justify-around items-center gap-2 flex-wrap">
                            {parseEvolutionChain(evolutionChain.chain, onEvolutionClick)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
