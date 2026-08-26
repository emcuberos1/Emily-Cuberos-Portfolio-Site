// Assigning to window to support direct double-click launching without CORS errors
window.AMENITIES = [
  {
    id: 'pool-chair',
    name: 'Poolside Lounge Chair',
    category: 'pool-beach',
    pricePerHour: 0,
    timeLimitHours: 3,
    highDemand: true,
    description: 'Complimentary premium cushioned lounge chair by the main infinity pool. Includes towel service.',
    features: ['Infinity pool view', 'Adjustable backrest', 'Umbrella shade available', 'Towel service included'],
    // Local generated image
    image: 'images/pool_chairs.png'
  },
  {
    id: 'pool-cabana',
    name: 'Luxury Pool Cabana',
    category: 'pool-beach',
    pricePerHour: 55,
    timeLimitHours: 3,
    highDemand: true,
    description: 'Private poolside retreat. Features lounge seating, fan, mini-fridge with complimentary waters, and dedicated server.',
    features: ['Plush sectional sofa', 'Flat-screen TV & ceiling fan', 'Mini-fridge with drinks', 'Dedicated service staff'],
    // Local generated image (matching scene infinity pool)
    image: 'images/pool_cabanas.png'
  },
  {
    id: 'beach-chair',
    name: 'Harlow Shoreline Chair',
    category: 'pool-beach',
    pricePerHour: 10,
    timeLimitHours: 3,
    highDemand: true,
    description: 'Relax at the edge of the ocean. Premium beach lounger on private sands with adjustability and side table.',
    features: ['Direct beach access', 'Side table', 'Shared umbrella', 'Towel setup'],
    // Local generated image (actual beach chairs)
    image: 'images/beach_chairs.png'
  },
  {
    id: 'beach-cabana',
    name: 'Oceanfront Beach Cabana',
    category: 'pool-beach',
    pricePerHour: 80,
    timeLimitHours: 3,
    highDemand: true,
    description: 'Exclusive beachside cabana directly on the sand. Features premium double daybeds, misting fan, and personal beach butler.',
    features: ['Double-width beach daybed', 'Misting fans', 'Complimentary fruit platter', 'Personal butler service'],
    // Local generated image (actual beach cabanas)
    image: 'images/beach_cabanas.png'
  },
  {
    id: 'bicycle',
    name: 'Harlow Cruiser Bicycle',
    category: 'sports',
    pricePerHour: 15,
    timeLimitHours: 2,
    highDemand: false,
    description: 'Stylish coastal cruiser bike. Perfect for exploring the scenic boardwalk and local paths. Helmet and lock included.',
    features: ['Comfort saddle', 'Front basket', 'Lock & safety helmet', 'Boardwalk map'],
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'surfboard',
    name: 'Premium Surfboard',
    category: 'sports',
    pricePerHour: 25,
    timeLimitHours: 1,
    highDemand: false,
    description: 'High-performance fiberglass and soft-top surfboards suitable for all skill levels. Leash and wax included.',
    features: ['Multiple sizes (6ft - 9ft)', 'Safety leash', 'Wetsuit optional add-on', 'Surf safety briefing'],
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'kayak',
    name: 'Single/Double Ocean Kayak',
    category: 'sports',
    pricePerHour: 30,
    timeLimitHours: 1,
    highDemand: false,
    description: 'Stable, tracking ocean kayaks. Explore the coastal bay or ride the light harbor swells. Paddle and life jacket included.',
    features: ['Comfort seat backs', 'Waterproof storage hatch', 'Paddles & dry bag', 'Life jacket (PFD) included'],
    // Local generated image (kayak floating on turquoise water)
    image: 'images/ocean_kayak.png'
  },
  {
    id: 'paddleboard',
    name: 'Stand-up Paddleboard (SUP)',
    category: 'sports',
    pricePerHour: 25,
    timeLimitHours: 1,
    highDemand: false,
    description: 'Wide, stable stand-up paddleboards. Ideal for flatwater cruising and light ocean swells. Paddle and leash included.',
    features: ['Extra-wide stable deck', 'Adjustable carbon paddle', 'Ankle leash', 'PFD included'],
    // Local generated image (SUP board floating)
    image: 'images/paddleboard.png'
  },
  {
    id: 'basketball',
    name: 'Championship Basketball',
    category: 'sports',
    pricePerHour: 5,
    timeLimitHours: 2,
    highDemand: false,
    description: 'Premium composite leather basketball for use at the Harlow Court. Court reservation included.',
    features: ['Harlow Sports Court access', 'Official size & weight', 'Pump available on-site'],
    // Local generated image (outdoor basketball hoop court)
    image: 'images/basketball_court.png'
  },
  {
    id: 'tennis-racket',
    name: 'Pro Tennis Set',
    category: 'sports',
    pricePerHour: 12,
    timeLimitHours: 2,
    highDemand: false,
    description: 'Two professional Wilson tennis rackets and a fresh can of championship tennis balls. Court reservation included.',
    features: ['Clay court access', '2 Wilson Pro rackets', 'Can of 3 tennis balls', 'Towels & water station'],
    // Local generated image (clay tennis court layout)
    image: 'images/tennis_court.png'
  },
  {
    id: 'shuffleboard',
    name: 'Shuffleboard Set',
    category: 'sports',
    pricePerHour: 10,
    timeLimitHours: 2,
    highDemand: false,
    description: 'Complete shuffleboard cue and disc set. Includes booking for one of our shade-draped outdoor courts.',
    features: ['Shaded court booking', '4 cue sticks', '8 premium discs', 'Digital scoring board'],
    // Local generated image (deck shuffleboard court lines)
    image: 'images/shuffleboard_court.png'
  },
  {
    id: 'bocce-ball',
    name: 'Resort Bocce Set',
    category: 'sports',
    pricePerHour: 12,
    timeLimitHours: 2,
    highDemand: false,
    description: 'Complete premium bocce set for use at our shaded seaside courts. Fun for groups of all ages.',
    features: ['Clay bocce court access', '8 professional bocce balls', '1 pallino target marker', 'Shaded spectator seating'],
    // Local generated image (bocce balls on clay court)
    image: 'images/bocce_set.png'
  }
];

window.RESTAURANTS = [
  {
    id: 'coastal-oasis',
    name: 'Coastal Oasis',
    cuisine: 'Fine Dining Seafood & Cocktails',
    hours: '11:00 AM - 10:00 PM',
    location: 'South Beach Deck',
    description: 'An elegant open-air seafood venue where contemporary culinary techniques meet fresh catch. Enjoy stunning ocean vistas and candlelight dinners.',
    dressCode: 'Resort Elegant',
    popularDishes: ['Harlow Lobster Thermidor', 'Crudo Platters', 'Signature Hibiscus Spritz'],
    features: ['Ocean views', 'Live acoustic music', 'Private sand tables', 'Extensive wine list'],
    // Local generated image (seafood dish on seaside dining table)
    image: 'images/coastal_oasis_food.png'
  },
  {
    id: 'the-pelican',
    name: 'The Pelican',
    cuisine: 'Casual Beachside Grill & Bar',
    hours: '8:00 AM - 8:00 PM',
    location: 'Infinity Poolside',
    description: 'Unwind with a frosty tropical cocktail and high-end pool bites. Open for breakfast, lunch, and early dinner. Walk-ups welcome but bookings highly recommended.',
    dressCode: 'Casual / Swimwear with cover-up',
    popularDishes: ['Charred Mahi Taco', 'Pelican Club Sandwich', 'Frozen Coconut Mojito'],
    features: ['Swim-up bar access', 'Shaded terrace', 'Kid-friendly menu', 'Sunset happy hour'],
    // Local generated image (poolside grill mahi tacos and cocktail)
    image: 'images/pelican_food.png'
  },
  {
    id: 'harlows',
    name: "Harlow's",
    cuisine: 'Luxury Steakhouse & Craft Cocktail Lounge',
    hours: '5:00 PM - 11:00 PM',
    location: 'Main Lodge, West Wing',
    description: 'A grand mid-century inspired steakhouse with rich wood, leather booths, and dim, sophisticated lighting. Specializing in dry-aged prime cuts and handcrafted whiskey cocktails.',
    dressCode: 'Smart Casual / Semi-Formal',
    popularDishes: ['21-day Dry-Aged Tomahawk', 'Truffle Bone Marrow', 'Old Fashioned Flight'],
    features: ['Private dining rooms', 'Speakeasy lounge access', 'Chef\'s table experience', 'Valet parking'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  }
];

window.FAQ = [
  {
    question: 'How do loyalty points work?',
    answer: 'Guests receive 500 bonus points upon signup. Every paid booking earns you points equivalent to 10% of the booking value. Complimentary (free) bookings earn a flat 50 points as a participation bonus! You can redeem points directly during checkout to discount or fully cover the booking cost. Every 100 points equals a $1.00 discount.'
  },
  {
    question: 'Why are there time limits on pool chairs and cabanas?',
    answer: 'To ensure all guests have a fair opportunity to enjoy our beach and pool amenities, we enforce a strict 3-hour limit on cabanas and loungers. Water sports gear has a 1-hour limit, and cruisers/court rentals have a 2-hour limit. If you need more time, you can book a subsequent slot if it remains unreserved.'
  },
  {
    question: 'Can I cancel my reservation?',
    answer: 'Yes! You can cancel any reservation from your Guest Dashboard up to 2 hours before the start time. A full refund (including any points used) will be instantly credited to your account.'
  },
  {
    question: 'What happens if I encounter an issue with my equipment or booking?',
    answer: 'Use the floating Concierge Chat in the bottom right corner of the app. You can submit support requests, report faulty equipment, or ask general resort questions. A concierge agent or butler will assist you immediately, or you can visit the guest services desk in the lobby.'
  }
];
