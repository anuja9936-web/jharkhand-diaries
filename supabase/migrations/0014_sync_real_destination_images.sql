-- ==============================================================================
-- Migration: 0014_sync_real_destination_images.sql
-- Description: Synchronize real photographs across all destinations in public.destinations
-- ==============================================================================

-- 1. Update existing destinations in public.destinations with real photographs
update public.destinations set cover_image = '/images/destinations/hundru-falls.jpg', gallery = array['/images/destinations/hundru-falls.jpg', '/images/destinations/dassam-falls.jpg'] where slug = 'hundru-falls';
update public.destinations set cover_image = '/images/destinations/dassam-falls.jpg', gallery = array['/images/destinations/dassam-falls.jpg', '/images/destinations/jonha-falls.jpg'] where slug = 'dassam-falls';
update public.destinations set cover_image = '/images/destinations/jonha-falls.jpg', gallery = array['/images/destinations/jonha-falls.jpg', '/images/destinations/hundru-falls.jpg'] where slug = 'jonha-falls';
update public.destinations set cover_image = '/images/destinations/rock-garden-ranchi.jpg', gallery = array['/images/destinations/rock-garden-ranchi.jpg', '/images/destinations/ranchi-city.jpg'] where slug = 'rock-garden-ranchi';
update public.destinations set cover_image = '/images/destinations/tribal-museum-ranchi.jpg', gallery = array['/images/destinations/tribal-museum-ranchi.jpg', '/images/art/sohrai-painting.jpg'] where slug = 'tribal-museum-ranchi';
update public.destinations set cover_image = '/images/destinations/netarhat.jpg', gallery = array['/images/destinations/netarhat.jpg', '/images/stays/pine-eco-lodge.jpg'] where slug = 'netarhat';
update public.destinations set cover_image = '/images/destinations/betla-national-park.jpg', gallery = array['/images/destinations/betla-national-park.jpg', '/images/destinations/saranda-forest.jpg'] where slug = 'betla-national-park';
update public.destinations set cover_image = '/images/destinations/lodh-falls.jpg', gallery = array['/images/destinations/lodh-falls.jpg', '/images/destinations/hundru-falls.jpg'] where slug = 'lodh-falls';
update public.destinations set cover_image = '/images/destinations/patratu-valley.jpg', gallery = array['/images/destinations/patratu-valley.jpg', '/images/destinations/patratu-night.jpg'] where slug = 'patratu-valley';
update public.destinations set cover_image = '/images/destinations/deoghar-baidyanath.jpg', gallery = array['/images/destinations/deoghar-baidyanath.jpg', '/images/destinations/trikut-pahar.jpg'] where slug = 'baidyanath-dham';
update public.destinations set cover_image = '/images/destinations/saranda-forest.jpg', gallery = array['/images/destinations/saranda-forest.jpg', '/images/destinations/hirni-falls.jpg'] where slug = 'saranda-forest';
update public.destinations set cover_image = '/images/destinations/pahari-mandir.jpg', gallery = array['/images/destinations/pahari-mandir.jpg', '/images/destinations/ranchi-city.jpg'] where slug = 'pahari-mandir';
update public.destinations set cover_image = '/images/destinations/mccluskieganj.jpg', gallery = array['/images/destinations/mccluskieganj.jpg'] where slug = 'mccluskieganj';

-- 2. Insert new destinations if not exists with their real photos
insert into public.destinations (name, slug, short_description, description, district, category, latitude, longitude, cover_image, gallery, eco_zone, best_time, entry_fee, status)
values
(
  'Pahari Mandir, Ranchi',
  'pahari-mandir-ranchi',
  '300-foot hilltop Shiva Temple offering breathtaking 360-degree panoramic views of Ranchi city.',
  'Pahari Mandir is situated atop Ranchi Hill (Phari). Dedicated to Lord Shiva (Pahario Baba), pilgrims climb 468 stone steps to reach the sanctum. It also holds unique historical pride where the Indian Tricolour is hoisted on Independence and Republic Days.',
  'Ranchi',
  'religious',
  23.3700,
  85.3150,
  '/images/destinations/pahari-mandir.jpg',
  array['/images/destinations/pahari-mandir.jpg', '/images/destinations/ranchi-city.jpg'],
  false,
  'October to March',
  0,
  'published'
),
(
  'McCluskieganj Heritage Town',
  'mccluskieganj-heritage',
  'Historic colonial village founded by the Colonisation Society of India with quaint stone bungalows and tranquil Sal groves.',
  'Established in 1933 by Timothy McCluskie, this European-style settlement in Ranchi district is famous for colonial architecture, quaint English bungalows, the Don Bosco Academy, and serene forest walks.',
  'Ranchi',
  'heritage',
  23.6550,
  85.0080,
  '/images/destinations/mccluskieganj.jpg',
  array['/images/destinations/mccluskieganj.jpg'],
  false,
  'October to February',
  0,
  'published'
),
(
  'Tagore Hill (Morabadi)',
  'tagore-hill-ranchi',
  'Historic hilltop ashram and scenic pavilion where Jyotirindranath Tagore composed literary works and music.',
  'Standing at a height of 300 feet in Morabadi, Ranchi, Tagore Hill is dedicated to the artistic legacy of the Tagore family. The Brahma Mandir pavilion on top offers sweeping sunset vistas over Ranchi.',
  'Ranchi',
  'heritage',
  23.4010,
  85.3370,
  '/images/destinations/tagore-hill.jpg',
  array['/images/destinations/tagore-hill.jpg', '/images/destinations/ranchi-city.jpg'],
  false,
  'Year round',
  20,
  'published'
),
(
  'Maluti Terracotta Temples',
  'maluti-terracotta-temples',
  'A remarkable heritage cluster of 108 historic terracotta temples depicting Ramayana and Mahabharata epics in Dumka.',
  'Constructed between the 17th and 19th centuries by the Nankar royal dynasty of Dumka, Maluti is known as the village of temples. The intricate terracotta panels depict mythological battle scenes and regional folk motifs.',
  'Dumka',
  'heritage',
  24.1600,
  87.6800,
  '/images/destinations/maluti-temples.jpg',
  array['/images/destinations/maluti-temples.jpg'],
  false,
  'October to March',
  0,
  'published'
),
(
  'Surajkund Hot Springs',
  'surajkund-hot-springs',
  'The hottest natural sulphur spring in India (88°C) surrounded by cold water pools and therapeutic mineral springs in Hazaribagh.',
  'Located in Belkapi near Barhi, Surajkund features five natural thermal kunds (Suraj, Ram, Lakshman, Sita, and Bharat). The sulphur-rich steaming waters are renowned for curative properties.',
  'Hazaribagh',
  'eco',
  24.1500,
  85.6400,
  '/images/destinations/surajkund.jpg',
  array['/images/destinations/surajkund.jpg'],
  true,
  'November to February',
  10,
  'published'
)
on conflict (slug) do update set
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  updated_at = now();

-- 3. Update provider offerings with real photos
update public.provider_offerings set cover_image = '/images/stays/lake-resort.jpg', gallery = array['/images/stays/lake-resort.jpg', '/images/destinations/patratu-valley.jpg'] where slug = 'patratu-valley-eco-stay';
update public.provider_offerings set cover_image = '/images/stays/pine-eco-lodge.jpg', gallery = array['/images/stays/pine-eco-lodge.jpg', '/images/destinations/netarhat.jpg'] where slug = 'netarhat-forest-homestay';
update public.provider_offerings set cover_image = '/images/stays/heritage-homestay.jpg', gallery = array['/images/stays/heritage-homestay.jpg', '/images/destinations/deoghar-baidyanath.jpg'] where slug = 'deoghar-heritage-stay';
update public.provider_offerings set cover_image = '/images/products/sohrai-canvas.jpg', gallery = array['/images/products/sohrai-canvas.jpg', '/images/art/sohrai-painting.jpg'] where slug = 'sohrai-wall-art-painting';
update public.provider_offerings set cover_image = '/images/products/dokra-figurine.jpg', gallery = array['/images/products/dokra-figurine.jpg', '/images/art/dokra-craft.jpg'] where slug = 'dhokra-tribal-craft-musician';
update public.provider_offerings set cover_image = '/images/products/tussar-silk.jpg', gallery = array['/images/products/tussar-silk.jpg'] where slug = 'tussar-silk-handwoven-stole';
update public.provider_offerings set cover_image = '/images/destinations/hundru-falls.jpg', gallery = array['/images/destinations/hundru-falls.jpg', '/images/destinations/dassam-falls.jpg'] where slug = 'ranchi-waterfall-circuit-tour';
update public.provider_offerings set cover_image = '/images/destinations/patratu-valley.jpg', gallery = array['/images/destinations/patratu-valley.jpg', '/images/experiences/lake-kayaking.jpg'] where slug = 'patratu-valley-nature-trek';
update public.provider_offerings set cover_image = '/images/destinations/dalma-hills.jpg', gallery = array['/images/destinations/dalma-hills.jpg'] where slug = 'dalma-wildlife-sanctuary-experience';
update public.provider_offerings set cover_image = '/images/experiences/tribal-cooking.jpg', gallery = array['/images/experiences/tribal-cooking.jpg', '/images/cuisine/dhuska.jpg'] where slug = 'rural-tribal-village-immersion';
update public.provider_offerings set cover_image = '/images/transport/tourist-suv.jpg', gallery = array['/images/transport/tourist-suv.jpg', '/images/destinations/ranchi-skyline.jpg'] where slug = 'ranchi-patratu-tourist-cab';
