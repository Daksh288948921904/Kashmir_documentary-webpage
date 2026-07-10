/**
 * One-time seed script: inserts the 16 hardcoded products into Supabase.
 *
 * Usage:
 *   node scripts/seed-products.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env.local manually (no dotenv dependency needed)
const env = readFileSync('.env.local', 'utf8');
function getEnv(key) {
  const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : undefined;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey  = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

const PRODUCTS = [
  { id: 'saffron-1g',        name: 'Pampore Saffron',        subtitle: 'Grade A · Mongra threads',      region: 'Pampore, South Kashmir',    weight: '1 g',           price: 599,  category: 'spice',  badge: 'GI Tagged',     hue: '#9a1f1a', description: "Hand-plucked at dawn during the October harvest. Deep crimson threads with an intensely honeyed aroma — the world's most prized saffron, from its original home.", img_url: 'https://images.unsplash.com/photo-1600298882525-60c4a3b7d00f?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 1 },
  { id: 'saffron-3g',        name: 'Pampore Saffron',        subtitle: 'Grade A · Value pack',          region: 'Pampore, South Kashmir',    weight: '3 g',           price: 1599, category: 'spice',  badge: 'GI Tagged',     hue: '#9a1f1a', description: 'The same Grade A Mongra threads, value-packed for serious cooks. Each gram replaces 10–12 flowers hand-picked from the October fields.', img_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 2 },
  { id: 'walnuts-500g',      name: 'Kashmiri Walnuts',       subtitle: 'Shelled · Light halves',        region: 'Kupwara, Kashmir Valley',   weight: '500 g',         price: 349,  category: 'nut',    badge: 'Old-grove',     hue: '#6b4c2a', description: 'Light-coloured halves with a mild, buttery flavour — notably less bitter than Iranian or Californian varieties. From old-growth walnut orchards in Kupwara.', img_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 3 },
  { id: 'almonds-250g',      name: 'Mamra Almonds',          subtitle: 'Wild Kashmiri variety',         region: 'Kargil, Ladakh',            weight: '250 g',         price: 449,  category: 'nut',    badge: 'Wild-grown',    hue: '#8b6914', description: 'The prized Mamra almond — smaller and more oil-rich than Californian types. Grown without irrigation in the high-altitude orchards of Kargil.', img_url: 'https://images.unsplash.com/photo-1574570628485-53bde9ded9f4?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 4 },
  { id: 'apple-royal-1kg',   name: 'Royal Delicious',        subtitle: 'Fresh · Season-packed',         region: 'Shopian, Kashmir Valley',   weight: '~1 kg (6–8 pcs)', price: 199, category: 'fruit',  badge: 'In Season',     hue: '#8b1a1a', description: "The star of Kashmir's orchards. Deep red, crisp and lightly sweet — grown at over 5,000 ft where cold nights concentrate the sugar and deepen the colour.", img_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 5 },
  { id: 'apple-golden-1kg',  name: 'Golden Apple',           subtitle: 'Fresh · Season-packed',         region: 'Pulwama, Kashmir Valley',   weight: '~1 kg (6–8 pcs)', price: 179, category: 'fruit',  badge: 'In Season',     hue: '#b8860b', description: "Pale gold, fragrant and honeyed. Kashmir's golden apples ripen slowly in the cool Valley air — excellent fresh or as the base of traditional murabba.", img_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 6 },
  { id: 'apricot-250g',      name: 'Dried Apricots',         subtitle: 'Khumani · Sun-dried',           region: 'Kargil & Leh, Ladakh',      weight: '250 g',         price: 249,  category: 'fruit',  badge: 'No additives',  hue: '#c8792a', description: 'Sun-dried on rooftops at altitude — unsulphured, intensely flavoured, with a natural tart-sweetness. A Ladakhi staple through the long winter.', img_url: 'https://images.unsplash.com/photo-1595981234058-a9302fb97229?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 7 },
  { id: 'mulberry-250g',     name: 'Dried Mulberries',       subtitle: 'Toot · White variety',          region: 'Sopore, North Kashmir',     weight: '250 g',         price: 279,  category: 'fruit',  badge: 'Sun-dried',     hue: '#5c3d78', description: "White mulberries from the trees that once fed Kashmir's silk worms. Sweet, chewy and rich in iron — a forgotten fruit of the Valley.", img_url: 'https://images.unsplash.com/photo-1615631118235-2c5a4842e4f2?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 8 },
  { id: 'kahwa-100g',        name: 'Kashmiri Kahwa',         subtitle: 'Green tea · Ceremonial blend',  region: 'Srinagar, Kashmir Valley',  weight: '100 g (~50 cups)', price: 299, category: 'tea',    badge: 'Artisan blend', hue: '#4a7a3a', description: 'Loose green tea with cardamom, cinnamon, cloves and dried rose petals. Brewed in a samovar, finished with crushed almonds — the warmth of every Kashmiri winter.', img_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 9 },
  { id: 'noon-chai-100g',    name: 'Noon Chai',              subtitle: 'Sheer chai · Pink salt tea',    region: 'Srinagar, Kashmir Valley',  weight: '100 g',         price: 259,  category: 'tea',    badge: 'Traditional',   hue: '#b8547a', description: 'Gunpowder green tea blended for its characteristic pink colour when brewed with baking soda, milk and salt. The daily tea of Kashmiri households.', img_url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 10 },
  { id: 'honey-wild-500g',   name: 'Wild Himalayan Honey',   subtitle: 'Multi-floral · Raw & unfiltered', region: 'Pahalgam, Kashmir Valley', weight: '500 g',        price: 599,  category: 'honey',  badge: 'Raw · Unfiltered', hue: '#b8860b', description: 'Collected from hives kept among alpine meadows above Pahalgam. Dark, complex and faintly floral — reflects every wildflower the bees visited that season.', img_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 11 },
  { id: 'honey-lavender-250g', name: 'Lavender Honey',       subtitle: 'Single-origin · Bhaderwah',     region: 'Bhaderwah, Jammu',          weight: '250 g',         price: 449,  category: 'honey',  badge: 'Single-origin', hue: '#8a6aaa', description: "Bees kept among Bhaderwah's lavender fields — a pale, lightly perfumed honey from one of India's finest lavender-growing valleys. Rare and seasonal.", img_url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 12 },
  { id: 'gucchi-50g',        name: 'Gucchi Mushrooms',       subtitle: 'Morchella · Wild & dried',      region: 'Pir Panjal, Kashmir',       weight: '50 g',          price: 899,  category: 'fungi',  badge: 'Wild-foraged',  hue: '#6b4c2a', description: 'The most prized edible mushroom of the Himalaya — hand-foraged from the pine forests after the spring snowmelt. Intensely earthy, smoky and extraordinarily rare.', img_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 13 },
  { id: 'chilli-200g',       name: 'Kashmiri Chilli',        subtitle: 'Deghi Mirch · Stone-ground',    region: 'Sopore, North Kashmir',     weight: '200 g',         price: 179,  category: 'spice',  badge: null,            hue: '#8b1a1a', description: 'Mild in heat but vivid red — it gives rogan josh its colour and wazwan its soul. Stone-ground from sun-dried Valley chillies.', img_url: 'https://images.unsplash.com/photo-1599187151917-7c89f7a5b64c?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 14 },
  { id: 'shilajit-10g',      name: 'Shilajit Resin',         subtitle: 'High-altitude mineral pitch',   region: 'Zoji La, Ladakh',           weight: '10 g',          price: 899,  category: 'herbs',  badge: 'Purified',      hue: '#2a1f14', description: 'Collected at over 14,000 ft from the Zoji La pass — the blackened mineral resin that seeps from Himalayan rock faces in summer. Revered in Ayurveda for centuries.', img_url: 'https://images.unsplash.com/photo-1545213156-09c63a97fc0e?auto=format&fit=crop&w=640&h=480&q=80', sort_order: 15 },
];

const { error } = await supabase.from('products').upsert(PRODUCTS, { onConflict: 'id' });

if (error) {
  console.error('Seed failed:', error.message);
  process.exit(1);
}

console.log(`✓ Seeded ${PRODUCTS.length} products successfully.`);
