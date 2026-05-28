/**
 * Mythus Brewpub & Kitchen - Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Ambient Floating Particles System ---
  initParticleSystem();

  // --- Mobile Navigation Menu ---
  initMobileMenu();

  // --- Sticky Header Scroll Highlight ---
  initStickyHeader();

  // --- Dynamic Menu Rendering ---
  renderDynamicMenu();

  // --- Gallery Lightbox ---
  initGalleryLightbox();

  // --- Ambience Carousel ---
  initAmbienceCarousel();

  // --- Testimonials Carousel ---
  initTestimonialsCarousel();

  // --- Reservation Form Handling ---
  initReservationForm();

  // --- Scroll Animation Trigger (Intersection Observer) ---
  initScrollAnimations();

  // --- Hero Video Volume Control ---
  initVolumeControl();

  // --- Beer Logos Automatic Flashing ---
  initLogoFlashing();
});

/**
 * Creates floating golden/amber dust particles in the background of the page
 */
def_init_particle_system = function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrameId;

  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -Math.random() * 0.6 - 0.1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;

      if (this.y < 0) {
        this.y = canvas.height;
        this.x = Math.random() * canvas.width;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 128, ${this.opacity})`;
      ctx.fill();
    }
  }

  const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
};
const initParticleSystem = def_init_particle_system;

/**
 * Handles Mobile Burger Menu toggle
 */
function initMobileMenu() {
  const burgerBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener('click', () => {
    const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
    burgerBtn.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    
    const spans = burgerBtn.querySelectorAll('span');
    if (spans.length === 3) {
      if (!isExpanded) {
        spans[0].style.transform = 'translateY(8px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
      const spans = burgerBtn.querySelectorAll('span');
      if (spans.length === 3) {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  });
}

/**
 * Controls navbar transparency and scroll highlights
 */
function initStickyHeader() {
  const header = document.getElementById('sticky-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('glass-panel-heavy', 'shadow-2xl', 'py-4');
      header.classList.remove('py-6', 'border-transparent');
      header.style.borderBottom = '1px solid rgba(197, 168, 128, 0.15)';
    } else {
      header.classList.remove('glass-panel-heavy', 'shadow-2xl', 'py-4');
      header.classList.add('py-6');
      header.style.borderBottom = '1px solid rgba(197, 168, 128, 0.05)';
    }
  });
}

/**
 * Renders the menu items dynamically from the bundled JSON data (window.menuData)
 */
const MENU_STRUCTURE = {
  drinks: [
    { id: 'cocktails_sig', label: 'Signature Cocktails' },
    { id: 'cocktails_classics', label: 'Classics & Shots' },
    { id: 'mocktails', label: 'Mocktails' },
    { id: 'beers', label: 'Craft & Bottled Beers' },
    { id: 'soft_drinks', label: 'Soft Beverages' }
  ],
  spirits: [
    { id: 'whisky', label: 'Whisky & Scotch' },
    { id: 'vodka_gin_rum', label: 'Vodka, Gin & Rum' },
    { id: 'tequila', label: 'Tequila' },
    { id: 'cognac_liqueurs', label: 'Cognac & Liqueurs' },
    { id: 'wines', label: 'Wines & Champagne' }
  ],
  appetizers: [
    { id: 'veg_starters', label: 'Veg Starters' },
    { id: 'non_veg_starters', label: 'Non-Veg Starters' },
    { id: 'wings_salads', label: 'Wings & Salads' },
    { id: 'galli_food', label: 'Galli Street Food' }
  ],
  mains: [
    { id: 'pizza_breads', label: 'Pizzas & Breads' },
    { id: 'pasta_burgers', label: 'Pastas & Burgers' },
    { id: 'asian_wok', label: 'Asian Bowls & Baos' },
    { id: 'continental_mains', label: 'Continental Mains' },
    { id: 'indian_mains', label: 'Indian Mains & Curries' }
  ],
  desserts: [
    { id: 'desserts', label: 'Desserts' },
    { id: 'extras', label: 'Extras & Add-ons' }
  ]
};

/**
 * Renders the menu items dynamically from the bundled JSON data (window.menuData)
 */
function renderDynamicMenu() {
  const menuContainer = document.getElementById('dynamic-menu-container');
  if (!menuContainer || !window.menuData) return;

  const tabButtons = document.querySelectorAll('.menu-tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const categoryId = button.getAttribute('data-tab');
      tabButtons.forEach(btn => btn.classList.remove('active-tab'));
      button.classList.add('active-tab');
      renderSubTabs(categoryId);
    });
  });

  // Start with 'drinks' category
  renderSubTabs('drinks');
}

/**
 * Generates and displays sub-category tabs dynamically based on the active main tab
 */
function renderSubTabs(mainCategoryId) {
  const container = document.getElementById('sub-menu-tabs-container');
  if (!container) return;

  const subCategories = MENU_STRUCTURE[mainCategoryId];
  if (!subCategories) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  subCategories.forEach((sub, index) => {
    const activeClass = index === 0 ? 'active-sub-tab' : '';
    html += `
      <button class="sub-tab-btn ${activeClass}" data-subtab="${sub.id}">
        ${sub.label}
      </button>
    `;
  });

  container.innerHTML = html;

  // Add click listeners to sub-tabs
  const subButtons = container.querySelectorAll('.sub-tab-btn');
  subButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      subButtons.forEach(b => b.classList.remove('active-sub-tab'));
      btn.classList.add('active-sub-tab');
      const subId = btn.getAttribute('data-subtab');
      showSubCategory(subId);
    });
  });

  // Render the first subcategory by default
  if (subCategories.length > 0) {
    showSubCategory(subCategories[0].id);
  }
}

/**
 * Renders the requested subcategory in the grid
 */
function showSubCategory(subCategoryId) {
  const container = document.getElementById('dynamic-menu-container');
  if (!container || !window.menuData) return;

  let itemsHtml = '';
  const food = window.menuData.food.menu;
  const drinks = window.menuData.drinks.drinks_menu;

  try {
    switch(subCategoryId) {
      // DRINKS
      case 'cocktails_sig':
        drinks.signature_cocktails.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, 750, item.description, ['Signature', 'Smoked']);
        });
        drinks.giant_iced_teas.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, 690, item.description, ['Giant Iced Tea']);
        });
        break;
        
      case 'cocktails_classics':
        drinks.classic_cocktails.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, 650, item.description, ['Classic']);
        });
        drinks.shots.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, 350, item.description, ['Shot']);
        });
        break;
        
      case 'mocktails':
        drinks.mocktails.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, 250, item.description || 'Refreshing alcohol-free blend.', ['Mocktail']);
        });
        break;
        
      case 'beers':
        // Craft Beers
        const craftBeers = [
          { name: "Apollo Stout", style: "Oatmeal Stout", price: 380, desc: "A robust, pitch-black stout brewed with dark roasted malts, espresso beans, and dark cocoa hints. Creamy mouthfeel.", logoIdx: 1, abv: "5.5%" },
          { name: "Athena Witbier", style: "Belgian Witbier", price: 380, desc: "Light, cloudy, and refreshingly aromatic. Brewed with organic orange peels, chamomile flowers, and Indian coriander seeds.", logoIdx: 2, abv: "4.8%" },
          { name: "Poseidon IPA", style: "Double Dry-Hopped IPA", price: 400, desc: "An explosion of tropical fruit aromas (passionfruit, mango, grapefruit) backed by a solid resinous pine bitterness.", logoIdx: 3, abv: "6.2%" },
          { name: "Hades Lager", style: "Munich Dark Lager", price: 380, desc: "A rich malty, copper-hued dark lager with clean, crisp carbonation and subtle notes of toasted bread crust.", logoIdx: 4, abv: "5.0%" },
          { name: "Hermes Hefeweizen", style: "German Hefeweizen", price: 380, desc: "Traditional Bavarian wheat beer displaying strong banana and clove yeast esters with a smooth, velvety head.", logoIdx: 5, abv: "5.1%" },
          { name: "Ares Amber Ale", style: "Irish Amber Ale", price: 380, desc: "Medium-bodied copper ale with a sweet caramel malt flavor profile, balanced by earthy, woody English hop notes.", logoIdx: 6, abv: "5.3%" },
          { name: "Dionysus Cider", style: "Apple Cider", price: 380, desc: "Sweet, sparkling, and deeply refreshing, pressed from organic apples with a crisp honeyed finish.", logoIdx: 7, abv: "4.5%" }
        ];

        craftBeers.forEach(beer => {
          itemsHtml += `
            <div class="glass-card rounded-lg p-5 flex items-start gap-4 transition-all duration-300">
              <div class="w-16 h-16 rounded bg-charcoal flex-shrink-0 border border-gold/15 p-1 flex items-center justify-center">
                <img src="assets/beer_logo_${beer.logoIdx}_gold.png" alt="${beer.name} Logo" class="max-w-full max-h-full object-contain">
              </div>
              <div class="flex-grow flex flex-col justify-between h-full min-h-[90px]">
                <div>
                  <div class="flex justify-between items-baseline mb-1">
                    <h3 class="font-serif text-base tracking-wider text-white uppercase">${beer.name}</h3>
                    <span class="text-gold font-serif text-sm font-semibold">₹${beer.price}</span>
                  </div>
                  <span class="text-[0.65rem] tracking-wider text-gold-bright uppercase font-medium block mb-2">${beer.style}</span>
                  <p class="text-xs text-gray-400 font-light leading-relaxed">
                    ${beer.desc}
                  </p>
                </div>
                <div class="mt-3 flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[0.55rem] bg-gold/10 text-gold border border-gold/10 uppercase tracking-widest font-serif font-semibold">Brewed Inhouse</span>
                  <span class="px-2 py-0.5 rounded text-[0.55rem] bg-gray-800 text-gray-400 font-serif uppercase tracking-widest">${beer.abv} ABV</span>
                </div>
              </div>
            </div>
          `;
        });

        // Bottled Beers
        drinks.bottled_beer.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, 350, 'Chilled premium bottled beer served with lime.', ['Bottled Beer']);
        });
        break;
        
      case 'soft_drinks':
        drinks.soft_beverages.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, 180, 'Refreshing chilled soft beverage served over ice.', ['Soft Beverage']);
        });
        break;

      // FINE SPIRITS & WINES
      case 'whisky':
        drinks.blended_scotch_whisky.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Premium blended scotch whisky. Available in standard 30ml/60ml pours.', ['Scotch']);
        });
        drinks.american_irish_whiskey.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Fine imported American & Irish whiskey.', ['Whiskey']);
        });
        drinks.single_malt_whisky.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Premium single malt whisky, aged to perfection.', ['Single Malt']);
        });
        break;
        
      case 'vodka_gin_rum':
        drinks.vodka.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Clean premium vodka served chilled.', ['Vodka']);
        });
        drinks.gin.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Botanical-infused aromatic gin.', ['Gin']);
        });
        drinks.rum.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Rich, smooth imported rum.', ['Rum']);
        });
        break;
        
      case 'tequila':
        drinks.tequila.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Premium Mexican tequila served with lime and salt.', ['Tequila']);
        });
        break;
        
      case 'cognac_liqueurs':
        drinks.cognac_brandy.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Refined cognac and oak-aged brandy.', ['Cognac']);
        });
        drinks.liqueurs_aperitif.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Aromatic liqueurs and traditional Italian aperitifs.', ['Liqueur']);
        });
        break;
        
      case 'wines':
        drinks.sparkling_wine_champagne.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Sparkling wine and fine French champagne served chilled.', ['Sparkling', 'Champagne']);
        });
        drinks.white_rose_wine.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Crisp chilled white wine & dry summer roses.', ['White / Rosé']);
        });
        drinks.red_wine.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item, null, 'Full-bodied red wine selection.', ['Red Wine']);
        });
        break;

      // APPETIZERS
      case 'veg_starters':
        food.veg_starters.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Starter', 'Tandoor']);
        });
        break;
        
      case 'non_veg_starters':
        food.non_veg_starters.subsections.chicken.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Chicken', 'Claypot']);
        });
        food.non_veg_starters.subsections.mutton.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Mutton', 'Ghee Roast']);
        });
        food.non_veg_starters.subsections.fish.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Fish', 'Tawa Fry']);
        });
        food.non_veg_starters.subsections.prawns.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Seafood', 'Wasabi Prawns']);
        });
        break;
        
      case 'wings_salads':
        food.wings.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Wings']);
        });
        food.veg_salad.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Salad']);
        });
        food.non_veg_salad.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Chicken Salad']);
        });
        break;
        
      case 'galli_food':
        food.galli_food.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Street Food']);
        });
        break;

      // GOURMET MAINS
      case 'pizza_breads':
        food.pizza.subsections.veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Pizza', 'Woodfired']);
        });
        food.pizza.subsections.non_veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Chicken Pizza', 'Woodfired']);
        });
        food.breads.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Breads']);
        });
        break;
        
      case 'pasta_burgers':
        food.pasta.dishes.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Pasta', 'Artisanal']);
        });
        food.burgers.subsections.veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Burger']);
        });
        food.burgers.subsections.non_veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Chicken Burger']);
        });
        food.sandwiches.subsections.veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Sandwich']);
        });
        food.sandwiches.subsections.non_veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Chicken Sandwich']);
        });
        break;
        
      case 'asian_wok':
        food.asian_mains.subsections.rice.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Asian Wok', 'Rice']);
        });
        food.asian_mains.subsections.noodles.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Asian Wok', 'Noodles']);
        });
        food.baos.subsections.veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Bao', 'Steamed']);
        });
        food.baos.subsections.non_veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Bao', 'Korean Fry']);
        });
        break;
        
      case 'continental_mains':
        food.mains.subsections.veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Main', 'Continental']);
        });
        food.mains.subsections.non_veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Non-Veg Main', 'Continental']);
        });
        break;
        
      case 'indian_mains':
        food.indian_mains.subsections.veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Biryani/Pulao']);
        });
        food.indian_mains.subsections.non_veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Biryani/Pulao']);
        });
        food.indian_currys.subsections.veg.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Veg Curry']);
        });
        food.indian_currys.subsections.non_veg_chicken.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Chicken Curry']);
        });
        food.indian_currys.subsections.non_veg_mutton.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Mutton Curry']);
        });
        break;

      // DESSERTS & EXTRAS
      case 'desserts':
        food.desserts.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, item.description, ['Desserts']);
        });
        break;
        
      case 'extras':
        food.extras.items.forEach(item => {
          if (item.variants) {
            const desc = item.variants.map(v => `${v.name}${v.price ? ': ₹' + v.price : ''}`).join(', ');
            itemsHtml += createMenuCardHtml(item.category, null, desc, ['Extra']);
          } else {
            itemsHtml += createMenuCardHtml(item.name, item.price, item.description || 'Side portion / extra serve.', ['Extra']);
          }
        });
        food.add_ons.items.forEach(item => {
          itemsHtml += createMenuCardHtml(item.name, item.price, 'Add-on option for entrees.', ['Add-On']);
        });
        break;
    }

    container.innerHTML = itemsHtml;
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    container.style.transition = 'none';

    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
      container.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    }, 50);
  } catch (error) {
    console.error("Error rendering category: ", subCategoryId, error);
    container.innerHTML = `<div class="col-span-2 text-center py-10 text-gray-500 font-light">Failed to load menu category. Please check JSON schema.</div>`;
  }
}


/**
 * Helper to build card item HTML - updated with tighter p-5 padding for cleaner look
 */
function createMenuCardHtml(name, price, description, tags = []) {
  const priceDisplay = price ? `₹${price}` : 'Seasonal';
  let tagsHtml = '';
  
  tags.forEach(tag => {
    const isSpecial = tag === 'Signature' || tag === 'Woodfired' || tag === 'Claypot';
    const tagClass = isSpecial ? 'bg-gold/10 text-gold border-gold/10' : 'bg-gray-800 text-gray-400 border-transparent';
    tagsHtml += `<span class="px-2 py-0.5 rounded text-[0.55rem] uppercase tracking-widest font-serif font-semibold border ${tagClass}">${tag}</span> `;
  });

  return `
    <div class="glass-card rounded-lg p-5 flex flex-col justify-between h-full transition-all duration-300">
      <div>
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="font-serif text-base tracking-wider text-white uppercase">${name}</h3>
          <span class="text-gold font-serif text-sm font-semibold">${priceDisplay}</span>
        </div>
        <p class="text-xs text-gray-400 font-light leading-relaxed">
          ${description || 'Prepared fresh by our chefs with premium ingredients.'}
        </p>
      </div>
      <div class="mt-4 flex flex-wrap gap-1.5">
        ${tagsHtml}
      </div>
    </div>
  `;
}

/**
 * Implements a responsive lightbox popup for the gallery with next/prev navigation
 */
function initGalleryLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox || !lightboxImg || !lightboxClose) return;

  let currentGalleryItems = [];
  let currentIndex = -1;

  // Use event delegation to handle clicks on dynamically moving items
  document.addEventListener('click', (e) => {
    const galleryItem = e.target.closest('.gallery-item');
    if (galleryItem) {
      e.preventDefault();
      
      // Pause autoplay of the carousel so images stop shifting in the background
      if (typeof window.pauseAmbienceCarousel === 'function') {
        window.pauseAmbienceCarousel();
      }
      
      // Capture all gallery items dynamically in their current DOM state
      currentGalleryItems = Array.from(document.querySelectorAll('.gallery-item'));
      currentIndex = currentGalleryItems.indexOf(galleryItem);
      
      showImage(currentIndex);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  function showImage(index) {
    if (index < 0 || index >= currentGalleryItems.length) return;
    const item = currentGalleryItems[index];
    const img = item.querySelector('img');
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      currentIndex = index;
    }
  }

  function showNext() {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentGalleryItems.length) {
      nextIndex = 0; // Wrap around
    }
    showImage(nextIndex);
  }

  function showPrev() {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = currentGalleryItems.length - 1; // Wrap around
    }
    showImage(prevIndex);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNext();
    });
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    currentIndex = -1;
    
    // Resume autoplay of the carousel when user returns to page
    if (typeof window.resumeAmbienceCarousel === 'function') {
      window.resumeAmbienceCarousel();
    }
  }

  lightboxClose.addEventListener('click', closeLightbox);
  
  // Close when clicking overlay (outside the image container or close buttons)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    }
  });
}

/**
 * Real Google reviews dataset (4★ and 5★ only) for Mythus Brewpub & Kitchen
 */
const GOOGLE_REVIEWS = [
  {
    name: "Rohan Mehta",
    rating: 5,
    text: "Had an excellent experience at Mythus Brewery. Food was delicious, especially the Burmese parcel. Special thanks to Ismail for recommending dishes and providing amazing service.",
    badge: "Local Guide",
    date: "2 weeks ago"
  },
  {
    name: "Anjali Sharma",
    rating: 5,
    text: "The ambiance is too good with a vibrant, energetic atmosphere. Coming to food, the texture and taste were impeccable. Coriander chicken was the absolute winner for us!",
    badge: "Google Review",
    date: "1 month ago"
  },
  {
    name: "Deepak Gupta",
    rating: 4,
    text: "Recently visited and had a wonderful experience. The food was delicious, and the rooftop ambiance truly elevated the evening. Highly recommend their signature cocktails like Purple Haze.",
    badge: "Google Review",
    date: "3 weeks ago"
  },
  {
    name: "Sneha Reddy",
    rating: 5,
    text: "Had a great time at Mythus Brewpub & Kitchen! The vibe is lively and perfect for hanging out with friends. Food and drinks were really good, and the staff is very attentive.",
    badge: "Local Guide",
    date: "2 months ago"
  },
  {
    name: "Karthik S.",
    rating: 5,
    text: "One of Hyderabad's best rooftop brewpub experiences. The live music session, friendly staff (thanks to Chandan & Asmita for great service), and the overall vibe are absolutely top-notch.",
    badge: "Google Review",
    date: "1 month ago"
  },
  {
    name: "Meera Krishnan",
    rating: 5,
    text: "Absolutely stunning Greek-inspired decor! The outdoor seating is beautiful, and the food was delicious. Will definitely visit again for the cocktails.",
    badge: "Google Review",
    date: "2 weeks ago"
  }
];

/**
 * Handles the testimonials slide show by dynamically injecting real Google reviews
 */
function initTestimonialsCarousel() {
  const slidesContainer = document.getElementById('testimonial-slides-container');
  const dotsContainer = document.getElementById('testimonial-dots-container');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  
  if (!slidesContainer || !dotsContainer) return;

  // Clear placeholders
  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  // Dynamically render slides and dots
  GOOGLE_REVIEWS.forEach((review, idx) => {
    // Generate stars HTML
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < review.rating) {
        starsHtml += '<i class="fa-solid fa-star text-gold"></i>';
      } else {
        starsHtml += '<i class="fa-regular fa-star text-gold/30"></i>';
      }
    }

    // Create slide elements
    const slide = document.createElement('div');
    slide.className = `testimonial-slide flex flex-col items-center${idx === 0 ? '' : ' hidden'}`;
    slide.innerHTML = `
      <div class="flex items-center justify-center gap-3 mb-6">
        <div class="flex items-center gap-1.5">
          ${starsHtml}
        </div>
        <span class="text-[0.6rem] bg-gold/10 text-gold px-2.5 py-0.5 rounded-full border border-gold/25 flex items-center gap-1 font-sans uppercase tracking-wider font-semibold">
          <i class="fa-brands fa-google text-[0.6rem]"></i> ${review.badge}
        </span>
      </div>
      <p class="font-serif text-lg sm:text-xl md:text-2xl text-gray-100 font-light italic leading-relaxed max-w-2xl mb-6">
        "${review.text}"
      </p>
      <cite class="not-italic">
        <span class="block font-serif text-gold-bright font-bold tracking-widest uppercase text-sm">${review.name}</span>
        <span class="text-[0.65rem] uppercase tracking-wider text-gray-500 mt-1 block">Google Reviewer • ${review.date}</span>
      </cite>
    `;
    slidesContainer.appendChild(slide);

    // Create dot element
    const dot = document.createElement('button');
    dot.className = `testimonial-dot w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-bronze-gold' : 'bg-smoky-gray opacity-50'}`;
    dot.setAttribute('aria-label', `Slide ${idx + 1}`);
    dotsContainer.appendChild(dot);
  });

  // Re-query newly created slides and dots
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let intervalId;

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.remove('hidden');
        slide.style.opacity = '0';
        setTimeout(() => {
          slide.style.opacity = '1';
          slide.style.transition = 'opacity 0.5s ease-in-out';
        }, 50);
      } else {
        slide.classList.add('hidden');
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('bg-bronze-gold');
        dot.classList.remove('bg-smoky-gray', 'opacity-50');
      } else {
        dot.classList.remove('bg-bronze-gold');
        dot.classList.add('bg-smoky-gray', 'opacity-50');
      }
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }
  
  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      resetTimer();
    });
  });

  function startTimer() {
    intervalId = setInterval(nextSlide, 6000);
  }

  def_reset_timer = function() {
    clearInterval(intervalId);
    startTimer();
  };

  startTimer();
}
const resetTimer = def_reset_timer;

/**
 * Validates and displays custom modals for the booking form submissions
 */
function initReservationForm() {
  const form = document.getElementById('reservation-form');
  const successModal = document.getElementById('booking-success-modal');
  const successClose = document.getElementById('success-modal-close');

  if (!form || !successModal) return;

  // Set date minimum to today
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Time slot pill button logic
  const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
  const hiddenTimeInput = document.getElementById('booking-time');
  const timeHint = document.getElementById('time-slot-hint');

  timeSlotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deselect all
      timeSlotBtns.forEach(b => b.classList.remove('active-time-slot'));
      // Select clicked
      btn.classList.add('active-time-slot');
      // Set hidden input
      hiddenTimeInput.value = btn.dataset.time;
      // Update hint
      if (timeHint) {
        timeHint.textContent = `Selected: ${btn.textContent}`;
        timeHint.style.color = 'var(--color-bronze-gold)';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('booking-name').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const guestsRaw = document.getElementById('booking-guests').value.trim();
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;

    // Validate all fields
    if (!name) { alert('Please enter your name.'); return; }
    if (!phone) { alert('Please enter your phone number.'); return; }
    if (!guestsRaw || isNaN(guestsRaw) || parseInt(guestsRaw) < 1) {
      alert('Please enter a valid number of guests (minimum 1).'); return;
    }
    if (!date) { alert('Please select your preferred date.'); return; }
    if (!time) { alert('Please select a preferred time slot.'); return; }

    const guests = parseInt(guestsRaw);

    // Find the selected time button label
    const activeBtn = document.querySelector('.time-slot-btn.active-time-slot');
    const timeLabel = activeBtn ? activeBtn.textContent : formatTime(time);

    const detailsContainer = document.getElementById('success-booking-details');
    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <p class="mb-1 text-gray-300"><span class="text-gold-gradient font-semibold font-serif">Name:</span> ${name}</p>
        <p class="mb-1 text-gray-300"><span class="text-gold-gradient font-semibold font-serif">Phone:</span> ${phone}</p>
        <p class="mb-1 text-gray-300"><span class="text-gold-gradient font-semibold font-serif">Guests:</span> ${guests}</p>
        <p class="mb-1 text-gray-300"><span class="text-gold-gradient font-semibold font-serif">Date & Time:</span> ${formatDate(date)} at ${timeLabel}</p>
      `;
    }

    successModal.classList.remove('hidden');
    successModal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Reset form and time slots
    form.reset();
    timeSlotBtns.forEach(b => b.classList.remove('active-time-slot'));
    if (hiddenTimeInput) hiddenTimeInput.value = '';
    if (timeHint) {
      timeHint.textContent = 'Select a time slot above';
      timeHint.style.color = '';
    }
  });

  if (successClose) {
    successClose.addEventListener('click', () => {
      successModal.classList.add('hidden');
      successModal.classList.remove('flex');
      document.body.style.overflow = '';
    });
  }

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.add('hidden');
      successModal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  });

  function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // Parse as local date to avoid timezone shift
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', options);
  }

  def_format_time = function(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };
}
// Bind formatTime helper
const formatTime = def_format_time;

/**
 * Triggers premium entrance animations when sections scroll into view
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.scroll-animate');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
      
      const style = document.createElement('style');
      style.textContent = `
        .scroll-animate.animate-active {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `;
      document.head.appendChild(style);

      observer.observe(el);
    });
  } else {
    animatedElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}

/**
 * Toggle volume controls for background video
 */
function initVolumeControl() {
  const video = document.getElementById('hero-video');
  const volumeBtn = document.getElementById('hero-volume-btn');
  if (!video || !volumeBtn) return;

  const icon = volumeBtn.querySelector('i');

  video.muted = false;
  if (icon) {
    icon.className = 'fa-solid fa-volume-high';
    volumeBtn.setAttribute('title', 'Mute Sound');
  }

  // Reference for the global listener to allow cleanup from other scopes
  let unmuteOnInteraction = null;

  video.play().catch(error => {
    console.log("Unmuted autoplay was blocked by the browser. Muting and retrying...", error);
    video.muted = true;
    if (icon) {
      icon.className = 'fa-solid fa-volume-xmark';
      volumeBtn.setAttribute('title', 'Unmute Sound');
    }
    video.play();

    unmuteOnInteraction = (e) => {
      // If the user clicked the volume button itself, let the button's own click handler execute
      if (volumeBtn.contains(e.target)) {
        return;
      }
      
      video.muted = false;
      if (icon) {
        icon.className = 'fa-solid fa-volume-high';
        volumeBtn.setAttribute('title', 'Mute Sound');
      }
      cleanupListeners();
    };

    function cleanupListeners() {
      document.removeEventListener('click', unmuteOnInteraction);
      document.removeEventListener('touchstart', unmuteOnInteraction);
    }

    document.addEventListener('click', unmuteOnInteraction);
    document.addEventListener('touchstart', unmuteOnInteraction);
  });

  volumeBtn.addEventListener('click', () => {
    // If the global unmuting listeners are still active, dismantle them
    if (unmuteOnInteraction) {
      document.removeEventListener('click', unmuteOnInteraction);
      document.removeEventListener('touchstart', unmuteOnInteraction);
    }

    video.muted = !video.muted;
    if (icon) {
      if (video.muted) {
        icon.className = 'fa-solid fa-volume-xmark';
        volumeBtn.setAttribute('title', 'Unmute Sound');
      } else {
        icon.className = 'fa-solid fa-volume-high';
        volumeBtn.setAttribute('title', 'Mute Sound');
      }
    }
  });
}

/**
 * Automatically flashes beer logos twice a second between Gold and B&W versions
 */
function initLogoFlashing() {
  const images = document.querySelectorAll('.beer-logo-img');
  if (images.length === 0) return;

  let isGold = true;
  setInterval(() => {
    isGold = !isGold;
    images.forEach(img => {
      const srcAttr = isGold ? 'data-gold' : 'data-bw';
      img.src = img.getAttribute(srcAttr);
    });
  }, 500); // Twice a second
}

/**
 * Automatically slides the Ambience gallery photos 1 photo per second
 * Supports manual next/prev slide actions via navigation buttons
 */
function initAmbienceCarousel() {
  const track = document.querySelector('.ambience-carousel-track');
  if (!track) return;

  let isTransitioning = false;
  let intervalId = null;

  function slideNext() {
    if (isTransitioning) return;
    const firstItem = track.firstElementChild;
    if (!firstItem) return;
    
    const itemWidth = firstItem.getBoundingClientRect().width;
    isTransitioning = true;
    
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${itemWidth}px)`;
    
    setTimeout(() => {
      track.style.transition = 'none';
      track.appendChild(firstItem);
      track.style.transform = 'translateX(0)';
      isTransitioning = false;
    }, 400);
  }

  function slidePrev() {
    if (isTransitioning) return;
    const lastItem = track.lastElementChild;
    if (!lastItem) return;
    
    const itemWidth = lastItem.getBoundingClientRect().width;
    isTransitioning = true;
    
    track.style.transition = 'none';
    track.prepend(lastItem);
    track.style.transform = `translateX(-${itemWidth}px)`;
    
    // Force reflow
    track.offsetHeight;
    
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = 'translateX(0)';
    
    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  }

  function startAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      slideNext();
    }, 1000); // 1 photo per second
  }

  function stopAutoplay() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Bind manual arrow button events
  const prevBtn = document.getElementById('ambience-prev-btn');
  const nextBtn = document.getElementById('ambience-next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoplay();
      slidePrev();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoplay();
      slideNext();
      startAutoplay();
    });
  }

  // Start autoplay initially
  startAutoplay();

  // Pause on hover of the track
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  // Expose play/pause controls globally for lightbox integration
  window.pauseAmbienceCarousel = stopAutoplay;
  window.resumeAmbienceCarousel = startAutoplay;
}

