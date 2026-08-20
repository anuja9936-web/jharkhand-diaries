import { ArrowRight, Sparkles, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { CUISINE_IMAGES } from '../../constants/contentImages';

interface Dish {
  id: string;
  name: string;
  hindiName?: string;
  tagline: string;
  description: string;
  ingredients: string;
  region: string;
  badge: string;
  image: string;
}

const DISHES: Dish[] = [
  {
    id: 'dhuska',
    name: 'Dhuska & Ghugni',
    hindiName: 'धुस्का और घुघनी',
    tagline: 'The undisputed culinary emblem of Jharkhand',
    description: 'Golden-fried cakes prepared from fermented powdered rice and chana dal batter, traditionally paired with steaming spicy aloo chana or ghugni curry.',
    ingredients: 'Rice, Chana Dal, Cumin, Mustard Oil, Spices',
    region: 'Statewide / Ranchi / Latehar',
    badge: 'Signature Dish',
    image: CUISINE_IMAGES.DHUSKA,
  },
  {
    id: 'chilka-roti',
    name: 'Chilka Roti',
    hindiName: 'चिलका रोटी',
    tagline: 'Delicate indigenous rice crêpes',
    description: 'A wholesome, unpolished rice flour crêpe gently roasted on clay or iron griddles, traditionally served with tomato chutney, dal, or roasted meat.',
    ingredients: 'Chotanagpur Indigenous Rice, Chana Dal, Salt',
    region: 'Santhal Pargana & Kolhan',
    badge: 'Traditional Heritage',
    image: CUISINE_IMAGES.CHILKA_ROTI,
  },
  {
    id: 'rugra',
    name: 'Rugra / Puttu Curry',
    hindiName: 'रुगड़ा / पुट्टू',
    tagline: 'Forest truffles harvested from the Sal canopy',
    description: 'A prized wild mushroom that sprouts beneath damp sal trees during early monsoon showers, cooked in rich mustard gravy with earthy, meaty notes.',
    ingredients: 'Wild Sal Mushrooms, Mustard Paste, Garlic, Spices',
    region: 'Saranda & Palamu Forests',
    badge: 'Seasonal Wild Delicacy',
    image: CUISINE_IMAGES.RUGRA_CURRY,
  },
  {
    id: 'thekua',
    name: 'Thekua',
    hindiName: 'ठेकुआ',
    tagline: 'Sacred crispy festive confection',
    description: 'A celebrated traditional treat made of coarsely ground whole wheat flour, pure sugarcane jaggery, cardamom, and fried in desi ghee on wooden dies.',
    ingredients: 'Wheat Flour, Desi Ghee, Jaggery, Cardamom, Fennel',
    region: 'Chhath Puja / Statewide',
    badge: 'Festive Confection',
    image: CUISINE_IMAGES.THEKUA,
  },
  {
    id: 'arsa',
    name: 'Arsa Roti',
    hindiName: 'अनरसा / अरसा',
    tagline: 'Centuries-old tribal celebratory sweet',
    description: 'Festive delicacy made by soaking rice for days, grinding into a fine dough, mixing with reduced jaggery syrup, and frying until crisp on the outside.',
    ingredients: 'Aromatic Rice, Cane Jaggery, White Sesame',
    region: 'Tribal Weddings & Harvest Festivals',
    badge: 'Celebration Sweet',
    image: CUISINE_IMAGES.ARSA,
  },
  {
    id: 'karil',
    name: 'Karil / Baas Sandhana',
    hindiName: 'करील / बांस सांधना',
    tagline: 'Tender bamboo shoot stew',
    description: 'Freshly harvested young bamboo shoots sliced and fermented, cooked into tangy rustic curries rich in nutritional value and wild forest aromas.',
    ingredients: 'Fresh Bamboo Shoots, Mustard, Turmeric, Dry Chilies',
    region: 'Chotanagpur Highlands',
    badge: 'Forest Foraging',
    image: CUISINE_IMAGES.KARIL_BAMBOO,
  },
];

export function HomeCuisineSection() {
  return (
    <section id="cuisine" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-clay-100 px-3.5 py-1 text-xs font-bold text-clay-800">
          <Utensils className="h-3.5 w-3.5" />
          <span>INDIGENOUS GASTRONOMY</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
          Taste Jharkhand: Flavours of Forest &amp; Hearth
        </h2>
        <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
          Rooted in ancient foraging wisdom, organic grains, and hearty earthen cookware, Jharkhand's culinary tradition is an unhurried celebration of natural flavours.
        </p>
      </div>

      {/* Grid of Dishes */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {DISHES.map((dish) => (
          <article
            key={dish.id}
            className="group relative flex flex-col rounded-3xl border border-ink-200/90 bg-[#FFFDF9] p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-clay-300 hover:shadow-xl justify-between"
          >
            <div className="space-y-4">
              {/* Card Header: Tag & Region */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-clay-50 px-3 py-1 text-xs font-bold text-clay-700 border border-clay-200">
                  {dish.badge}
                </span>
                <span className="text-[11px] font-semibold text-ink-500">
                  {dish.region}
                </span>
              </div>

              {/* Title & Hindi Subtitle */}
              <div>
                <h3 className="font-display text-2xl font-bold text-ink-900 group-hover:text-clay-700 transition-colors">
                  {dish.name}
                </h3>
                {dish.hindiName && (
                  <p className="text-xs font-semibold text-clay-600 mt-0.5 font-sans">
                    {dish.hindiName}
                  </p>
                )}
                <p className="text-xs font-medium text-ink-500 italic mt-1">
                  "{dish.tagline}"
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                {dish.description}
              </p>
            </div>

            {/* Ingredients Footer */}
            <div className="mt-6 pt-4 border-t border-ink-100 space-y-1 text-xs">
              <span className="font-bold text-ink-700 uppercase tracking-wider text-[10px]">
                Key Ingredients:
              </span>
              <p className="text-ink-500 font-medium">{dish.ingredients}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom Cultural Note & Action */}
      <div className="mt-12 rounded-3xl bg-ink-900 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span>COMMUNITY FOOD ETHOS</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
            Experience Earthen Flavours at Certified Local Homestays
          </h3>
          <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
            Our certified village hosts prepare organic, slow-cooked ancestral recipes using locally cold-pressed mustard oil and hand-milled plateau grains.
          </p>
        </div>

        <Button variant="secondary" asChild className="shrink-0">
          <Link to="/marketplace" className="inline-flex items-center gap-2">
            <span>EXPLORE JHARKHAND CUISINE</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
