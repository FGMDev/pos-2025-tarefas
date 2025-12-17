import { useEffect, useState } from 'react'
import * as api from './api/pokeApi'
import PokemonList from './components/PokemonList.jsx'
import PokemonModal from './components/PokemonModal'


export default function App() {
const [pokemon, setPokemon] = useState([])
const [selected, setSelected] = useState(null)


useEffect(() => {
api.fetchAllPokemon().then(setPokemon)
}, [])


return (
<div className="p-6">
<PokemonList pokemon={pokemon} onSelect={setSelected} />
{selected && (
<PokemonModal pokemon={selected} onClose={() => setSelected(null)} />
)}
</div>
)
}