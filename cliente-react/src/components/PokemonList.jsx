import PokemonCard from './PokemonCard'


export default function PokemonList({ pokemon, onSelect }) {
return (
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{pokemon.map(p => (
<PokemonCard key={p.id} pokemon={p} onClick={() => onSelect(p)} />
))}
</div>
)
}