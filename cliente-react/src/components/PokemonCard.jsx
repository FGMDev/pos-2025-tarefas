export default function PokemonCard({ pokemon, onClick }) {
return (
<div
onClick={onClick}
className="cursor-pointer bg-white rounded-xl shadow p-4 text-center hover:scale-105 transition"
>
<img src={pokemon.image} alt={pokemon.name} className="mx-auto" />
<h3 className="capitalize font-bold mt-2">{pokemon.name}</h3>
</div>
)
}