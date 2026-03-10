import { useEffect, useState } from 'react';
import { recipesApi } from '../api/recipes';
import { pantryStaplesApi } from '../api/pantryStaples';
import type { RecipeSearch, PantryStaple } from '../types';
import { ExternalLink, ChefHat, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

/* ── Recipe suggestion map for common ingredients ── */
const RECIPE_CARDS: Record<string, { title: string; emoji: string; desc: string; query: string }> = {
  chicken: { title: 'Chicken Stir Fry',  emoji: '🍗', desc: 'Quick 15-min weeknight dinner with veggies.',    query: 'chicken stir fry easy recipe' },
  milk:    { title: 'Creamy White Sauce', emoji: '🥛', desc: 'Classic béchamel for pasta or gratins.',         query: 'bechamel white sauce pasta recipe' },
  eggs:    { title: 'Spanish Omelette',   emoji: '🍳', desc: 'Hearty egg dish — breakfast, lunch, or dinner.', query: 'spanish omelette tortilla recipe' },
  beef:    { title: 'Beef Stew',          emoji: '🥩', desc: 'Slow-cooked one-pot comfort food.',              query: 'easy beef stew recipe' },
  salmon:  { title: 'Baked Salmon',       emoji: '🐟', desc: 'Healthy omega-3 rich 20-minute dinner.',         query: 'baked lemon salmon recipe' },
  tomato:  { title: 'Fresh Tomato Soup',  emoji: '🍅', desc: 'Blended from scratch in 30 minutes.',            query: 'fresh tomato soup recipe' },
  banana:  { title: 'Banana Bread',       emoji: '🍌', desc: 'Perfect use for overripe bananas.',              query: 'easy banana bread recipe' },
  potato:  { title: 'Roasted Potatoes',   emoji: '🥔', desc: 'Crispy oven-baked wedges with herbs.',           query: 'crispy roasted potatoes recipe' },
  spinach: { title: 'Spanakopita',        emoji: '🥬', desc: 'Greek spinach and feta filo pie.',               query: 'spanakopita spinach pie recipe' },
  rice:    { title: 'Egg Fried Rice',     emoji: '🍚', desc: 'Use leftover rice for a quick wok dinner.',      query: 'egg fried rice recipe' },
  pasta:   { title: 'Aglio e Olio',       emoji: '🍝', desc: 'Simple garlic and olive oil pasta classic.',     query: 'pasta aglio olio recipe' },
  pork:    { title: 'Pork Stir Fry',      emoji: '🥓', desc: 'Fast pork and vegetable stir fry.',              query: 'pork stir fry recipe' },
  apple:   { title: 'Apple Crumble',      emoji: '🍎', desc: 'Warm baked dessert with oat topping.',           query: 'easy apple crumble recipe' },
  carrot:  { title: 'Carrot Soup',        emoji: '🥕', desc: 'Smooth and warming blended carrot soup.',        query: 'creamy carrot soup recipe' },
  onion:   { title: 'French Onion Soup',  emoji: '🧅', desc: 'Caramelised onions with gruyère crouton.',       query: 'french onion soup recipe' },
};

function getSuggestions(urgentIngredients: string[]) {
  const seen = new Set<string>();
  const results: (typeof RECIPE_CARDS)[string][] = [];
  for (const ing of urgentIngredients) {
    const key = Object.keys(RECIPE_CARDS).find(k =>
      ing.toLowerCase().includes(k) || k.includes(ing.toLowerCase().split(' ')[0])
    );
    if (key && !seen.has(key)) {
      seen.add(key);
      results.push(RECIPE_CARDS[key]);
      if (results.length === 3) break;
    }
  }
  return results;
}

export default function Recipes() {
  const [search, setSearch] = useState<RecipeSearch | null>(null);
  const [staples, setStaples] = useState<PantryStaple[]>([]);
  const [includePantry, setIncludePantry] = useState(true);
  const [newStaple, setNewStaple] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSearch = async (withPantry: boolean) => {
    const data = await recipesApi.getUrgentSearch(withPantry);
    setSearch(data);
  };

  const loadStaples = async () => {
    const data = await pantryStaplesApi.getAll();
    setStaples(data);
  };

  useEffect(() => {
    Promise.all([loadSearch(includePantry), loadStaples()])
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePantry = async (val: boolean) => {
    setIncludePantry(val);
    await loadSearch(val);
  };

  const handleToggleStaple = async (id: number) => {
    await pantryStaplesApi.toggle(id);
    loadStaples();
  };

  const handleAddStaple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaple.trim()) return;
    await pantryStaplesApi.create(newStaple.trim());
    setNewStaple('');
    loadStaples();
  };

  const handleDeleteStaple = async (id: number) => {
    await pantryStaplesApi.delete(id);
    loadStaples();
  };

  const openSearch = (engine: string) => {
    if (!search?.searchQuery) return;
    const q = encodeURIComponent(search.searchQuery + ' recipe');
    const urls: Record<string, string> = {
      google: `https://www.google.com/search?q=${q}`,
      allrecipes: `https://www.allrecipes.com/search?q=${q}`,
      yummly: `https://www.yummly.com/recipes?q=${q}`,
    };
    window.open(urls[engine], '_blank');
  };

  const suggestions = search ? getSuggestions(search.urgentIngredients) : [];

  if (loading) return <div className="loading">Loading recipes...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Recipe Engine</h1>
        <ChefHat size={28} />
      </div>

      <div className="recipe-section">
        <h2>Use It or Lose It</h2>
        <p className="recipe-sub">
          Recipes driven by your urgent ingredients. Cook these now to avoid waste.
        </p>

        <label className="toggle-label">
          <input
            type="checkbox"
            checked={includePantry}
            onChange={e => handleTogglePantry(e.target.checked)}
          />
          Include pantry staples (salt, oil, etc.)
        </label>

        {search && search.urgentIngredients.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '1rem' }}>
            No urgent ingredients right now. Your fridge is in good shape!
          </div>
        ) : (
          <>
            <div className="ingredient-chips">
              {search?.urgentIngredients.map(ing => (
                <span key={ing} className="chip chip-urgent">{ing}</span>
              ))}
              {includePantry && search?.pantryStaples.map(s => (
                <span key={s} className="chip chip-pantry">{s}</span>
              ))}
            </div>

            <div className="search-query-box">
              <span className="search-query-label">Search query:</span>
              <span className="search-query-text">{search?.searchQuery}</span>
            </div>

            <div className="recipe-buttons">
              <button className="btn-recipe" onClick={() => openSearch('google')}>
                <ExternalLink size={15} /> Search on Google
              </button>
              <button className="btn-recipe btn-recipe-alt" onClick={() => openSearch('allrecipes')}>
                <ExternalLink size={15} /> AllRecipes
              </button>
              <button className="btn-recipe btn-recipe-alt" onClick={() => openSearch('yummly')}>
                <ExternalLink size={15} /> Yummly
              </button>
            </div>

            {suggestions.length > 0 && (
              <>
                <p className="recipe-sub" style={{ marginTop: '1rem', marginBottom: 0 }}>
                  <strong>Suggested recipes</strong> based on what you have:
                </p>
                <div className="recipe-suggestions">
                  {suggestions.map(s => (
                    <div key={s.title} className="recipe-card">
                      <div className="recipe-card-emoji">{s.emoji}</div>
                      <div className="recipe-card-title">{s.title}</div>
                      <div className="recipe-card-sub">{s.desc}</div>
                      <button
                        className="recipe-card-btn"
                        onClick={() => {
                          const q = encodeURIComponent(s.query);
                          window.open(`https://www.google.com/search?q=${q}`, '_blank');
                        }}
                      >
                        <ExternalLink size={12} /> View Recipe
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="section">
        <h2>Pantry Staples — What's In Stock</h2>
        <p className="recipe-sub">
          Check items you currently have. <strong>In Stock</strong> items are assumed available
          and won't exclude recipes. <strong>Out of Stock</strong> items are grayed out and ignored.
        </p>

        <form onSubmit={handleAddStaple} className="add-staple-form">
          <input
            type="text"
            value={newStaple}
            onChange={e => setNewStaple(e.target.value)}
            placeholder="Add staple (e.g. Vinegar)"
          />
          <button type="submit" className="btn-primary">
            <Plus size={14} /> Add
          </button>
        </form>

        <div className="staple-grid">
          {staples.map(s => (
            <div
              key={s.id}
              className={`staple-item ${s.isEnabled ? 'staple-in-stock' : 'staple-disabled'}`}
              onClick={() => handleToggleStaple(s.id)}
              title={s.isEnabled ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
            >
              <div className="staple-check">
                {s.isEnabled
                  ? <ToggleRight size={16} color="#22c55e" />
                  : <ToggleLeft size={16} color="#64748b" />}
              </div>
              <span className="staple-name">{s.name}</span>
              <span className={`staple-stock-label ${s.isEnabled ? 'stock-yes' : 'stock-no'}`}>
                {s.isEnabled ? 'In Stock' : 'Out of Stock'}
              </span>
              <button
                className="btn-icon btn-danger"
                onClick={e => { e.stopPropagation(); handleDeleteStaple(s.id); }}
                title="Remove permanently"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
