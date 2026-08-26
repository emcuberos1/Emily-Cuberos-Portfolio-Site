const AMENITIES = window.AMENITIES;
const RESTAURANTS = window.RESTAURANTS;
const FAQ = window.FAQ;

// ==========================================================================
// STATE MANAGEMENT & LOCALSTORAGE INITIALIZATION
// ==========================================================================
const DEFAULT_STATE = {
  user: {
    name: 'Guest',
    email: 'guest@harlow.com',
    registered: false,
    points: 100,
    pointsHistory: [
      {
        description: 'Poolside Lounge Chair Booking Bonus',
        amount: 50,
        type: 'earned',
        date: '6/3/2026'
      },
      {
        description: 'Dining Reservation Bonus: Coastal Oasis',
        amount: 50,
        type: 'earned',
        date: '6/1/2026'
      }
    ]
  },
  reservations: [
    {
      id: 'res-dining-seed-1',
      itemType: 'dining',
      itemId: 'coastal-oasis',
      itemName: 'Coastal Oasis',
      category: 'dining',
      date: 'Mon, Jun 1',
      time: '7:00 PM',
      rawDate: '2026-06-01',
      rawTime: '7:00 PM',
      durationHours: 2,
      guests: '4',
      pricePaid: 0,
      pointsUsed: 0,
      pointsEarned: 50,
      status: 'active'
    },
    {
      id: 'res-amenity-seed-1',
      itemType: 'amenity',
      itemId: 'pool-chair',
      itemName: 'Poolside Lounge Chair',
      category: 'pool-beach',
      date: 'Wed, Jun 3',
      time: '10:00 AM',
      rawDate: '2026-06-03',
      rawTime: '10:00 AM',
      durationHours: 3,
      pricePaid: 0,
      pointsUsed: 0,
      pointsEarned: 50,
      paymentMethod: 'Room Charge (Suite 304)',
      status: 'active'
    }
  ],
  chatMessages: [
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Welcome to The Harlow Hotel! I am your virtual concierge. How may I assist you today? You can choose a quick question below or type your inquiry.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]
};

// ==========================================================================
// DATETIME UTILITIES
// ==========================================================================
function parseDateTime(rawDate, rawTime) {
  if (!rawDate || !rawTime) return new Date();
  const [year, month, day] = rawDate.split('-').map(Number);
  const match = rawTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) {
    return new Date(`${rawDate} ${rawTime}`);
  }
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function isReservationPast(booking) {
  if (!booking.rawDate || !booking.rawTime) return false;
  const start = parseDateTime(booking.rawDate, booking.rawTime);
  const end = new Date(start.getTime() + booking.durationHours * 60 * 60 * 1000);
  return end <= new Date();
}

let state = JSON.parse(localStorage.getItem('harlow_hotel_state')) || DEFAULT_STATE;

// Temporary state variables for booking flow
let pendingBooking = null;

// ==========================================================================
// STATE PERSISTENCE UTILITIES
// ==========================================================================
function saveState() {
  localStorage.setItem('harlow_hotel_state', JSON.stringify(state));
  updateGlobalPills();
}

function updateGlobalPills() {
  const pointsDisplay = document.getElementById('points-display');
  const guestAvatar = document.getElementById('guest-avatar-pill');
  
  if (pointsDisplay) {
    pointsDisplay.textContent = `${state.user.points} Points`;
  }
  if (guestAvatar) {
    guestAvatar.textContent = state.user.registered ? state.user.name.charAt(0).toUpperCase() : 'G';
  }
}

// ==========================================================================
// ROUTING / VIEW RENDERERS
// ==========================================================================
const views = {
  overview: renderOverview,
  booking: renderBooking,
  dining: renderDining,
  dashboard: renderDashboard,
  help: renderHelp
};

let activeView = 'overview';
let activeBookingTab = 'pool-beach';

function switchView(viewName) {
  if (!views[viewName]) return;
  
  activeView = viewName;
  const viewport = document.getElementById('app-viewport');
  
  // Transition fade out
  viewport.style.opacity = 0;
  
  setTimeout(() => {
    // Render new content
    views[viewName](viewport);
    
    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Transition fade in
    viewport.style.opacity = 1;
    
    // Re-initialize Lucide icons in the newly rendered HTML
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, 200);
}

// ==========================================================================
// VIEW 1: RESORT OVERVIEW
// ==========================================================================
function renderOverview(container) {
  let signupSection = '';
  
  if (!state.user.registered) {
    signupSection = `
      <div class="onboarding-banner view-transition" style="margin-top: 40px;">
        <div class="onboard-content">
          <h3>Join Harlow <span>Rewards</span></h3>
          <p>Sign up to unlock rewards points, earn 10% back on premium bookings, and manage your beach stay effortlessly. Get <strong>500 points</strong> instantly upon signup.</p>
          <div class="points-breakdown">
            <div class="breakdown-item"><i data-lucide="sparkles"></i> 500 Pts Signup Bonus</div>
            <div class="breakdown-item"><i data-lucide="percent"></i> 10% Back on Rentals</div>
            <div class="breakdown-item"><i data-lucide="gift"></i> Redeem Points at Checkout</div>
          </div>
        </div>
        <div class="onboard-action">
          <div class="signup-card">
            <h4>Register Account</h4>
            <p>Enter your details to claim your 500 points immediately.</p>
            <form class="signup-form" id="signup-form">
              <input type="text" class="signup-input" id="signup-name" placeholder="Full Name" required>
              <input type="email" class="signup-input" id="signup-email" placeholder="Email Address" required>
              <input type="tel" class="signup-input" id="signup-phone" placeholder="Phone Number (e.g. 555-0199)" required>
              <input type="text" class="signup-input" id="signup-room" placeholder="Room Number (e.g. 304)" required>
              <button type="submit" class="btn-primary">Claim 500 Points</button>
            </form>
          </div>
        </div>
      </div>
    `;
  } else {
    signupSection = `
      <div class="onboarding-banner view-transition" style="margin-top: 40px; background: linear-gradient(135deg, var(--color-gold-metallic) 0%, #A37F3E 100%);">
        <div class="onboard-content">
          <h3>Welcome Back, <span>${state.user.name}</span></h3>
          <p>You are currently a <strong>Harlow Prestige Member</strong>. You have <strong>${state.user.points} points</strong> available to redeem on pool cabanas, water sports, and beach chairs.</p>
          <div class="points-breakdown">
            <div class="breakdown-item" style="background: rgba(255,255,255,0.15);"><i data-lucide="sparkles"></i> Tier: ${getUserTier(state.user.points)}</div>
            <div class="breakdown-item" style="background: rgba(255,255,255,0.15);"><i data-lucide="check-circle"></i> Active Room: Room 304</div>
          </div>
        </div>
        <div class="onboard-action">
          <button class="btn-primary" style="background: var(--color-ocean-deep); box-shadow: none;" id="btn-quick-book">Start Booking</button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="view-transition">
      <div class="overview-intro">
        <div class="intro-text">
          <h2>Experience Coastal Elegance At <span>The Harlow</span></h2>
          <p>Nestled directly on pristine white sands, The Harlow Hotel offers an unmatched oceanfront sanctuary. From sun-drenched pool cabanas to thrilling water activities and Michelin-caliber seafood dining, craft your perfect day along the shore.</p>
          <p>Our guest portal lets you reserve amenities in real time, view reservation schedules, and redeem loyalty rewards directly from your loungers.</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <span class="num">3</span>
              <span class="label">Fine Restaurants</span>
            </div>
            <div class="stat-card">
              <span class="num">24h</span>
              <span class="label">Dedicated Butler</span>
            </div>
            <div class="stat-card">
              <span class="num">84°</span>
              <span class="label">Heated Pool</span>
            </div>
          </div>
        </div>
        <div class="intro-image">
          <img src="images/pool_cabanas.png" alt="The Harlow Poolside Daybed">
        </div>
      </div>

      <div class="section-header">
        <h2>Curate Your Stay</h2>
        <p>Browse our exclusive options and make reservations instantly</p>
      </div>

      <div class="resort-sections">
        <div class="feature-panel">
          <div class="panel-img">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" alt="Harlow Beach Front">
            <span class="panel-badge">High Demand</span>
          </div>
          <div class="panel-content">
            <h3>Beach & Pool Lounging</h3>
            <p>Secure premium double cabanas with ice buckets or complimentary cushioned chairs right next to the surf or pool.</p>
            <button class="panel-btn" id="btn-goto-cabanas">Reserve Chairs & Cabanas</button>
          </div>
        </div>

        <div class="feature-panel">
          <div class="panel-img">
            <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80" alt="Sports Gear">
            <span class="panel-badge">Activities</span>
          </div>
          <div class="panel-content">
            <h3>Sports & Water Equipment</h3>
            <p>Rent boardwalk cruisers, ocean paddleboards, fiberglass surfboards, or reserve clay tennis courts and gear.</p>
            <button class="panel-btn" id="btn-goto-sports">Rent Sports Gear</button>
          </div>
        </div>

        <div class="feature-panel">
          <div class="panel-img">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80" alt="Dining Room">
            <span class="panel-badge">Gourmet</span>
          </div>
          <div class="panel-content">
            <h3>Restaurant Dining</h3>
            <p>Book candlelight seating at Coastal Oasis, poolside cocktails at The Pelican, or prime cuts at Harlow's steakhouse.</p>
            <button class="panel-btn" id="btn-goto-dining">Book a Table</button>
          </div>
        </div>
      </div>

      ${signupSection}
    </div>
  `;

  // Attach event listeners
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  const btnQuickBook = document.getElementById('btn-quick-book');
  if (btnQuickBook) {
    btnQuickBook.addEventListener('click', () => switchView('booking'));
  }

  document.getElementById('btn-goto-cabanas').addEventListener('click', () => {
    activeBookingTab = 'pool-beach';
    switchView('booking');
  });

  document.getElementById('btn-goto-sports').addEventListener('click', () => {
    activeBookingTab = 'sports';
    switchView('booking');
  });

  document.getElementById('btn-goto-dining').addEventListener('click', () => switchView('dining'));
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  
  if (!name || !email) return;

  state.user.name = name;
  state.user.email = email;
  state.user.phone = phone;
  state.user.registered = true;
  state.user.points += 500;
  
  state.user.pointsHistory.unshift({
    description: 'Welcome Loyalty Reward Bonus',
    amount: 500,
    type: 'earned',
    date: new Date().toLocaleDateString()
  });

  // Log in support message too
  state.chatMessages.push({
    id: `signup-welcome-${Date.now()}`,
    sender: 'bot',
    text: `Congratulations ${name}! You have successfully registered and received 500 Loyalty Points. Feel free to use them during your checkout.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveState();
  switchView('overview');
  
  // Open concierge chat to notify them
  setTimeout(() => {
    toggleChat(true);
  }, 1000);
}

function getUserTier(points) {
  if (points >= 2500) return 'Gold Elite';
  if (points >= 1000) return 'Silver Prestige';
  return 'Bronze Member';
}

// ==========================================================================
// VIEW 2: AMENITIES & SPORTS BOOKING
// ==========================================================================
function renderBooking(container) {
  const filteredAmenities = AMENITIES.filter(item => item.category === activeBookingTab);
  
  const tabButtonsHTML = `
    <div class="booking-tabs">
      <button class="tab-btn ${activeBookingTab === 'pool-beach' ? 'active' : ''}" id="tab-btn-pool-beach">
        <i data-lucide="umbrella"></i> Beach & Pool Cabanas
      </button>
      <button class="tab-btn ${activeBookingTab === 'sports' ? 'active' : ''}" id="tab-btn-sports">
        <i data-lucide="bike"></i> Sports & Equipment
      </button>
    </div>
  `;

  let cardsHTML = '';
  filteredAmenities.forEach(item => {
    // Generate features list
    const featuresList = item.features.map(f => `<li><i data-lucide="check"></i> ${f}</li>`).join('');
    
    // Badges
    const highDemandBadge = item.highDemand ? `<span class="card-badge high-demand"><i data-lucide="alert-circle" style="width:10px;height:10px;margin-right:2px;"></i> High Demand</span>` : '';
    const timeLimitBadge = `<span class="card-badge time-limit"><i data-lucide="clock" style="width:10px;height:10px;margin-right:2px;"></i> Max ${item.timeLimitHours}h</span>`;
    
    // Hourly Price string
    const priceText = item.pricePerHour === 0 ? 'Free' : `$${item.pricePerHour}<span>/hour</span>`;
    
    // Use matching image url defined directly in data.js
    let imageSrc = item.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80';

    cardsHTML += `
      <div class="booking-card view-transition">
        <div class="booking-card-media">
          <img src="${imageSrc}" alt="${item.name}">
          <div class="media-badges">
            ${highDemandBadge}
            ${timeLimitBadge}
          </div>
        </div>
        <div class="booking-card-info">
          <div>
            <div class="card-meta">
              <h3>${item.name}</h3>
              <div class="card-price" id="price-val-${item.id}">${priceText}</div>
            </div>
            <p>${item.description}</p>
            <ul class="card-features">
              ${featuresList}
            </ul>
          </div>
          <div class="card-action">
            <div class="duration-selector">
              <span>Duration (Hours)</span>
              <div class="duration-controls">
                <button class="duration-btn minus" data-id="${item.id}" disabled>-</button>
                <span class="duration-val" id="duration-display-${item.id}">1</span>
                <button class="duration-btn plus" data-id="${item.id}">+</button>
              </div>
            </div>
            <button class="btn-book" data-id="${item.id}">Reserve Now</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="view-transition">
      <div class="section-header">
        <h2>Reserve Hotel Amenities</h2>
        <p>Book luxury pool/beach lounging spots or professional sports and ocean sports equipment.</p>
      </div>

      ${tabButtonsHTML}

      <div class="booking-grid">
        ${cardsHTML}
      </div>
    </div>
  `;

  // Hook tab handlers
  document.getElementById('tab-btn-pool-beach').addEventListener('click', () => {
    activeBookingTab = 'pool-beach';
    renderBooking(container);
    if (window.lucide) window.lucide.createIcons();
  });
  document.getElementById('tab-btn-sports').addEventListener('click', () => {
    activeBookingTab = 'sports';
    renderBooking(container);
    if (window.lucide) window.lucide.createIcons();
  });

  // Hook plus/minus duration controllers
  document.querySelectorAll('.duration-btn.plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const item = AMENITIES.find(a => a.id === id);
      const display = document.getElementById(`duration-display-${id}`);
      const minusBtn = document.querySelector(`.duration-btn.minus[data-id="${id}"]`);
      
      let currentVal = parseInt(display.textContent);
      if (currentVal < item.timeLimitHours) {
        currentVal++;
        display.textContent = currentVal;
        minusBtn.removeAttribute('disabled');
      }
      
      if (currentVal >= item.timeLimitHours) {
        btn.setAttribute('disabled', 'true');
      }
    });
  });

  document.querySelectorAll('.duration-btn.minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const display = document.getElementById(`duration-display-${id}`);
      const plusBtn = document.querySelector(`.duration-btn.plus[data-id="${id}"]`);
      
      let currentVal = parseInt(display.textContent);
      if (currentVal > 1) {
        currentVal--;
        display.textContent = currentVal;
        plusBtn.removeAttribute('disabled');
      }
      
      if (currentVal <= 1) {
        btn.setAttribute('disabled', 'true');
      }
    });
  });

  // Hook Book buttons
  document.querySelectorAll('.btn-book').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const duration = parseInt(document.getElementById(`duration-display-${id}`).textContent);
      openCheckout(id, duration);
    });
  });
}

// ==========================================================================
// VIEW 3: DINING RESERVATIONS
// ==========================================================================
function renderDining(container) {
  let listHTML = '';
  
  RESTAURANTS.forEach(res => {
    const popularDishesList = res.popularDishes.map(d => `<span>${d}</span>`).join(' • ');
    const featuresList = res.features.map(f => `<li><i data-lucide="check" style="width:14px;height:14px;color:var(--color-gold-metallic);margin-right:6px;"></i>${f}</li>`).join('');
    
    // Use gourmet restaurant dining image defined directly in data.js
    let imageSrc = res.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';

    listHTML += `
      <div class="dining-card view-transition">
        <div class="dining-media">
          <img src="${imageSrc}" alt="${res.name}">
        </div>
        <div class="dining-info">
          <div>
            <div class="dining-header-section">
              <div class="dining-title-group">
                <h3>${res.name}</h3>
                <span class="dining-cuisine">${res.cuisine}</span>
              </div>
              <span class="dining-tag">${res.location}</span>
            </div>
            
            <p>${res.description}</p>
            
            <div style="font-size:0.8rem; color:var(--color-gold-metallic); font-weight:600; margin-bottom:12px;">
              Chef's Specialties: <span style="color:var(--color-ocean-medium); font-weight:400;">${popularDishesList}</span>
            </div>

            <div class="dining-details-grid">
              <div class="detail-item"><strong>Hours:</strong> ${res.hours}</div>
              <div class="detail-item"><strong>Dress Code:</strong> ${res.dressCode}</div>
            </div>
          </div>

          <!-- Table Booking Form -->
          <form class="dining-book-form" data-restaurant-id="${res.id}">
            <div class="dining-booking-inputs">
              <div class="input-group">
                <label>Date</label>
                <input type="date" class="dining-input dining-date" required min="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="input-group">
                <label>Time</label>
                <select class="dining-select dining-time" required>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="5:30 PM">5:30 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="7:30 PM">7:30 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                  <option value="8:30 PM">8:30 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                  <option value="9:30 PM">9:30 PM</option>
                </select>
              </div>
              <div class="input-group">
                <label>Guests</label>
                <select class="dining-select dining-guests" required>
                  <option value="2">2 Guests</option>
                  <option value="1">1 Guest</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="8">8 Guests</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn-book" style="background:var(--color-gold-metallic);">Book Table</button>
          </form>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="view-transition">
      <div class="section-header">
        <h2>Culinary Journeys</h2>
        <p>Book table reservations at any of our three signature resort restaurants. Dining bookings are complimentary and award loyalty points.</p>
      </div>

      <div class="dining-list">
        ${listHTML}
      </div>
    </div>
  `;

  // Attach submit listeners
  document.querySelectorAll('.dining-book-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const restaurantId = form.getAttribute('data-restaurant-id');
      const date = form.querySelector('.dining-date').value;
      const time = form.querySelector('.dining-time').value;
      const guests = form.querySelector('.dining-guests').value;
      
      handleDiningBooking(restaurantId, date, time, guests);
    });
  });
}

function handleDiningBooking(resId, date, time, guests) {
  const restaurant = RESTAURANTS.find(r => r.id === resId);
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  
  // Dining is free, but they earn 50 points participation bonus!
  const pointsEarned = 50;

  const newBooking = {
    id: `res-dining-${Date.now()}`,
    itemType: 'dining',
    itemId: resId,
    itemName: restaurant.name,
    category: 'dining',
    date: formattedDate,
    time: time,
    rawDate: date,
    rawTime: time,
    durationHours: 2, // Standard dining slot
    guests: guests,
    pricePaid: 0,
    pointsUsed: 0,
    pointsEarned: pointsEarned,
    status: 'active'
  };

  state.reservations.unshift(newBooking);
  state.user.points += pointsEarned;
  state.user.pointsHistory.unshift({
    description: `Dining Reservation Bonus: ${restaurant.name}`,
    amount: pointsEarned,
    type: 'earned',
    date: new Date().toLocaleDateString()
  });

  // Notify via concierge chat
  state.chatMessages.push({
    id: `dining-chat-${Date.now()}`,
    sender: 'bot',
    text: `Table confirmed for ${guests} guests at ${restaurant.name} on ${formattedDate} at ${time}. Enjoy your dining experience! (Earned +50 loyalty points)`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveState();
  
  // Show custom success screen in checkout modal overlay
  const modal = document.getElementById('checkout-modal');
  document.getElementById('modal-form-view').style.display = 'none';
  document.getElementById('modal-success-view').style.display = 'block';

  document.getElementById('success-receipt-item').textContent = restaurant.name;
  document.getElementById('success-receipt-datetime').textContent = `${formattedDate} @ ${time}`;
  
  const durationLabel = document.querySelector('#success-receipt-duration').previousElementSibling;
  if (durationLabel) {
    durationLabel.textContent = 'Party Size';
  }
  document.getElementById('success-receipt-duration').textContent = `${guests} Guests`;
  document.getElementById('success-receipt-payment').textContent = 'Complimentary';
  document.getElementById('success-receipt-total').textContent = '$0.00';
  document.getElementById('success-receipt-points').textContent = `+${pointsEarned} Points`;
  
  modal.classList.add('open');
}

// ==========================================================================
// VIEW 4: GUEST DASHBOARD
// ==========================================================================
function renderDashboard(container) {
  // Points History ledger rendering
  let ledgerHTML = '';
  if (state.user.pointsHistory.length === 0) {
    ledgerHTML = `<div style="text-align:center; padding: 20px; font-size: 0.85rem; color: var(--color-gray-dark);">No points transactions yet.</div>`;
  } else {
    state.user.pointsHistory.forEach(item => {
      const amountSign = item.type === 'earned' ? `+${item.amount}` : `-${item.amount}`;
      const amountClass = item.type === 'earned' ? 'earned' : 'spent';
      ledgerHTML += `
        <div class="ledger-item">
          <div class="ledger-desc">
            <h5>${item.description}</h5>
            <span>${item.date}</span>
          </div>
          <span class="ledger-amount ${amountClass}">${amountSign} pts</span>
        </div>
      `;
    });
  }

  // Active reservations rendering (split into Upcoming and Past)
  const activeBookings = state.reservations.filter(r => r.status === 'active');
  const upcomingBookings = activeBookings.filter(b => !isReservationPast(b));
  const pastBookings = activeBookings.filter(b => isReservationPast(b));
  
  let upcomingBookingsHTML = '';
  if (upcomingBookings.length === 0) {
    upcomingBookingsHTML = `
      <div class="no-bookings">
        <i data-lucide="calendar-x" style="width:48px;height:48px;"></i>
        <h4>No Upcoming Reservations</h4>
        <p>You do not have any upcoming amenity bookings or dining reservations scheduled.</p>
        <button class="btn-primary" id="btn-dashboard-start">Browse Amenities</button>
      </div>
    `;
  } else {
    upcomingBookings.forEach(booking => {
      let priceText = 'Complimentary';
      if (booking.pricePaid > 0) {
        const payMethodLabel = booking.paymentMethod || 'Room Charge (Suite 304)';
        priceText = `$${booking.pricePaid.toFixed(2)} <span style="font-size:0.7rem; color:var(--color-gray-dark); display:block; font-weight:400; text-align:right;">via ${payMethodLabel}</span>`;
      }
      const categoryLabel = booking.category === 'dining' ? 'Dining Reservation' : (booking.category === 'pool-beach' ? 'Beach & Pool' : 'Sports Equipment');
      
      let detailSnippet = '';
      if (booking.itemType === 'dining') {
        detailSnippet = `<div class="ticket-detail-item"><span>Guests</span><strong>${booking.guests} Guests</strong></div>`;
      } else {
        detailSnippet = `<div class="ticket-detail-item"><span>Duration</span><strong>${booking.durationHours} Hours</strong></div>`;
      }

      upcomingBookingsHTML += `
        <div class="ticket-card view-transition">
          <div class="ticket-strip ${booking.category}"></div>
          <div class="ticket-body">
            <div class="ticket-info">
              <span class="ticket-meta">${categoryLabel}</span>
              <h4>${booking.itemName}</h4>
              <div class="ticket-details">
                <div class="ticket-detail-item">
                  <span>Schedule</span>
                  <strong>${booking.date} @ ${booking.time}</strong>
                </div>
                ${detailSnippet}
              </div>
            </div>
            <div class="ticket-actions">
              <div class="ticket-price ${booking.pricePaid === 0 ? 'free' : ''}">${priceText}</div>
              <button class="btn-cancel" data-id="${booking.id}">Cancel Booking</button>
            </div>
          </div>
        </div>
      `;
    });
  }

  let pastBookingsHTML = '';
  if (pastBookings.length === 0) {
    pastBookingsHTML = `
      <div class="no-bookings" style="padding: 30px; border: 1px dashed var(--color-sand-dark); background: transparent; box-shadow: none;">
        <p style="font-size: 0.95rem; color: var(--color-gray-dark);">No past reservations found.</p>
      </div>
    `;
  } else {
    pastBookings.forEach(booking => {
      let priceText = 'Complimentary';
      if (booking.pricePaid > 0) {
        const payMethodLabel = booking.paymentMethod || 'Room Charge (Suite 304)';
        priceText = `$${booking.pricePaid.toFixed(2)} <span style="font-size:0.7rem; color:var(--color-gray-dark); display:block; font-weight:400; text-align:right;">via ${payMethodLabel}</span>`;
      }
      const categoryLabel = booking.category === 'dining' ? 'Dining Reservation' : (booking.category === 'pool-beach' ? 'Beach & Pool' : 'Sports Equipment');
      
      let detailSnippet = '';
      if (booking.itemType === 'dining') {
        detailSnippet = `<div class="ticket-detail-item"><span>Guests</span><strong>${booking.guests} Guests</strong></div>`;
      } else {
        detailSnippet = `<div class="ticket-detail-item"><span>Duration</span><strong>${booking.durationHours} Hours</strong></div>`;
      }

      pastBookingsHTML += `
        <div class="ticket-card view-transition" style="opacity: 0.85; filter: grayscale(10%);">
          <div class="ticket-strip ${booking.category}" style="opacity: 0.7;"></div>
          <div class="ticket-body">
            <div class="ticket-info">
              <span class="ticket-meta">${categoryLabel}</span>
              <h4>${booking.itemName}</h4>
              <div class="ticket-details">
                <div class="ticket-detail-item">
                  <span>Schedule</span>
                  <strong>${booking.date} @ ${booking.time}</strong>
                </div>
                ${detailSnippet}
              </div>
            </div>
            <div class="ticket-actions">
              <div class="ticket-price ${booking.pricePaid === 0 ? 'free' : ''}">${priceText}</div>
              <span class="badge completed">Completed</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <div class="view-transition">
      <div class="section-header">
        <h2>Guest Dashboard</h2>
        <p>Manage your upcoming reservations, view your active tier, and review loyalty points transactions.</p>
      </div>

      <div class="dashboard-layout">
        <!-- Sidebar profile / points info -->
        <div class="dashboard-sidebar">
          <div class="profile-card">
            <div class="profile-avatar">${state.user.name.charAt(0).toUpperCase()}</div>
            <h3>${state.user.name}</h3>
            <span class="member-tier">${getUserTier(state.user.points)}</span>
            
            <div class="profile-stats">
              <div class="p-stat">
                <h4>${state.user.points}</h4>
                <span>Points Balance</span>
              </div>
              <div class="p-stat">
                <h4>Room 304</h4>
                <span>Active Suite</span>
              </div>
            </div>
          </div>

          <div class="points-ledger">
            <h3><i data-lucide="list-ordered" style="width:18px;height:18px;color:var(--color-gold-metallic);"></i> Rewards ledger</h3>
            <div class="ledger-list">
              ${ledgerHTML}
            </div>
          </div>
        </div>

        <!-- Main schedule column -->
        <div class="reservations-container">
          <div class="reservations-header">
            <h3>Upcoming Reservations</h3>
          </div>
          <div class="reservations-list" style="margin-bottom: 35px;">
            ${upcomingBookingsHTML}
          </div>
          
          <div class="reservations-header">
            <h3>Past Reservations</h3>
          </div>
          <div class="reservations-list">
            ${pastBookingsHTML}
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  const btnStart = document.getElementById('btn-dashboard-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => switchView('booking'));
  }

  // Cancel reservation handlers
  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      handleCancelReservation(id);
    });
  });
}

function handleCancelReservation(bookingId) {
  if (!confirm('Are you sure you want to cancel this reservation? Any loyalty points spent will be refunded.')) {
    return;
  }

  const booking = state.reservations.find(r => r.id === bookingId);
  if (!booking) return;

  booking.status = 'cancelled';

  // Refund points spent
  if (booking.pointsUsed > 0) {
    state.user.points += booking.pointsUsed;
    state.user.pointsHistory.unshift({
      description: `Refunded points: ${booking.itemName}`,
      amount: booking.pointsUsed,
      type: 'earned',
      date: new Date().toLocaleDateString()
    });
  }

  // Revoke points earned
  if (booking.pointsEarned > 0) {
    // Make sure points don't drop below 0
    state.user.points = Math.max(0, state.user.points - booking.pointsEarned);
    state.user.pointsHistory.unshift({
      description: `Revoked points (cancelled booking): ${booking.itemName}`,
      amount: booking.pointsEarned,
      type: 'spent',
      date: new Date().toLocaleDateString()
    });
  }

  // Send message from concierge about cancellation
  state.chatMessages.push({
    id: `cancel-chat-${Date.now()}`,
    sender: 'bot',
    text: `Your reservation for ${booking.itemName} on ${booking.date} has been cancelled successfully. Any points used have been credited back.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveState();
  switchView('dashboard');
}

// ==========================================================================
// VIEW 5: HELP & SUPPORT
// ==========================================================================
function renderHelp(container) {
  let faqHTML = '';
  FAQ.forEach((faq, index) => {
    faqHTML += `
      <div class="faq-item" id="faq-item-${index}">
        <div class="faq-question" data-index="${index}">
          <span>${faq.question}</span>
          <i data-lucide="chevron-down"></i>
        </div>
        <div class="faq-answer">
          <p>${faq.answer}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="view-transition">
      <div class="section-header">
        <h2>How Can We Assist You?</h2>
        <p>Browse our guest FAQ, message our concierge team, or log a maintenance/amenity service ticket below.</p>
      </div>

      <div class="help-layout">
        <div class="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div class="faq-accordion">
            ${faqHTML}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:30px;">
          <!-- Support Card -->
          <div class="support-card">
            <h3>Report an Issue / Service Ticket</h3>
            <p>Experiencing an issue with a pool daybed, bike, or room amenity? Submit a ticket and a butler will be dispatched.</p>
            <form class="support-form" id="support-form">
              <div class="input-group">
                <label>Room or Location</label>
                <input type="text" class="dining-input" id="support-location" placeholder="e.g. Room 304, South Beach, Main Pool" required>
              </div>
              <div class="input-group">
                <label>Contact Phone (Optional)</label>
                <input type="tel" class="dining-input" id="support-phone" placeholder="e.g. (555) 019-2834">
              </div>
              <div class="input-group">
                <label>Select Category</label>
                <select class="dining-select" id="support-category" required>
                  <option value="equipment">Faulty / Missing Equipment</option>
                  <option value="booking">Reservation & Points Issue</option>
                  <option value="towel">Towel & Housekeeping Service</option>
                  <option value="other">General Hospitality Inquiry</option>
                </select>
              </div>
              <div class="input-group">
                <label>Describe the Issue</label>
                <textarea class="support-textarea" id="support-message" placeholder="Please describe what is needed. Be as specific as possible..." required></textarea>
              </div>
              <button type="submit" class="btn-primary" style="width:100%;">Submit Ticket</button>
            </form>
          </div>

          <!-- Contact Information Card -->
          <div class="support-card" style="border-color: var(--color-gold-metallic); background: var(--color-gold-light);">
            <h3 style="color: var(--color-ocean-deep); margin-bottom: 12px; display:flex; align-items:center; gap:8px;"><i data-lucide="phone-call" style="width:20px;height:20px;color:var(--color-gold-metallic);"></i> Direct Contacts</h3>
            <p style="font-size:0.85rem; color: var(--color-ocean-medium); margin-bottom:15px;">Need immediate assistance or visiting in person? Reach out through our direct lines or lobby desks.</p>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.85rem;">
              <div style="display:flex; align-items:center; gap:8px; color: var(--color-ocean-deep);">
                <i data-lucide="phone" style="width:16px;height:16px;color:var(--color-gold-metallic);"></i>
                <span><strong>Front Desk / Host:</strong> (800) 555-HARLOW</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; color: var(--color-ocean-deep);">
                <i data-lucide="mail" style="width:16px;height:16px;color:var(--color-gold-metallic);"></i>
                <span><strong>Concierge Email:</strong> butler@theharlowhotel.com</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; color: var(--color-ocean-deep);">
                <i data-lucide="map-pin" style="width:16px;height:16px;color:var(--color-gold-metallic);"></i>
                <span><strong>Address:</strong> 1400 Shoreline Blvd, Coastal Haven, FL</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; color: var(--color-ocean-deep);">
                <i data-lucide="clock" style="width:16px;height:16px;color:var(--color-gold-metallic);"></i>
                <span><strong>Concierge hours:</strong> 24 Hours / 7 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Accordion Event Listeners
  document.querySelectorAll('.faq-question').forEach(header => {
    header.addEventListener('click', () => {
      const idx = header.getAttribute('data-index');
      const item = document.getElementById(`faq-item-${idx}`);
      
      const isOpen = item.classList.contains('open');
      
      // Close all first
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // Attach Support Form Listener
  document.getElementById('support-form').addEventListener('submit', handleSupportSubmit);
}

function handleSupportSubmit(e) {
  e.preventDefault();
  const location = document.getElementById('support-location').value.trim();
  const phone = document.getElementById('support-phone').value.trim();
  const category = document.getElementById('support-category').value;
  const message = document.getElementById('support-message').value.trim();

  // Create issue reservation ticket so it appears on dashboard as an inquiry? Or just create a support ticket confirmation.
  // We will push a concierge message and show user alert.
  const ticketId = `HW-T-${Math.floor(1000 + Math.random() * 9000)}`;

  let contactDetailsText = `Location: ${location}`;
  if (phone) {
    contactDetailsText += ` | Phone: ${phone}`;
  }

  state.chatMessages.push({
    id: `ticket-user-${Date.now()}`,
    sender: 'user',
    text: `[Support Ticket ${ticketId} - ${category}] ${contactDetailsText}. Issue: ${message}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  state.chatMessages.push({
    id: `ticket-bot-${Date.now()}`,
    sender: 'bot',
    text: `Support request recorded. Ticket reference: <strong>${ticketId}</strong>. Our guest services host has been dispatched to ${location}. Thank you for letting us know!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveState();
  
  alert(`Ticket Submitted!\nYour support ticket ${ticketId} has been logged. A concierge has been notified.`);
  
  // Clear form
  document.getElementById('support-form').reset();
  
  // Show the chat box
  toggleChat(true);
}

// ==========================================================================
// CHECKOUT / MODAL WORKFLOWS
// ==========================================================================
function openCheckout(amenityId, durationHours) {
  const item = AMENITIES.find(a => a.id === amenityId);
  if (!item) return;

  // Set pending state
  pendingBooking = {
    itemId: amenityId,
    durationHours: durationHours
  };

  const modal = document.getElementById('checkout-modal');
  const itemName = document.getElementById('modal-item-name');
  const cardTitle = document.getElementById('summary-card-title');
  const cardMeta = document.getElementById('summary-card-meta');
  const durationSpan = document.getElementById('summary-duration');
  const dateTimeSpan = document.getElementById('summary-datetime');

  itemName.textContent = `Confirm Reservation`;
  cardTitle.textContent = item.name;
  cardMeta.textContent = item.category === 'pool-beach' ? 'Pool & Beach Lounging' : 'Sports Equipment';
  durationSpan.textContent = `${durationHours} ${durationHours === 1 ? 'Hour' : 'Hours'}`;
  
  // Hourly rate info
  document.getElementById('summary-hourly-rate').textContent = item.pricePerHour === 0 ? 'Complimentary' : '$' + item.pricePerHour.toFixed(2) + '/hr';

  // Set default values for date & time selectors in the modal
  const dateInputField = document.getElementById('checkout-date-input');
  dateInputField.min = new Date().toISOString().split('T')[0];
  dateInputField.value = new Date().toISOString().split('T')[0];
  
  const timeSelectField = document.getElementById('checkout-time-select');
  timeSelectField.selectedIndex = 2; // Default to 10:00 AM

  // Reset payment option
  document.getElementById('checkout-payment-method').value = 'room-charge';
  document.getElementById('payment-card-details').style.display = 'none';
  document.getElementById('card-number').value = '';
  document.getElementById('card-expiry').value = '';
  document.getElementById('card-cvv').value = '';

  // Reset points checkbox and slider
  const usePointsCheckbox = document.getElementById('use-points-checkbox');
  usePointsCheckbox.checked = false;
  document.getElementById('points-slider-wrapper').classList.remove('active');

  document.getElementById('modal-form-view').style.display = 'block';
  document.getElementById('modal-success-view').style.display = 'none';

  recalculateCheckoutMath();

  // Open modal
  modal.classList.add('open');
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('open');
  pendingBooking = null;
}

function recalculateCheckoutMath() {
  if (!pendingBooking) return;

  const item = AMENITIES.find(a => a.id === pendingBooking.itemId);
  const duration = pendingBooking.durationHours;
  const subtotal = item.pricePerHour * duration;

  // Points redemption setup
  const usePointsCheckbox = document.getElementById('use-points-checkbox');
  const pointsSliderWrapper = document.getElementById('points-slider-wrapper');
  const checkoutPointsBalance = document.getElementById('checkout-points-balance');
  const pointsSlider = document.getElementById('points-checkout-slider');
  
  // Discount conversion: 100 points = $1.00
  const maxRedeemableCash = subtotal;
  const maxRedeemablePoints = maxRedeemableCash * 100;
  const userPoints = state.user.points;
  const sliderMax = Math.min(userPoints, maxRedeemablePoints);

  // Round sliderMax down to nearest 100 points
  const roundedSliderMax = Math.floor(sliderMax / 100) * 100;

  checkoutPointsBalance.textContent = `Available: ${userPoints} pts ($${(userPoints/100).toFixed(2)})`;
  
  if (roundedSliderMax >= 100 && usePointsCheckbox.checked) {
    pointsSliderWrapper.classList.add('active');
    pointsSlider.max = roundedSliderMax;
    pointsSlider.value = Math.min(parseInt(pointsSlider.value) || 0, roundedSliderMax);
    
    // Set step to 100 points
    pointsSlider.step = 100;
  } else {
    pointsSliderWrapper.classList.remove('active');
    pointsSlider.value = 0;
  }

  const redeemedPoints = usePointsCheckbox.checked ? parseInt(pointsSlider.value) : 0;
  const discount = redeemedPoints / 100;
  const total = Math.max(0, subtotal - discount);

  // Points earned:
  // Paid booking: 10 points per dollar of actual cash paid
  // Free booking or fully covered by points: flat 50 participation points!
  let pointsToEarn = 0;
  if (total > 0) {
    pointsToEarn = Math.round(total * 10);
  } else {
    pointsToEarn = 50; // flat participation reward for free bookings
  }

  // Update UI values
  document.getElementById('points-slider-val').textContent = redeemedPoints;
  document.getElementById('points-discount-val').textContent = `$${discount.toFixed(2)}`;
  
  document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  
  const discountRow = document.getElementById('checkout-points-discount-row');
  if (discount > 0) {
    discountRow.style.display = 'table-row';
    document.getElementById('checkout-discount').textContent = `-$${discount.toFixed(2)}`;
  } else {
    discountRow.style.display = 'none';
  }
  
  document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
  document.getElementById('points-to-earn').textContent = pointsToEarn;

  // Capture values from date and time selectors in the modal
  const dateVal = document.getElementById('checkout-date-input').value;
  const timeVal = document.getElementById('checkout-time-select').value;
  let dateFormatted = 'Today';
  if (dateVal) {
    dateFormatted = new Date(dateVal + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Save calculated properties back to temporary state
  pendingBooking.subtotal = subtotal;
  pendingBooking.pointsUsed = redeemedPoints;
  pendingBooking.pricePaid = total;
  pendingBooking.pointsEarned = pointsToEarn;
  pendingBooking.dateStr = dateFormatted;
  pendingBooking.timeVal = timeVal;
  pendingBooking.rawDate = dateVal;
  pendingBooking.rawTime = timeVal;
}

function handleConfirmBooking() {
  if (!pendingBooking) return;

  const dateVal = document.getElementById('checkout-date-input').value;
  if (!dateVal) {
    alert('Please select a booking date.');
    return;
  }

  const paymentMethod = document.getElementById('checkout-payment-method').value;
  let paymentReceipt = 'Room Charge (Suite 304)';
  
  if (paymentMethod === 'credit-card') {
    const cardNum = document.getElementById('card-number').value.trim();
    const cardExp = document.getElementById('card-expiry').value.trim();
    const cardCvv = document.getElementById('card-cvv').value.trim();
    if (!cardNum || !cardExp || !cardCvv) {
      alert('Please fill out all credit card details.');
      return;
    }
    // Mask the card number showing only the last 4 digits
    const cleanNum = cardNum.replace(/\s+/g, '');
    const lastDigits = cleanNum.slice(-4) || '4242';
    paymentReceipt = `Visa (*${lastDigits})`;
  } else if (paymentMethod === 'apple-pay') {
    paymentReceipt = 'Apple Pay';
  }

  const item = AMENITIES.find(a => a.id === pendingBooking.itemId);

  const formattedBooking = {
    id: `res-amenity-${Date.now()}`,
    itemType: 'amenity',
    itemId: pendingBooking.itemId,
    itemName: item.name,
    category: item.category,
    date: pendingBooking.dateStr,
    time: pendingBooking.timeVal,
    rawDate: pendingBooking.rawDate,
    rawTime: pendingBooking.rawTime,
    durationHours: pendingBooking.durationHours,
    pricePaid: pendingBooking.pricePaid,
    pointsUsed: pendingBooking.pointsUsed,
    pointsEarned: pendingBooking.pointsEarned,
    paymentMethod: paymentReceipt,
    status: 'active'
  };

  // 1. Deduct points used
  if (pendingBooking.pointsUsed > 0) {
    state.user.points -= pendingBooking.pointsUsed;
    state.user.pointsHistory.unshift({
      description: `Redeemed points on booking: ${item.name}`,
      amount: pendingBooking.pointsUsed,
      type: 'spent',
      date: new Date().toLocaleDateString()
    });
  }

  // 2. Add points earned
  state.user.points += pendingBooking.pointsEarned;
  state.user.pointsHistory.unshift({
    description: `Earned points on booking: ${item.name}`,
    amount: pendingBooking.pointsEarned,
    type: 'earned',
    date: new Date().toLocaleDateString()
  });

  // 3. Add to reservations list
  state.reservations.unshift(formattedBooking);

  // 4. Send chat message confirmation
  state.chatMessages.push({
    id: `booking-chat-${Date.now()}`,
    sender: 'bot',
    text: `Booking confirmed: ${item.name} for ${pendingBooking.durationHours} hours on ${formattedBooking.date} at ${formattedBooking.time}. Total price: $${pendingBooking.pricePaid.toFixed(2)}. Earned +${pendingBooking.pointsEarned} loyalty points!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveState();
  
  // Show custom success screen in checkout modal overlay instead of closing and alerting
  document.getElementById('modal-form-view').style.display = 'none';
  document.getElementById('modal-success-view').style.display = 'block';

  document.getElementById('success-receipt-item').textContent = item.name;
  document.getElementById('success-receipt-datetime').textContent = `${formattedBooking.date} @ ${formattedBooking.time}`;
  
  const durationLabel = document.querySelector('#success-receipt-duration').previousElementSibling;
  if (durationLabel) {
    durationLabel.textContent = 'Duration';
  }
  document.getElementById('success-receipt-duration').textContent = `${pendingBooking.durationHours} ${pendingBooking.durationHours === 1 ? 'Hour' : 'Hours'}`;
  document.getElementById('success-receipt-payment').textContent = formattedBooking.paymentMethod;
  document.getElementById('success-receipt-total').textContent = `$${formattedBooking.pricePaid.toFixed(2)}`;
  document.getElementById('success-receipt-points').textContent = `+${formattedBooking.pointsEarned} Points`;
}

// ==========================================================================
// CONCIERGE CHAT WIDGET LOGIC & SIMULATED CHATBOT
// ==========================================================================
function toggleChat(forceOpen = null) {
  const panel = document.getElementById('chat-window-panel');
  const badge = document.getElementById('chat-unread-badge');
  
  const isOpen = forceOpen !== null ? forceOpen : !panel.classList.contains('open');
  
  if (isOpen) {
    panel.classList.add('open');
    badge.style.display = 'none'; // Clear unread notifications
    // Scroll messages log to bottom
    const container = document.getElementById('chat-messages-container');
    container.scrollTop = container.scrollHeight;
  } else {
    panel.classList.remove('open');
  }
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  container.innerHTML = state.chatMessages.map(msg => `
    <div class="chat-bubble ${msg.sender}">
      ${msg.text}
      <span class="time">${msg.timestamp}</span>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function handleSendMessage() {
  const input = document.getElementById('chat-input-field');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  const newMsg = {
    id: `msg-user-${Date.now()}`,
    sender: 'user',
    text: text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  state.chatMessages.push(newMsg);
  renderChatMessages();
  saveState();

  // Bot Reply Simulation (Typing delay)
  simulateBotResponse(text);
}

function simulateBotResponse(userText) {
  const normalizedText = userText.toLowerCase();
  let replyText = '';

  if (normalizedText.includes('point') || normalizedText.includes('reward') || normalizedText.includes('earn')) {
    replyText = `At The Harlow, you earn loyalty points for everything you book! \n\n• Signup bonus: <strong>500 points</strong>. \n• Paid rentals: earn <strong>10% back in points</strong> (10 points per dollar cash spent). \n• Free rentals & dining: earn a flat <strong>50 points</strong> participation bonus. \n• Redemptions: 100 points = $1.00 off any reservation. You can apply points during checkout using the slider.`;
  } else if (normalizedText.includes('limit') || normalizedText.includes('hour') || normalizedText.includes('time')) {
    replyText = `To make sure all guests can access pool and beach amenities, we implement the following reservation time limits:\n\n• Pool & Beach Cabanas/Chairs: <strong>3 hours maximum</strong>.\n• Bicycles: <strong>2 hours maximum</strong>.\n• Surfboards, Kayaks, Paddleboards: <strong>1 hour maximum</strong>.\n• Basketballs, Tennis, Shuffleboard: <strong>2 hours maximum</strong>.`;
  } else if (normalizedText.includes('cancel') || normalizedText.includes('refund')) {
    replyText = `You can easily cancel reservations through your **Guest Dashboard** up to 2 hours before the start time. A full refund (including any points redeemed) will be credited to your points balance immediately.`;
  } else if (normalizedText.includes('towel') || normalizedText.includes('pool') || normalizedText.includes('beach')) {
    replyText = `Fresh resort towels are provided complimentary at both the main infinity pool desk and our shoreline beach kiosks. Towel service is included with all chairs and cabana bookings.`;
  } else if (normalizedText.includes('dress') || normalizedText.includes('wear') || normalizedText.includes('clothing')) {
    replyText = `Our restaurants have the following dress codes:\n\n• **Coastal Oasis**: Resort Elegant (collared shirts, sundresses, sandals welcome; no wet swimwear).\n• **The Pelican**: Casual / swimwear with cover-up.\n• **Harlow's Steakhouse**: Smart Casual / Semi-Formal (jackets optional, closed-toe shoes preferred).`;
  } else if (normalizedText.includes('issue') || normalizedText.includes('broken') || normalizedText.includes('wrong') || normalizedText.includes('help')) {
    replyText = `I apologize for any inconvenience! I have alerted our guest relations manager. Please let me know your room number and exact location (e.g. pool cabana #4) and we will send a butler immediately.`;
  } else {
    replyText = `Thank you for your message. Our beach concierge has been notified and will text you back shortly at this portal. In the meantime, you can explore the FAQ tab or use the quick links in the chat window.`;
  }

  // Create typing status
  setTimeout(() => {
    const container = document.getElementById('chat-messages-container');
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble bot typing';
    typingBubble.innerHTML = '<em>Typing...</em>';
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      // Remove typing bubble
      typingBubble.remove();
      
      const botMsg = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      state.chatMessages.push(botMsg);
      renderChatMessages();
      
      // Increment unread badge if chat panel is closed
      const panel = document.getElementById('chat-window-panel');
      if (!panel.classList.contains('open')) {
        const badge = document.getElementById('chat-unread-badge');
        badge.textContent = '1';
        badge.style.display = 'flex';
      }
      
      saveState();
    }, 800);
  }, 400);
}

// ==========================================================================
// APPLICATION INITIALIZATION & EVENT LEASHING
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial State Sync
  updateGlobalPills();
  switchView('overview');
  renderChatMessages();

  // 2. Global Event Bindings - Nav Items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      switchView(view);
    });
  });

  // Global links in footer
  document.querySelectorAll('.view-trigger').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
    });
  });

  // 3. Checkout Modal Checkbox & Slider Event Listeners
  const usePointsCheckbox = document.getElementById('use-points-checkbox');
  if (usePointsCheckbox) {
    usePointsCheckbox.addEventListener('change', recalculateCheckoutMath);
  }

  const pointsSlider = document.getElementById('points-checkout-slider');
  if (pointsSlider) {
    pointsSlider.addEventListener('input', recalculateCheckoutMath);
  }

  // Handle scheduling selector changes to re-calculate values
  const dateInput = document.getElementById('checkout-date-input');
  if (dateInput) {
    dateInput.addEventListener('change', recalculateCheckoutMath);
  }
  const timeSelect = document.getElementById('checkout-time-select');
  if (timeSelect) {
    timeSelect.addEventListener('change', recalculateCheckoutMath);
  }

  // Handle payment method toggles
  const paymentSelect = document.getElementById('checkout-payment-method');
  if (paymentSelect) {
    paymentSelect.addEventListener('change', (e) => {
      const cardDetails = document.getElementById('payment-card-details');
      if (e.target.value === 'credit-card') {
        cardDetails.style.display = 'flex';
      } else {
        cardDetails.style.display = 'none';
      }
    });
  }

  // Checkout buttons
  document.getElementById('modal-close-btn').addEventListener('click', closeCheckout);
  document.getElementById('checkout-cancel-btn').addEventListener('click', closeCheckout);
  document.getElementById('checkout-confirm-btn').addEventListener('click', handleConfirmBooking);

  // Success view close buttons
  const handleSuccessClose = () => {
    closeCheckout();
    switchView('dashboard');
  };
  document.getElementById('modal-success-close-btn').addEventListener('click', handleSuccessClose);
  document.getElementById('success-dashboard-btn').addEventListener('click', handleSuccessClose);

  // 4. Concierge Chat widget toggles
  document.getElementById('chat-trigger-btn').addEventListener('click', () => toggleChat());
  document.getElementById('chat-close-btn').addEventListener('click', () => toggleChat(false));
  
  // Chat typing handler
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input-field');

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }

  // FAQ quick clicks in chat
  document.getElementById('chat-quick-replies').addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-reply-btn');
    if (!btn) return;
    
    const faqIndex = parseInt(btn.getAttribute('data-faq'));
    let userText = '';
    
    if (faqIndex === 0) userText = 'How do loyalty rewards and points work?';
    else if (faqIndex === 1) userText = 'What are the reservation time limits?';
    else if (faqIndex === 2) userText = 'How do I cancel or modify a booking?';
    else if (faqIndex === 3) userText = 'I need to report an issue with pool or sports equipment.';

    // Send as user
    const userMsg = {
      id: `msg-user-faq-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.chatMessages.push(userMsg);
    renderChatMessages();
    saveState();

    simulateBotResponse(userText);
  });
  
  // 5. Open chat on clicking Points indicator (useful tip)
  document.getElementById('points-indicator').addEventListener('click', () => {
    switchView('dashboard');
  });

  document.getElementById('guest-avatar-pill').addEventListener('click', () => {
    switchView('dashboard');
  });
});
