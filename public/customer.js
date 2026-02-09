const STORAGE_CONFIG_KEY = 'tableOrder.customer.config';
const STORAGE_CART_KEY = 'tableOrder.customer.cart';
const STORAGE_TOKEN_KEY = 'tableOrder.customer.token';

const setupSection = document.querySelector('#setupSection');
const appSection = document.querySelector('#appSection');
const sessionBadge = document.querySelector('#sessionBadge');
const setupToast = document.querySelector('#setupToast');
const cartToast = document.querySelector('#cartToast');

const storeIdInput = document.querySelector('#storeIdInput');
const tableNumberInput = document.querySelector('#tableNumberInput');
const tablePasswordInput = document.querySelector('#tablePasswordInput');
const loginButton = document.querySelector('#loginButton');

const refreshMenuButton = document.querySelector('#refreshMenuButton');
const categoryTabs = document.querySelector('#categoryTabs');
const menuGrid = document.querySelector('#menuGrid');

const cartList = document.querySelector('#cartList');
const cartTotal = document.querySelector('#cartTotal');
const clearCartButton = document.querySelector('#clearCartButton');
const placeOrderButton = document.querySelector('#placeOrderButton');
const orderHistory = document.querySelector('#orderHistory');
const loadMoreHistoryButton = document.querySelector('#loadMoreHistoryButton');

const orderModal = document.querySelector('#orderModal');
const orderModalBody = document.querySelector('#orderModalBody');
const orderModalCountdown = document.querySelector('#orderModalCountdown');

let token = localStorage.getItem(STORAGE_TOKEN_KEY) ?? '';
let menus = [];
let selectedCategory = 'ALL';
let cart = readCart();
let customerSseController = null;
let historyItems = [];
let historyPage = 1;
let historyPageSize = 10;
let historyHasMore = false;

function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
}

function setToast(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || '요청 실패');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function updateSessionBadge(text, ok = false) {
  sessionBadge.textContent = text;
  sessionBadge.style.background = ok ? '#e3f4eb' : '#f4e4e4';
  sessionBadge.style.color = ok ? '#096949' : '#7f1f1f';
}

async function loginTable(config, isAuto = false) {
  const payload = {
    storeId: config.storeId,
    tableNumber: config.tableNumber,
    tablePassword: config.tablePassword
  };
  const result = await api('/api/table/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  token = result.token;
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(payload));

  setupSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  updateSessionBadge(`${config.tableNumber} 세션 연결`, true);
  setToast(setupToast, isAuto ? '자동 로그인 성공' : '로그인 성공');

  await refreshMenus();
  await refreshHistory(true);
  renderCart();
  startCustomerStream();
}

function renderCategories() {
  const categories = ['ALL', ...new Set(menus.map((menu) => menu.category))];
  categoryTabs.innerHTML = '';
  for (const category of categories) {
    const button = document.createElement('button');
    button.textContent = category;
    button.className = category === selectedCategory ? 'active' : '';
    button.addEventListener('click', () => {
      selectedCategory = category;
      renderCategories();
      renderMenus();
    });
    categoryTabs.appendChild(button);
  }
}

function formatCurrency(value) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function renderMenus() {
  const filtered = menus.filter((menu) => (selectedCategory === 'ALL' ? true : menu.category === selectedCategory));
  menuGrid.innerHTML = '';

  for (const menu of filtered) {
    const card = document.createElement('article');
    card.className = 'menu-card';

    const image = document.createElement('img');
    image.src = menu.imageUrl || 'https://picsum.photos/400/240';
    image.alt = menu.name;

    const body = document.createElement('div');
    body.className = 'menu-card-body';
    body.innerHTML = `
      <strong>${menu.name}</strong>
      <span class="menu-price">${formatCurrency(menu.price)}</span>
      <span class="muted">${menu.description || ''}</span>
    `;

    const addButton = document.createElement('button');
    addButton.className = 'btn-primary';
    addButton.textContent = '담기';
    addButton.addEventListener('click', () => {
      const existing = cart.find((item) => item.menuId === menu.menuId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          menuId: menu.menuId,
          name: menu.name,
          price: menu.price,
          quantity: 1
        });
      }
      saveCart();
      renderCart();
      setToast(cartToast, `${menu.name} 추가`);
    });

    body.appendChild(addButton);
    card.append(image, body);
    menuGrid.appendChild(card);
  }
}

function renderCart() {
  cartList.innerHTML = '';

  if (cart.length === 0) {
    cartList.innerHTML = '<div class="muted">장바구니가 비어있습니다.</div>';
  }

  for (const item of cart) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cart-item';

    const title = document.createElement('div');
    title.innerHTML = `<strong>${item.name}</strong> · ${formatCurrency(item.price)}`;

    const actions = document.createElement('div');
    actions.className = 'inline-actions';

    const dec = document.createElement('button');
    dec.textContent = '-';
    dec.addEventListener('click', () => {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart = cart.filter((row) => row.menuId !== item.menuId);
      }
      saveCart();
      renderCart();
    });

    const qty = document.createElement('span');
    qty.textContent = `수량 ${item.quantity}`;

    const inc = document.createElement('button');
    inc.textContent = '+';
    inc.addEventListener('click', () => {
      item.quantity += 1;
      saveCart();
      renderCart();
    });

    const remove = document.createElement('button');
    remove.textContent = 'x';
    remove.addEventListener('click', () => {
      cart = cart.filter((row) => row.menuId !== item.menuId);
      saveCart();
      renderCart();
    });

    actions.append(dec, qty, inc, remove);
    wrapper.append(title, actions);
    cartList.appendChild(wrapper);
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `총액: ${formatCurrency(total)}`;
}

async function refreshMenus() {
  const config = JSON.parse(localStorage.getItem(STORAGE_CONFIG_KEY) || '{}');
  const storeId = config.storeId || storeIdInput.value.trim();
  if (!storeId) {
    return;
  }

  const result = await api(`/api/menu?storeId=${encodeURIComponent(storeId)}`);
  menus = result.items || [];
  renderCategories();
  renderMenus();
}

function renderHistory(items) {
  orderHistory.innerHTML = '';
  if (!items || items.length === 0) {
    orderHistory.innerHTML = '<div class="muted">현재 세션 주문이 없습니다.</div>';
    loadMoreHistoryButton.disabled = true;
    return;
  }

  for (const order of items) {
    const div = document.createElement('div');
    div.className = 'order-item';
    const lines = order.items.map((item) => `${item.menuName} x${item.quantity}`).join(', ');
    div.innerHTML = `
      <div><strong>${order.orderNumber}</strong> <span class="status-pill status-${order.status}">${order.status}</span></div>
      <div class="muted">${new Date(order.createdAt).toLocaleString()}</div>
      <div>${lines}</div>
      <div><strong>${formatCurrency(order.totalAmount)}</strong></div>
    `;
    orderHistory.appendChild(div);
  }
  loadMoreHistoryButton.disabled = !historyHasMore;
}

async function refreshHistory(reset = false) {
  if (reset) {
    historyPage = 1;
    historyItems = [];
  }

  const result = await api(
    `/api/orders/current-session?page=${historyPage}&pageSize=${historyPageSize}`
  );

  const newItems = result.items || [];
  if (reset) {
    historyItems = newItems;
  } else {
    historyItems = [...historyItems, ...newItems];
  }

  historyHasMore = historyItems.length < (result.total || 0);
  loadMoreHistoryButton.classList.toggle('hidden', historyItems.length === 0 && !historyHasMore);
  renderHistory(historyItems);
}

function stopCustomerStream() {
  if (customerSseController) {
    customerSseController.abort();
    customerSseController = null;
  }
}

function handleSessionCompleted() {
  stopCustomerStream();
  token = '';
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  historyItems = [];
  historyPage = 1;
  historyHasMore = false;
  loadMoreHistoryButton.classList.add('hidden');
  appSection.classList.add('hidden');
  setupSection.classList.remove('hidden');
  updateSessionBadge('세션 종료됨', false);
  setToast(setupToast, '테이블 이용이 완료되었습니다. 다음 주문을 위해 다시 로그인하세요.', false);
}

async function handleCustomerSseMessage(eventName) {
  if (eventName === 'ready') {
    return;
  }

  if (eventName === 'session-completed') {
    handleSessionCompleted();
    return;
  }

  try {
    await refreshHistory(true);
  } catch {
    // ignore stream-triggered refresh errors
  }
}

async function startCustomerStream() {
  if (!token) {
    return;
  }

  stopCustomerStream();
  customerSseController = new AbortController();

  try {
    const response = await fetch('/api/orders/stream', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: customerSseController.signal
    });

    if (!response.ok || !response.body) {
      throw new Error('SSE 연결 실패');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        const lines = chunk.split('\n');
        const eventLine = lines.find((line) => line.startsWith('event: '));
        const eventName = eventLine ? eventLine.replace('event: ', '').trim() : 'message';
        await handleCustomerSseMessage(eventName);
      }
    }
  } catch (error) {
    if (!token) {
      return;
    }
    if (error.name === 'AbortError') {
      return;
    }
    setTimeout(() => {
      startCustomerStream();
    }, 3000);
  }
}

function openOrderModal(orderNumber) {
  orderModal.classList.add('open');
  let remaining = 5;
  orderModalBody.textContent = `주문번호 ${orderNumber}`;
  orderModalCountdown.textContent = `${remaining}초 후 메뉴 화면으로 이동합니다.`;

  const timer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(timer);
      orderModal.classList.remove('open');
      return;
    }
    orderModalCountdown.textContent = `${remaining}초 후 메뉴 화면으로 이동합니다.`;
  }, 1000);
}

loginButton.addEventListener('click', async () => {
  try {
    const config = {
      storeId: storeIdInput.value.trim(),
      tableNumber: tableNumberInput.value.trim(),
      tablePassword: tablePasswordInput.value.trim()
    };
    await loginTable(config, false);
  } catch (error) {
    setToast(setupToast, error.message, true);
  }
});

refreshMenuButton.addEventListener('click', async () => {
  try {
    await refreshMenus();
  } catch (error) {
    setToast(cartToast, error.message, true);
  }
});

clearCartButton.addEventListener('click', () => {
  cart = [];
  saveCart();
  renderCart();
  setToast(cartToast, '장바구니를 비웠습니다.');
});

placeOrderButton.addEventListener('click', async () => {
  if (cart.length === 0) {
    setToast(cartToast, '주문할 메뉴를 추가하세요.', true);
    return;
  }

  try {
    const payload = {
      items: cart.map((item) => ({ menuId: item.menuId, quantity: item.quantity }))
    };
    const result = await api('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    cart = [];
    saveCart();
    renderCart();
    await refreshHistory(true);
    openOrderModal(result.order.orderNumber);
    setToast(cartToast, '주문 성공');
  } catch (error) {
    setToast(cartToast, error.message, true);
  }
});

loadMoreHistoryButton.addEventListener('click', async () => {
  if (!historyHasMore) {
    return;
  }
  historyPage += 1;
  try {
    await refreshHistory(false);
  } catch (error) {
    historyPage -= 1;
    setToast(cartToast, error.message, true);
  }
});

async function bootstrap() {
  renderCart();
  loadMoreHistoryButton.classList.add('hidden');
  try {
    const config = JSON.parse(localStorage.getItem(STORAGE_CONFIG_KEY) || 'null');
    if (config?.storeId && config?.tableNumber && config?.tablePassword) {
      await loginTable(config, true);
      return;
    }
  } catch {
    // ignore auto-login parse errors
  }
  updateSessionBadge('로그인 필요', false);
}

bootstrap();
