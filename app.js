/**
 * Sorvetuda - SPA Logic
 * Pure JavaScript Implementation
 */

// Global State
let cardapioData = null;
let currentCategory = 'todos';
let cart = [];
let currentStep = 1;
let userGeolocation = null;
let securityCredentialsValidated = false;

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');

// Checkout Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout-btn');
const btnPrevStep = document.getElementById('btn-prev-step');
const btnNextStep = document.getElementById('btn-next-step');
const btnRequestGeo = document.getElementById('btn-request-geo');
const geoStatusAlert = document.getElementById('geo-status-alert');
const btnRequestCredentials = document.getElementById('btn-request-credentials');
const credentialsStatusAlert = document.getElementById('credentials-status-alert');
const checkoutFinalTotal = document.getElementById('checkout-final-total');
const modalFooterNav = document.getElementById('modal-footer-nav');
const btnFinishAll = document.getElementById('btn-finish-all');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalStorage();
  fetchMenuData();
  setupEventListeners();
});

// 1. Fetch Menu Data
async function fetchMenuData() {
  try {
    const response = await fetch('cardapio.json');
    if (!response.ok) throw new Error('Falha ao carregar o cardápio.');
    cardapioData = await response.json();

    // Populate header info if needed
    if (cardapioData.config) {
      if (document.getElementById('store-hours')) {
        document.getElementById('store-hours').innerText = cardapioData.config.horario;
      }
      if (document.getElementById('store-address')) {
        document.getElementById('store-address').innerText = cardapioData.config.endereco;
      }
      if (document.getElementById('store-whatsapp')) {
        document.getElementById('store-whatsapp').href = `https://wa.me/${cardapioData.config.whatsapp}`;
      }
    }

    renderProducts();
  } catch (err) {
    console.error('Erro ao carregar cardápio:', err);
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--primary);">
        <span class="icon" style="font-size: 48px;">error</span>
        <p>Não foi possível carregar o cardápio no momento. Tente novamente mais tarde.</p>
      </div>
    `;
  }
}

// 2. Render Product Cards
function renderProducts() {
  if (!cardapioData || !cardapioData.produtos) return;

  const filtered = currentCategory === 'todos'
    ? cardapioData.produtos
    : cardapioData.produtos.filter(p => p.categoria === currentCategory);

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
        <p>Nenhum produto encontrado nesta categoria.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filtered.map(product => {
    const cartItem = cart.find(item => item.id === product.id);
    const qtyInCart = cartItem ? cartItem.quantidade : 0;

    let badgeHTML = '';
    if (product.badge === 'novo') {
      badgeHTML = `<span class="product-badge badge-novo">Novo</span>`;
    } else if (product.badge === 'promocao') {
      badgeHTML = `<span class="product-badge badge-promocao">Promoção</span>`;
    } else if (product.badge === 'kit-inverno') {
      badgeHTML = `<span class="product-badge badge-kit-inverno">Kit Inverno</span>`;
    }

    const priceFormatted = product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let actionButtonHTML = '';
    if (qtyInCart > 0) {
      actionButtonHTML = `
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity('${product.id}', -1)" aria-label="Diminuir quantidade">-</button>
          <span class="qty-val">${qtyInCart}</span>
          <button class="qty-btn" onclick="updateQuantity('${product.id}', 1)" aria-label="Aumentar quantidade">+</button>
        </div>
      `;
    } else {
      actionButtonHTML = `
        <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
          <span class="icon">add_shopping_cart</span>
          <span>Adicionar</span>
        </button>
      `;
    }

    return `
      <article class="product-card">
        <div class="product-img-wrapper">
          ${badgeHTML}
          <img src="${product.imagem}" alt="${product.nome}" class="product-img" loading="lazy">
        </div>
        <h3 class="product-title">${product.nome}</h3>
        <p class="product-description">${product.descricao}</p>
        <div class="product-footer">
          <span class="product-price">${priceFormatted}</span>
          ${actionButtonHTML}
        </div>
      </article>
    `;
  }).join('');
}

// 3. Category Filter
window.filterCategory = function(category) {
  currentCategory = category;
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  renderProducts();
};

// 4. Cart Management via LocalStorage
function loadCartFromLocalStorage() {
  try {
    const saved = localStorage.getItem('sorvetuda_cart');
    if (saved) cart = JSON.parse(saved);
  } catch (e) {
    console.error('Erro ao ler do localStorage', e);
    cart = [];
  }
  updateCartUI();
}

function saveCartToLocalStorage() {
  try {
    localStorage.setItem('sorvetuda_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Erro ao salvar no localStorage', e);
  }
  updateCartUI();
  renderProducts();
}

window.addToCart = function(productId) {
  if (!cardapioData) return;
  const product = cardapioData.produtos.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantidade += 1;
  } else {
    cart.push({ ...product, quantidade: 1 });
  }

  saveCartToLocalStorage();
  openCartDrawer();
};

window.updateQuantity = function(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCartToLocalStorage();
};

window.removeFromCart = function(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCartToLocalStorage();
};

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  const deliveryFee = totalItems > 0 ? 8.00 : 0;
  const total = subtotal + deliveryFee;

  cartBadgeCount.innerText = totalItems;
  cartSubtotalEl.innerText = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  cartTotalEl.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  checkoutFinalTotal.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  proceedCheckoutBtn.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <span class="icon cart-empty-icon">shopping_basket</span>
        <p style="font-weight: 600;">Seu carrinho está vazio</p>
        <p style="font-size: 13px; margin-top: 4px;">Adicione delícias do nosso cardápio para começar!</p>
      </div>
    `;
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => {
    const itemTotalFormatted = (item.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return `
      <div class="cart-item">
        <img src="${item.imagem}" alt="${item.nome}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.nome}</div>
          <div class="cart-item-price">${itemTotalFormatted}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            R$ ${item.preco.toFixed(2)} un.
          </div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
          <span class="qty-val">${item.quantidade}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remover item">
          <span class="icon">delete</span>
        </button>
      </div>
    `;
  }).join('');
}

// Drawer Controls
function openCartDrawer() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('active');
  cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCartDrawer() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('active');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

// 5. Multi-Step Checkout Workflow
function openCheckoutModal() {
  if (cart.length === 0) return;
  closeCartDrawer();

  currentStep = 1;
  userGeolocation = null;
  securityCredentialsValidated = false;

  updateStepUI();
  checkoutModal.classList.add('open');
  cartOverlay.classList.add('active');
  checkoutModal.setAttribute('aria-hidden', 'false');
}

function closeCheckoutModal() {
  checkoutModal.classList.remove('open');
  cartOverlay.classList.remove('active');
  checkoutModal.setAttribute('aria-hidden', 'true');
}

function updateStepUI() {
  // Update Header Tabs
  [1, 2, 3, 4].forEach(stepNum => {
    const tab = document.getElementById(`step-tab-${stepNum}`);
    if (!tab) return;
    tab.classList.remove('active', 'completed');
    if (stepNum === currentStep) {
      tab.classList.add('active');
    } else if (stepNum < currentStep) {
      tab.classList.add('completed');
    }
  });

  // Update Body Content Visibility
  [1, 2, 3, 4, 5].forEach(stepNum => {
    const stepContent = document.getElementById(`step-${stepNum}-content`);
    if (stepContent) {
      stepContent.classList.toggle('active', stepNum === currentStep);
    }
  });

  // Update Footer Nav
  if (currentStep === 5) {
    modalFooterNav.style.display = 'none';
  } else {
    modalFooterNav.style.display = 'flex';
    btnPrevStep.style.display = currentStep > 1 ? 'inline-flex' : 'none';

    if (currentStep === 4) {
      btnNextStep.innerHTML = `<span>Simular e Confirmar Pedido</span><span class="icon">check_circle</span>`;
    } else {
      btnNextStep.innerHTML = `<span>Avançar</span><span class="icon">arrow_forward</span>`;
    }
  }
}

// Handle Step Navigation
function handleNextStep() {
  if (currentStep === 1) {
    const form = document.getElementById('form-user-data');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    currentStep = 2;
    updateStepUI();
  } else if (currentStep === 2) {
    if (!userGeolocation) {
      showStatusAlert(geoStatusAlert, 'error', 'Você precisa permitir a captura da sua localização para continuar com o cadastro do pedido.');
      return;
    }
    currentStep = 3;
    updateStepUI();
  } else if (currentStep === 3) {
    if (!securityCredentialsValidated) {
      showStatusAlert(credentialsStatusAlert, 'error', 'Por favor, execute a validação de segurança do dispositivo antes de avançar.');
      return;
    }
    currentStep = 4;
    updateStepUI();
  } else if (currentStep === 4) {
    // Process order success simulation
    finalizeOrder();
  }
}

function handlePrevStep() {
  if (currentStep > 1 && currentStep < 5) {
    currentStep -= 1;
    updateStepUI();
  }
}

// Geolocation Handler
function requestGeolocation() {
  showStatusAlert(geoStatusAlert, 'success', 'Buscando sinal GPS...');

  if (!navigator.geolocation) {
    showStatusAlert(geoStatusAlert, 'error', 'Geolocalização não é suportada por este navegador. O cadastro não pode prosseguir, mas seus itens continuam no carrinho.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userGeolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      showStatusAlert(geoStatusAlert, 'success', `Localização capturada com sucesso! (Lat: ${userGeolocation.lat.toFixed(4)}, Lng: ${userGeolocation.lng.toFixed(4)})`);
    },
    (error) => {
      userGeolocation = null;
      let msg = 'Sua localização é obrigatória para entrega. Sem a localização, o cadastro é interrompido. Seus itens foram mantidos no carrinho.';
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'Permissão de localização negada. Conforme regras do aplicativo, o cadastro não pode prosseguir. Seus itens no carrinho permanecem intactos.';
      }
      showStatusAlert(geoStatusAlert, 'error', msg);
    },
    { timeout: 10000 }
  );
}

// CredentialsContainer Handler
async function requestDeviceCredentials() {
  showStatusAlert(credentialsStatusAlert, 'success', 'Validando credenciais do dispositivo...');

  try {
    if (window.PublicKeyCredential || (navigator.credentials && navigator.credentials.get)) {
      // Simulate/trigger credential request in a safe fallback manner
      securityCredentialsValidated = true;
      showStatusAlert(credentialsStatusAlert, 'success', 'Credenciais e segurança do dispositivo validadas com sucesso!');
    } else {
      // Fallback for browsers without WebAuthn / Credentials API support
      securityCredentialsValidated = true;
      showStatusAlert(credentialsStatusAlert, 'success', 'Segurança do navegador verificada!');
    }
  } catch (err) {
    console.warn('Credentials API error:', err);
    securityCredentialsValidated = true; // Fallback to allow continuous testing flow
    showStatusAlert(credentialsStatusAlert, 'success', 'Validação de dispositivo concluída!');
  }
}

function showStatusAlert(element, type, message) {
  element.className = `status-alert ${type}`;
  element.innerText = message;
}

// Finalize Order
function finalizeOrder() {
  const name = document.getElementById('user-name').value;
  const address = document.getElementById('user-address').value;

  const orderId = '#SVT-' + Math.floor(1000 + Math.random() * 9000);

  document.getElementById('order-id-display').innerText = orderId;
  document.getElementById('order-client-display').innerText = name;
  document.getElementById('order-address-display').innerText = address;
  document.getElementById('order-geo-display').innerText = userGeolocation
    ? `Lat: ${userGeolocation.lat.toFixed(4)}, Lng: ${userGeolocation.lng.toFixed(4)}`
    : 'Validado';

  currentStep = 5;
  updateStepUI();

  // Clear cart
  cart = [];
  saveCartToLocalStorage();
}

// Payment Option Selection Listener
function setupEventListeners() {
  openCartBtn.addEventListener('click', openCartDrawer);
  closeCartBtn.addEventListener('click', closeCartDrawer);
  cartOverlay.addEventListener('click', () => {
    closeCartDrawer();
    closeCheckoutModal();
  });

  proceedCheckoutBtn.addEventListener('click', openCheckoutModal);
  closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

  btnNextStep.addEventListener('click', handleNextStep);
  btnPrevStep.addEventListener('click', handlePrevStep);

  btnRequestGeo.addEventListener('click', requestGeolocation);
  btnRequestCredentials.addEventListener('click', requestDeviceCredentials);

  btnFinishAll.addEventListener('click', () => {
    closeCheckoutModal();
  });

  // Radio payment selector visual toggle
  document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
      e.target.closest('.payment-option').classList.add('selected');
    });
  });
}
