import { useState } from 'react';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';

interface BlogPost {
  id: string;
  title: string;
  category: 'Destinations' | 'Art & Heritage' | 'Cuisine' | 'Eco-Travel' | 'Adventure';
  readTime: string;
  author: string;
  date: string;
  excerpt: string;
  content: string[];
  image: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Chasing the Roaring Waterfalls of the Chotanagpur Plateau',
    category: 'Destinations',
    readTime: '6 min read',
    author: 'Sunil Toppo (Field Researcher)',
    date: 'August 2026',
    excerpt: 'From the 98-metre Hundru plunge to the sacred stepped rock amphitheatre of Jonha and Dassam, explore the ancient geological wonders of Jharkhand.',
    content: [
      'The Chotanagpur plateau is crisscrossed by pristine rivers that tumble over precipitous fault escarpments formed over millions of years. Among these, the Subarnarekha, Kanchi, and Raru rivers create a natural amphitheatre of roaring cascades.',
      'Hundru Falls, dropping 98 metres into a crystal pool, is a masterclass in nature’s raw power. The constant spray creates misty microclimates where rare ferns and mosses flourish along ancient granite boulders.',
      'Meanwhile, Jonha Falls (also called Gautamdhara) offers a reflective spiritual pause, where Lord Buddha is believed to have bathed. Over 700 rock-cut steps lead down through tranquil Sal forest groves.',
    ],
    image: '/images/destinations/hundru-falls.jpg',
  },
  {
    id: 'b2',
    title: 'The Living Canvas: How Tribal Women Keep Sohrai & Khovar Murals Alive',
    category: 'Art & Heritage',
    readTime: '8 min read',
    author: 'Malini Sharma (Anthropologist)',
    date: 'July 2026',
    excerpt: 'An intimate journey through Hazaribagh mud villages where natural ochre, white clay, and mangrove earth pigments narrate centuries of animal reverence.',
    content: [
      'In the pastoral mud villages of Hazaribagh, walls do not merely support roofs; they sing. Sohrai, celebrated immediately after Diwali, is a vibrant thanksgiving to cattle and domestic companions who till the fertile plateau soil.',
      'Using natural earthen pigments—Charak matti (white kaolin), Geru (red ochre), Nagri (yellow), and Manghi (black manganese)—matriarchs paint peacocks, horned bulls, and sacred Lotus motifs using chewed twigs and cloth rags.',
      'Khovar art, traditionally created inside wedding chambers, employs an extraordinary sgraffito technique where black manganese coats are layered with white clay and scraped with broken comb teeth.',
    ],
    image: '/images/destinations/rajrappa.jpg',
  },
  {
    id: 'b3',
    title: 'A Weekend in Netarhat: Pine Woods, Colonial Chalets and Sunset Vistas',
    category: 'Adventure',
    readTime: '5 min read',
    author: 'Rhea Sen (Travel Writer)',
    date: 'June 2026',
    excerpt: 'Escape into the cool, tranquil highlands of Latehar with panoramic sunrise decks, heritage chalets, and organic village honey.',
    content: [
      'Perched at 1,128 metres above sea level, Netarhat was fondly dubbed the "Queen of Chotanagpur" by colonial travelers seeking respite from the plains. Today, it remains an unspoiled sanctuary of crisp mountain air.',
      'Magnolia Point offers unforgettable sunsets where the red sun dips behind layered blue ridges. Early risers can head to the Netarhat Sunrise Deck to watch golden dawn rays illuminate the dew-drenched pine woods.',
      'Local eco-cottages serve fresh village honey and steaming cups of herbal tea, making it the quintessential slow-travel weekend escape.',
    ],
    image: '/images/destinations/netarhat.jpg',
  },
  {
    id: 'b4',
    title: 'Flavours of the Sal Forest: The Mystery of Rugra and Earthen Cooking',
    category: 'Cuisine',
    readTime: '6 min read',
    author: 'Chef Anand Kerketta',
    date: 'May 2026',
    excerpt: 'Discover the prized wild forest truffles gathered under damp Sal canopies and how earthen cookware defines authentic tribal gastronomy.',
    content: [
      'During the first monsoon showers, local tribal women head into the deep Sal forests to forage for "Rugra" (also called Puttu). These round, firm wild mushrooms have a textured outer skin and an intensely rich, earthy flavor akin to black truffles.',
      'Cooked with cold-pressed mustard oil, crushed garlic, and stone-ground spices in unglazed clay Handis, Rugra is one of the most sought-after seasonal delicacies in eastern India.',
      'Paired with piping hot Chilka Roti made of indigenous unpolished rice, it embodies the sustainable foraging wisdom passed down over thousands of years.',
    ],
    image: '/images/destinations/patratu-valley.jpg',
  },
];

const CATEGORIES = ['All', 'Destinations', 'Art & Heritage', 'Cuisine', 'Eco-Travel', 'Adventure'] as const;

export function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filtered =
    activeCategory === 'All'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ink-200">
          <div className="space-y-3 max-w-2xl">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-clay-700 hover:text-clay-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
              EDITORIAL JOURNALS
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
              Stories from Jharkhand
            </h1>
            <p className="text-sm sm:text-base text-ink-600">
              In-depth essays, road trip chronicles, tribal craft histories, and gastronomy guides curated by local explorers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={[
                  'rounded-full px-4 py-2 text-xs font-bold transition-all',
                  activeCategory === cat
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-700 border border-ink-200 hover:bg-sand',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Post List / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group relative cursor-pointer flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden bg-ink-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-white/20">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-7 space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {post.readTime}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-7 pt-0 border-t border-ink-50 flex items-center justify-between text-xs">
                <span className="text-ink-400 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {post.author}
                </span>
                <span className="font-bold text-clay-700 hover:text-clay-900 inline-flex items-center gap-1">
                  Read Full Story →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Reader Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-bold text-clay-800">
                {selectedPost.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="text-xs font-bold uppercase tracking-wider text-ink-400 hover:text-ink-900"
              >
                Close (ESC)
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
                {selectedPost.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-ink-500">
                <span>By {selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.date}</span>
                <span>•</span>
                <span>{selectedPost.readTime}</span>
              </div>
            </div>

            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-ink-700">
              {selectedPost.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="pt-6 border-t border-ink-100 flex justify-between items-center">
              <Button onClick={() => setSelectedPost(null)}>Done Reading</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
