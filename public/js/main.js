// Token kezelés
const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const removeToken = () => localStorage.removeItem("token");

// Navbar frissítés
async function updateNavbar() {
  const token = getToken();
  const nav = document.getElementById("auth-nav");
  if (!nav) return;

  if (token) {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        removeToken();
        nav.innerHTML = `
          <li class="nav-item"><a class="nav-link text-white" href="/auth/login">Bejelentkezés</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="/auth/register">Regisztráció</a></li>
        `;
        return;
      }

      const user = await res.json();
      nav.innerHTML = `
        ${user.role === "admin" ? '<li class="nav-item"><a class="nav-link text-white" href="/admin">⚙️ Admin</a></li>' : ""}
        <li class="nav-item"><a class="nav-link text-white" href="/profile">👤 Profil</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="#" onclick="logout()">Kijelentkezés</a></li>
      `;
    } catch (e) {
      nav.innerHTML = `
        <li class="nav-item"><a class="nav-link text-white" href="/auth/login">Bejelentkezés</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="/auth/register">Regisztráció</a></li>
      `;
    }
  } else {
    nav.innerHTML = `
      <li class="nav-item"><a class="nav-link text-white" href="/auth/login">Bejelentkezés</a></li>
      <li class="nav-item"><a class="nav-link text-white" href="/auth/register">Regisztráció</a></li>
    `;
  }
}

function logout() {
  removeToken();
  window.location.href = "/";
}
// Validáció
function validateFields(fields) {
  for (const field of fields) {
    if (!field.value || field.value.trim() === "") {
      alert(`A "${field.label}" mező kitöltése kötelező!`);
      document.getElementById(field.id).focus();
      return false;
    }
  }
  return true;
}
// Auth funkciók
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (res.ok) {
    setToken(data.token);
    window.location.href = "/";
  } else {
    const err = document.getElementById("error-msg");
    err.style.display = "block";
    err.textContent = data.message;
  }
}

async function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();

  if (res.ok) {
    const success = document.getElementById("success-msg");
    success.style.display = "block";
    success.textContent = "Sikeres regisztráció! Átirányítás...";
    setTimeout(() => (window.location.href = "/auth/login"), 1500);
  } else {
    const err = document.getElementById("error-msg");
    err.style.display = "block";
    err.textContent = data.message;
  }
}

async function changePassword() {
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const newPasswordConfirm = document.getElementById(
    "new-password-confirm",
  ).value;

  const errorEl = document.getElementById("password-error");
  const successEl = document.getElementById("password-success");
  errorEl.style.display = "none";
  successEl.style.display = "none";

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    errorEl.style.display = "block";
    errorEl.textContent = "Minden mező kitöltése kötelező!";
    return;
  }

  if (newPassword !== newPasswordConfirm) {
    errorEl.style.display = "block";
    errorEl.textContent = "Az új jelszavak nem egyeznek!";
    return;
  }

  if (newPassword.length < 6) {
    errorEl.style.display = "block";
    errorEl.textContent =
      "Az új jelszónak legalább 6 karakter hosszúnak kell lennie!";
    return;
  }

  const token = getToken();
  const res = await fetch("/api/auth/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();
  if (res.ok) {
    successEl.style.display = "block";
    successEl.textContent = data.message;
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("new-password-confirm").value = "";
  } else {
    errorEl.style.display = "block";
    errorEl.textContent = data.message;
  }
}

// Növények betöltése
async function loadPlants() {
  const container = document.getElementById("plants-container");
  if (!container) return;

  const res = await fetch("/api/plants");
  const plants = await res.json();

  if (plants.length === 0) {
    container.innerHTML =
      '<p class="text-muted">Nincsenek növények az adatbázisban.</p>';
    return;
  }

  container.innerHTML = plants
    .map(
      (plant) => `
  <div class="col-md-4 plant-card" data-type="${plant.type}" data-difficulty="${plant.difficulty}">
    <div class="card h-100">
      <div style="cursor:pointer;" onclick="window.location.href='/plants/${plant.id}'">
        ${plant.image ? `<img src="/uploads/${plant.image}" class="card-img-top" style="height: 200px; object-fit: cover;">` : '<div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">🌱</div>'}
        <div class="card-body">
          <h5 class="card-title text-success">${plant.name}</h5>
          <p class="text-muted fst-italic">${plant.latin_name || ""}</p>
          <p class="card-text">${plant.description || ""}</p>
          <span class="badge bg-success">${plant.type}</span>
          <span class="badge bg-secondary">${plant.difficulty}</span>
          <div class="mt-2" id="avg-plants-${plant.id}">☆☆☆☆☆ <small class="text-muted">(0)</small></div>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div>💧 ${plant.watering_frequency || "N/A"} &nbsp; ☀️ ${plant.sunlight || "N/A"}</div>
        <button class="btn btn-sm btn-outline-danger" data-fav="false" id="fav-plant-${plant.id}" onclick="toggleFavorite('plant', ${plant.id}, this)" title="Kedvencekhez adás">🤍</button>
      </div>
    </div>
  </div>
`,
    )
    .join("");

  // Átlagos értékelés és kedvenc státusz betöltése
  for (const plant of plants) {
    const { avg, count } = await getAverageRating("plants", plant.id);
    const el = document.getElementById(`avg-plants-${plant.id}`);
    if (el) el.innerHTML = renderStarAvg(avg, count);
    const favBtn = document.getElementById(`fav-plant-${plant.id}`);
    if (favBtn) checkFavoriteStatus("plant", plant.id, favBtn);
  }

  document.getElementById("search")?.addEventListener("input", filterPlants);
  document
    .getElementById("filter-type")
    ?.addEventListener("change", filterPlants);
  document
    .getElementById("filter-difficulty")
    ?.addEventListener("change", filterPlants);
}

function filterPlants() {
  const search = document.getElementById("search").value.toLowerCase();
  const type = document.getElementById("filter-type").value;
  const difficulty = document.getElementById("filter-difficulty").value;

  document.querySelectorAll(".plant-card").forEach((card) => {
    const name = card.querySelector(".card-title").textContent.toLowerCase();
    const cardType = card.dataset.type;
    const cardDifficulty = card.dataset.difficulty;

    const matchSearch = name.includes(search);
    const matchType = !type || cardType === type;
    const matchDifficulty = !difficulty || cardDifficulty === difficulty;

    card.style.display =
      matchSearch && matchType && matchDifficulty ? "block" : "none";
  });
}

// Termékek betöltése
async function loadProducts() {
  const container = document.getElementById("products-container");
  if (!container) return;

  const res = await fetch("/api/shop/products");
  const products = await res.json();

  if (products.length === 0) {
    container.innerHTML = '<p class="text-muted">Nincsenek termékek.</p>';
    return;
  }

  container.innerHTML = products
    .map(
      (product) => `
  <div class="col-md-4 product-card" data-category="${product.category}">
    <div class="card h-100">
      <div style="cursor:pointer;" onclick="window.location.href='/shop/${product.id}'">
        ${product.image ? `<img src="/uploads/${product.image}" class="card-img-top" style="height: 200px; object-fit: cover;">` : '<div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">🛒</div>'}
        <div class="card-body">
          <h5 class="card-title text-success">${product.name}</h5>
          <p class="card-text">${product.description || ""}</p>
          <span class="badge bg-success">${product.category}</span>
          <div class="mt-2" id="avg-products-${product.id}">☆☆☆☆☆ <small class="text-muted">(0)</small></div>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <strong class="text-success">${product.price} Ft</strong>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger" data-fav="false" id="fav-product-${product.id}" onclick="toggleFavorite('product', ${product.id}, this)" title="Kedvencekhez adás">🤍</button>
          <button class="btn btn-success btn-sm" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">🛒 Kosárba</button>
        </div>
      </div>
    </div>
  </div>
`,
    )
    .join("");

  // Átlagos értékelés és kedvenc státusz betöltése
  for (const product of products) {
    const { avg, count } = await getAverageRating("products", product.id);
    const el = document.getElementById(`avg-products-${product.id}`);
    if (el) el.innerHTML = renderStarAvg(avg, count);
    const favBtn = document.getElementById(`fav-product-${product.id}`);
    if (favBtn) checkFavoriteStatus("product", product.id, favBtn);
  }
  document
    .getElementById("filter-category")
    ?.addEventListener("change", filterProducts);
}

async function getAverageRating(type, id) {
  const res = await fetch(`/api/reviews/${type}/${id}`);
  const reviews = await res.json();
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

function renderStarAvg(avg, count) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(avg)) stars += "⭐";
    else stars += "☆";
  }
  return `<span>${stars} <small class="text-muted">(${count})</small></span>`;
}

function filterProducts() {
  const category = document.getElementById("filter-category").value;
  document.querySelectorAll(".product-card").forEach((card) => {
    card.style.display =
      !category || card.dataset.category === category ? "block" : "none";
  });
}
// Kosár kezelés
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  saveCart(cart);
  showCartToast(name);
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  renderCart();
}

function updateQuantity(id, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item.id === id);
  if (item) {
    item.quantity = parseInt(quantity);
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
  }
  saveCart(cart);
  renderCart();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? "inline" : "none";
  }
}

function showCartToast(name) {
  const toast = document.getElementById("cart-toast");
  const toastMsg = document.getElementById("cart-toast-msg");
  if (toast && toastMsg) {
    toastMsg.textContent = `"${name}" hozzáadva a kosárhoz!`;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
  }
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">A kosár üres.</p>';
    if (totalEl) totalEl.textContent = "0";
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <div>
        <strong>${item.name}</strong><br>
        <small class="text-muted">${item.price} Ft / db</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <input type="number" min="1" value="${item.quantity}" 
          class="form-control form-control-sm" style="width: 70px;"
          onchange="updateQuantity(${item.id}, this.value)">
        <span class="text-success fw-bold">${(item.price * item.quantity).toLocaleString()} Ft</span>
        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">×</button>
      </div>
    </div>
  `,
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (totalEl) totalEl.textContent = total.toLocaleString();
}

async function checkout() {
  const token = getToken();
  if (!token) {
    window.location.href = "/auth/login";
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert("A kosár üres!");
    return;
  }

  const address = document.getElementById("shipping-address").value;
  if (!address.trim()) {
    alert("Add meg a szállítási címet!");
    document.getElementById("shipping-address").focus();
    return;
  }

  const res = await fetch("/api/shop/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipping_address: address,
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    }),
  });

  const data = await res.json();
  if (res.ok) {
    saveCart([]);
    renderCart();
    alert(`Rendelés sikeresen leadva! Rendelés azonosító: #${data.orderId}`);
    bootstrap.Modal.getInstance(document.getElementById("cartModal")).hide();
  } else {
    alert(data.message);
  }
}
// Wiki cikkek betöltése
async function loadWiki() {
  const container = document.getElementById("wiki-container");
  if (!container) return;

  const res = await fetch("/api/wiki");
  const articles = await res.json();

  if (articles.length === 0) {
    container.innerHTML = '<p class="text-muted">Nincsenek cikkek.</p>';
    return;
  }

  container.innerHTML = articles
    .map(
      (article) => `
  <div class="col-md-4 wiki-card" data-category="${article.category}">
    <div class="card h-100" style="cursor:pointer;" onclick="window.location.href='/wiki/${article.slug}'">
      ${article.image ? `<img src="/uploads/${article.image}" class="card-img-top" style="height: 200px; object-fit: cover;">` : '<div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">📖</div>'}
      <div class="card-body">
        <h5 class="card-title text-success">${article.title}</h5>
        <span class="badge bg-success mb-2">${article.category}</span>
        <p class="card-text">${article.content.substring(0, 100)}...</p>
      </div>
    </div>
  </div>
`,
    )
    .join("");

  document
    .getElementById("filter-category")
    ?.addEventListener("change", filterWiki);
}

async function loadWikiDetail() {
  const container = document.getElementById("wiki-detail");
  if (!container) return;

  const slug = window.location.pathname.split("/").pop();
  const res = await fetch(`/api/wiki/${slug}`);
  if (!res.ok) {
    container.innerHTML = '<p class="text-danger">Cikk nem található!</p>';
    return;
  }
  const article = await res.json();

  container.innerHTML = `
    <div class="row">
      <div class="col-md-8 mx-auto">
        ${article.image ? `<img src="/uploads/${article.image}" class="img-fluid rounded mb-4" style="max-height: 400px; object-fit: cover; width: 100%;">` : ""}
        <div class="mb-3">
          <a href="/wiki" class="btn btn-outline-success btn-sm">← Vissza</a>
        </div>
        <h2 class="text-success">${article.title}</h2>
        <span class="badge bg-success mb-3">${article.category}</span>
        ${article.Plant ? `<p class="text-muted">🌱 Kapcsolódó növény: <strong>${article.Plant.name}</strong></p>` : ""}
        <div class="card p-4">
          <p style="white-space: pre-wrap;">${article.content}</p>
        </div>
        <div class="mt-3 text-muted small">
          Utoljára frissítve: ${new Date(article.updatedAt).toLocaleDateString("hu-HU")}
        </div>
      </div>
    </div>
  `;
}

function filterWiki() {
  const category = document.getElementById("filter-category").value;
  document.querySelectorAll(".wiki-card").forEach((card) => {
    card.style.display =
      !category || card.dataset.category === category ? "block" : "none";
  });
}

// Tápanyag kalkulátor
async function calculate() {
  const plantId = document.getElementById("plantSelect").value;
  const potCount = document.getElementById("pot-count").value;
  const area = document.getElementById("area").value;

  if (!plantId) {
    alert("Kérlek válassz egy növényt!");
    return;
  }

  if (!potCount && !area) {
    alert("Add meg a cserépszámot vagy a területet!");
    return;
  }

  const body = { plantId: parseInt(plantId) };
  if (potCount) body.pot_count = parseInt(potCount);
  if (area) body.area = parseFloat(area);

  const res = await fetch("/api/nutrients/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  const resultCard = document.getElementById("result-card");
  const resultContent = document.getElementById("result-content");
  resultCard.style.display = "block";

  if (res.ok) {
    resultContent.innerHTML = `
      <table class="table">
        <tr><td>🌿 Nitrogén</td><td><strong>${data.result.nitrogen} g/l</strong></td></tr>
        <tr><td>🌿 Foszfor</td><td><strong>${data.result.phosphorus} g/l</strong></td></tr>
        <tr><td>🌿 Kálium</td><td><strong>${data.result.potassium} g/l</strong></td></tr>
        <tr><td>💧 Vízigény</td><td><strong>${data.result.watering_amount} l/hét</strong></td></tr>
        <tr><td>⚗️ pH tartomány</td><td><strong>${data.result.ph_min} – ${data.result.ph_max}</strong></td></tr>
        <tr><td>🧴 Trágyázás</td><td><strong>${data.result.fertilizing_frequency}</strong></td></tr>
      </table>
    `;
  } else {
    resultContent.innerHTML = `<p class="text-danger">${data.message}</p>`;
  }
}

async function loadNutrientPlants() {
  const select = document.getElementById("plantSelect");
  if (!select) return;

  const res = await fetch("/api/plants");
  const plants = await res.json();

  plants.forEach((plant) => {
    const option = document.createElement("option");
    option.value = plant.id;
    option.textContent = plant.name;
    select.appendChild(option);
  });
} // Admin - Felhasználók betöltése
async function loadAdminUsers() {
  const tbody = document.getElementById("users-tbody");
  if (!tbody) return;

  const token = getToken();
  const res = await fetch("/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = await res.json();

  tbody.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>
        <select class="form-select form-select-sm" onchange="updateUserRole(${user.id}, this.value)" ${user.role === "admin" ? "" : ""}>
          <option value="user" ${user.role === "user" ? "selected" : ""}>user</option>
          <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
        </select>
      </td>
      <td>${new Date(user.createdAt).toLocaleDateString("hu-HU")}</td>
      <td>
        ${user.role !== "admin" ? `<button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Törlés</button>` : '<span class="text-muted">-</span>'}
      </td>
    </tr>
  `,
    )
    .join("");
}

async function updateUserRole(id, role) {
  const token = getToken();
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const data = await res.json();
    alert(data.message);
    loadAdminUsers();
  }
}

async function deleteUser(id) {
  if (!confirm("Biztosan törlöd ezt a felhasználót?")) return;
  const token = getToken();
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    await loadAdminUsers();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

// Admin - Növények betöltése táblázatba
async function loadAdminPlants() {
  const tbody = document.getElementById("plants-tbody");
  if (!tbody) return;

  const res = await fetch("/api/plants");
  const plants = await res.json();

  tbody.innerHTML = plants
    .map(
      (plant) => `
    <tr>
      <td>${plant.id}</td>
      <td>${plant.name}</td>
      <td><i>${plant.latin_name || "-"}</i></td>
      <td>${plant.type}</td>
      <td>${plant.difficulty}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="openEditPlant(${plant.id}, '${plant.name}', '${plant.latin_name || ""}', '${plant.description || ""}', '${plant.type}', '${plant.difficulty}', '${plant.watering_frequency || ""}', '${plant.sunlight}')">Szerkesztés</button>
        <button class="btn btn-sm btn-danger" onclick="deletePlant(${plant.id})">Törlés</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function addPlant() {
  const valid = validateFields([
    {
      id: "add-name",
      label: "Név",
      value: document.getElementById("add-name").value,
    },
    {
      id: "add-watering",
      label: "Öntözési gyakoriság",
      value: document.getElementById("add-watering").value,
    },
  ]);
  if (!valid) return;

  const token = getToken();
  const formData = new FormData();
  formData.append("name", document.getElementById("add-name").value);
  formData.append("latin_name", document.getElementById("add-latin").value);
  formData.append(
    "description",
    document.getElementById("add-description").value,
  );
  formData.append("type", document.getElementById("add-type").value);
  formData.append(
    "difficulty",
    document.getElementById("add-difficulty").value,
  );
  formData.append(
    "watering_frequency",
    document.getElementById("add-watering").value,
  );
  formData.append("sunlight", document.getElementById("add-sunlight").value);
  const imageFile = document.getElementById("add-image").files[0];
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch("/api/plants", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      bootstrap.Modal.getInstance(
        document.getElementById("addPlantModal"),
      ).hide();
      loadAdminPlants();
    } else {
      const err = document.getElementById("add-error");
      err.style.display = "block";
      err.textContent = data.message;
    }
  } catch (err) {
    console.error("Hiba:", err);
  }
}

async function deletePlant(id) {
  if (!confirm("Biztosan törlöd ezt a növényt?")) return;
  const token = getToken();
  const res = await fetch(`/api/plants/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) await loadAdminPlants();
}

// Admin - Termékek betöltése táblázatba
async function loadAdminProducts() {
  const tbody = document.getElementById("products-tbody");
  if (!tbody) return;

  const res = await fetch("/api/shop/products");
  const products = await res.json();

  tbody.innerHTML = products
    .map(
      (product) => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price} Ft</td>
      <td>${product.stock}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="openEditProduct(${product.id}, '${product.name}', '${product.description || ""}', ${product.price}, ${product.stock}, '${product.category}')">Szerkesztés</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Törlés</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function addProduct() {
  const valid = validateFields([
    {
      id: "add-product-name",
      label: "Név",
      value: document.getElementById("add-product-name").value,
    },
    {
      id: "add-product-price",
      label: "Ár",
      value: document.getElementById("add-product-price").value,
    },
    {
      id: "add-product-stock",
      label: "Készlet",
      value: document.getElementById("add-product-stock").value,
    },
  ]);
  if (!valid) return;

  const token = getToken();
  const formData = new FormData();
  formData.append("name", document.getElementById("add-product-name").value);
  formData.append(
    "description",
    document.getElementById("add-product-description").value,
  );
  formData.append("price", document.getElementById("add-product-price").value);
  formData.append("stock", document.getElementById("add-product-stock").value);
  formData.append(
    "category",
    document.getElementById("add-product-category").value,
  );
  const imageFile = document.getElementById("add-product-image").files[0];
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch("/api/shop/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      bootstrap.Modal.getInstance(
        document.getElementById("addProductModal"),
      ).hide();
      loadAdminProducts();
    } else {
      const err = document.getElementById("add-product-error");
      err.style.display = "block";
      err.textContent = data.message;
    }
  } catch (err) {
    console.error("Hiba:", err);
  }
}

async function deleteProduct(id) {
  if (!confirm("Biztosan törlöd ezt a terméket?")) return;
  const token = getToken();
  const res = await fetch(`/api/shop/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (res.ok) {
    await loadAdminProducts();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

// Admin - Wiki cikkek betöltése
async function loadAdminWiki() {
  const tbody = document.getElementById("wiki-tbody");
  if (!tbody) return;

  const res = await fetch("/api/wiki");
  const articles = await res.json();

  tbody.innerHTML = articles
    .map(
      (article) => `
    <tr>
      <td>${article.id}</td>
      <td>${article.title}</td>
      <td>${article.category}</td>
      <td>${article.Plant ? article.Plant.name : "-"}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="openEditArticle(${article.id}, '${article.title.replace(/'/g, "\\'")}', '${article.slug}', '${article.content.replace(/'/g, "\\'")}', '${article.category}', ${article.plantId || null})">Szerkesztés</button>
        <button class="btn btn-sm btn-danger" onclick="deleteArticle(${article.id})">Törlés</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function addArticle() {
  const valid = validateFields([
    {
      id: "add-article-title",
      label: "Cím",
      value: document.getElementById("add-article-title").value,
    },
    {
      id: "add-article-slug",
      label: "Slug",
      value: document.getElementById("add-article-slug").value,
    },
    {
      id: "add-article-content",
      label: "Tartalom",
      value: document.getElementById("add-article-content").value,
    },
  ]);
  if (!valid) return;

  const token = getToken();
  const plantId = document.getElementById("add-article-plantid").value;
  const formData = new FormData();
  formData.append("title", document.getElementById("add-article-title").value);
  formData.append("slug", document.getElementById("add-article-slug").value);
  formData.append(
    "content",
    document.getElementById("add-article-content").value,
  );
  formData.append(
    "category",
    document.getElementById("add-article-category").value,
  );
  if (plantId) formData.append("plantId", plantId);
  const imageFile = document.getElementById("add-article-image").files[0];
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch("/api/wiki", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById("add-article-error").style.display = "none";
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addArticleModal"),
      );
      if (modal) modal.hide();
      loadAdminWiki();
    } else {
      const err = document.getElementById("add-article-error");
      err.style.display = "block";
      err.textContent = data.message;
    }
  } catch (err) {
    console.error("Hiba:", err);
  }
}
async function deleteArticle(id) {
  if (!confirm("Biztosan törlöd ezt a cikket?")) return;
  const token = getToken();
  const res = await fetch(`/api/wiki/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) await loadAdminWiki();
}
// Admin - Rendelések betöltése
async function loadAdminOrders() {
  const tbody = document.getElementById("orders-tbody");
  if (!tbody) return;

  const token = getToken();
  const res = await fetch("/api/shop/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const orders = await res.json();

  tbody.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td>${order.id}</td>
      <td>${order.userId}</td>
      <td><span class="badge bg-warning text-dark">${order.status}</span></td>
      <td>${order.total_price} Ft</td>
      <td>${order.shipping_address}</td>
      <td>${new Date(order.createdAt).toLocaleDateString("hu-HU")}</td>
      <td>
        <select class="form-select form-select-sm" onchange="updateOrderStatus(${order.id}, this.value)">
          <option ${order.status === "függőben" ? "selected" : ""}>függőben</option>
          <option ${order.status === "feldolgozás alatt" ? "selected" : ""}>feldolgozás alatt</option>
          <option ${order.status === "teljesítve" ? "selected" : ""}>teljesítve</option>
          <option ${order.status === "törölve" ? "selected" : ""}>törölve</option>
        </select>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function updateOrderStatus(id, status) {
  const token = getToken();
  await fetch(`/api/shop/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}
function openEditPlant(
  id,
  name,
  latin_name,
  description,
  type,
  difficulty,
  watering_frequency,
  sunlight,
) {
  document.getElementById("edit-plant-id").value = id;
  document.getElementById("edit-name").value = name;
  document.getElementById("edit-latin").value = latin_name;
  document.getElementById("edit-description").value = description;
  document.getElementById("edit-type").value = type;
  document.getElementById("edit-difficulty").value = difficulty;
  document.getElementById("edit-watering").value = watering_frequency;
  document.getElementById("edit-sunlight").value = sunlight;
  new bootstrap.Modal(document.getElementById("editPlantModal")).show();
}

async function editPlant() {
  const valid = validateFields([
    {
      id: "edit-name",
      label: "Név",
      value: document.getElementById("edit-name").value,
    },
    {
      id: "edit-watering",
      label: "Öntözési gyakoriság",
      value: document.getElementById("edit-watering").value,
    },
  ]);
  if (!valid) return;

  const token = getToken();
  const id = document.getElementById("edit-plant-id").value;
  const formData = new FormData();
  formData.append("name", document.getElementById("edit-name").value);
  formData.append("latin_name", document.getElementById("edit-latin").value);
  formData.append(
    "description",
    document.getElementById("edit-description").value,
  );
  formData.append("type", document.getElementById("edit-type").value);
  formData.append(
    "difficulty",
    document.getElementById("edit-difficulty").value,
  );
  formData.append(
    "watering_frequency",
    document.getElementById("edit-watering").value,
  );
  formData.append("sunlight", document.getElementById("edit-sunlight").value);
  const imageFile = document.getElementById("edit-image").files[0];
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`/api/plants/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(
      document.getElementById("editPlantModal"),
    ).hide();
    loadAdminPlants();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

function openEditProduct(id, name, description, price, stock, category) {
  document.getElementById("edit-product-id").value = id;
  document.getElementById("edit-product-name").value = name;
  document.getElementById("edit-product-description").value = description;
  document.getElementById("edit-product-price").value = price;
  document.getElementById("edit-product-stock").value = stock;
  document.getElementById("edit-product-category").value = category;
  new bootstrap.Modal(document.getElementById("editProductModal")).show();
}

async function editProduct() {
  const valid = validateFields([
    {
      id: "edit-product-name",
      label: "Név",
      value: document.getElementById("edit-product-name").value,
    },
    {
      id: "edit-product-price",
      label: "Ár",
      value: document.getElementById("edit-product-price").value,
    },
    {
      id: "edit-product-stock",
      label: "Készlet",
      value: document.getElementById("edit-product-stock").value,
    },
  ]);
  if (!valid) return;

  const token = getToken();
  const id = document.getElementById("edit-product-id").value;
  const formData = new FormData();
  formData.append("name", document.getElementById("edit-product-name").value);
  formData.append(
    "description",
    document.getElementById("edit-product-description").value,
  );
  formData.append("price", document.getElementById("edit-product-price").value);
  formData.append("stock", document.getElementById("edit-product-stock").value);
  formData.append(
    "category",
    document.getElementById("edit-product-category").value,
  );
  const imageFile = document.getElementById("edit-product-image").files[0];
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`/api/shop/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(
      document.getElementById("editProductModal"),
    ).hide();
    loadAdminProducts();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

function openEditArticle(id, title, slug, content, category, plantId) {
  document.getElementById("edit-article-id").value = id;
  document.getElementById("edit-article-title").value = title;
  document.getElementById("edit-article-slug").value = slug;
  document.getElementById("edit-article-content").value = content;
  document.getElementById("edit-article-category").value = category;
  document.getElementById("edit-article-plantid").value = plantId || "";
  new bootstrap.Modal(document.getElementById("editArticleModal")).show();
}

async function editArticle() {
  const valid = validateFields([
    {
      id: "edit-article-title",
      label: "Cím",
      value: document.getElementById("edit-article-title").value,
    },
    {
      id: "edit-article-slug",
      label: "Slug",
      value: document.getElementById("edit-article-slug").value,
    },
    {
      id: "edit-article-content",
      label: "Tartalom",
      value: document.getElementById("edit-article-content").value,
    },
  ]);
  if (!valid) return;

  const token = getToken();
  const id = document.getElementById("edit-article-id").value;
  const plantId = document.getElementById("edit-article-plantid").value;
  const formData = new FormData();
  formData.append("title", document.getElementById("edit-article-title").value);
  formData.append("slug", document.getElementById("edit-article-slug").value);
  formData.append(
    "content",
    document.getElementById("edit-article-content").value,
  );
  formData.append(
    "category",
    document.getElementById("edit-article-category").value,
  );
  if (plantId) formData.append("plantId", plantId);
  const imageFile = document.getElementById("edit-article-image").files[0];
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`/api/wiki/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(
      document.getElementById("editArticleModal"),
    ).hide();
    loadAdminWiki();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}
async function loadProfile() {
  const content = document.getElementById("profile-content");
  if (!content) return;

  const token = getToken();
  if (!token) {
    window.location.href = "/auth/login";
    return;
  }

  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const user = await res.json();
    content.innerHTML = `
      <table class="table">
        <tr><td><strong>Felhasználónév</strong></td><td>${user.username}</td></tr>
        <tr><td><strong>Email</strong></td><td>${user.email}</td></tr>
        <tr><td><strong>Szerepkör</strong></td><td>${user.role}</td></tr>
      </table>
      <button class="btn btn-danger w-100" onclick="logout()">Kijelentkezés</button>
    `;
  } else {
    window.location.href = "/auth/login";
  }
}

// Admin oldal védelem
function adminGuard() {
  const token = getToken();
  if (!token) {
    window.location.href = "/auth/login";
    return;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") {
      window.location.href = "/";
    }
  } catch (e) {
    window.location.href = "/auth/login";
  }
}

// Csillagok megjelenítése
function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? "⭐" : "☆";
  }
  return stars;
}

async function deleteReview(reviewId, type, id, containerId) {
  if (!confirm("Biztosan törlöd az értékelést?")) return;
  const token = getToken();
  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    loadReviews(type, id, containerId);
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

function openEditReview(reviewId, rating, comment, type, id, containerId) {
  const reviewEl = document.getElementById(`review-${reviewId}`);
  reviewEl.innerHTML = `
    <div class="mb-2">
      <select id="edit-rating-${reviewId}" class="form-select form-select-sm mb-2">
        <option value="5" ${rating == 5 ? "selected" : ""}>⭐⭐⭐⭐⭐</option>
        <option value="4" ${rating == 4 ? "selected" : ""}>⭐⭐⭐⭐</option>
        <option value="3" ${rating == 3 ? "selected" : ""}>⭐⭐⭐</option>
        <option value="2" ${rating == 2 ? "selected" : ""}>⭐⭐</option>
        <option value="1" ${rating == 1 ? "selected" : ""}>⭐</option>
      </select>
      <textarea id="edit-comment-${reviewId}" class="form-control form-control-sm mb-2" rows="2">${comment}</textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success" onclick="saveEditReview(${reviewId}, '${type}', ${id}, '${containerId}')">Mentés</button>
        <button class="btn btn-sm btn-secondary" onclick="loadReviews('${type}', ${id}, '${containerId}')">Mégse</button>
      </div>
    </div>
  `;
}

async function saveEditReview(reviewId, type, id, containerId) {
  const token = getToken();
  const rating = document.getElementById(`edit-rating-${reviewId}`).value;
  const comment = document.getElementById(`edit-comment-${reviewId}`).value;

  const res = await fetch(`/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating: parseInt(rating), comment }),
  });

  if (res.ok) {
    loadReviews(type, id, containerId);
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

// Értékelések betöltése
async function loadReviews(type, id, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const res = await fetch(`/api/reviews/${type}/${id}`);
  const reviews = await res.json();

  if (reviews.length === 0) {
    container.innerHTML =
      '<p class="text-muted small">Még nincs értékelés.</p>';
    return;
  }

  const token = getToken();
  let currentUserId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.id;
    } catch (e) {}
  }

  container.innerHTML = reviews
    .map(
      (review) => `
    <div class="border-bottom pb-2 mb-2" id="review-${review.id}">
      <div class="d-flex justify-content-between align-items-center">
        <strong class="small">${review.User.username}</strong>
        <div class="d-flex align-items-center gap-2">
          <span id="stars-${review.id}">${renderStars(review.rating)}</span>
          ${
            currentUserId === review.userId
              ? `
            <button class="btn btn-sm btn-outline-warning" onclick="openEditReview(${review.id}, ${review.rating}, '${review.comment || ""}', '${type}', ${id}, '${containerId}')">✏️</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteReview(${review.id}, '${type}', ${id}, '${containerId}')">×</button>
          `
              : ""
          }
        </div>
      </div>
      <p class="small mb-0" id="comment-text-${review.id}">${review.comment || ""}</p>
      <small class="text-muted">${new Date(review.createdAt).toLocaleDateString("hu-HU")}</small>
    </div>
  `,
    )
    .join("");
}

// Értékelés hozzáadása
async function submitReview(type, id) {
  const token = getToken();
  if (!token) {
    alert("Bejelentkezés szükséges az értékeléshez!");
    return;
  }

  const rating = document.getElementById(`rating-${type}-${id}`).value;
  const comment = document.getElementById(`comment-${type}-${id}`).value;

  const body = { rating: parseInt(rating), comment };
  if (type === "plants") body.plantId = id;
  if (type === "products") body.productId = id;

  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (res.ok) {
    document.getElementById(`comment-${type}-${id}`).value = "";
    // Értékelések újratöltése
    const containerId = window.location.pathname.includes("/plants/")
      ? "plant-reviews"
      : window.location.pathname.includes("/shop/")
        ? "product-reviews"
        : `reviews-${type}-${id}`;
    loadReviews(type, id, containerId);
  } else {
    alert(data.message);
  }
}

// Növény részletes oldal
async function loadPlantDetail() {
  const container = document.getElementById("plant-detail");
  if (!container) return;

  const id = window.location.pathname.split("/").pop();

  const res = await fetch(`/api/plants/${id}`);
  if (!res.ok) {
    container.innerHTML = '<p class="text-danger">Növény nem található!</p>';
    return;
  }
  const plant = await res.json();
  const { avg, count } = await getAverageRating("plants", id);

  container.innerHTML = `
    <div class="row">
      <div class="col-md-5">
        ${plant.image ? `<img src="/uploads/${plant.image}" class="img-fluid rounded" style="max-height: 400px; object-fit: cover; width: 100%;">` : '<div class="bg-light d-flex align-items-center justify-content-center rounded" style="height: 400px;">🌱</div>'}
      </div>
      <div class="col-md-7">
        <h2 class="text-success">${plant.name}</h2>
        <p class="text-muted fst-italic">${plant.latin_name || ""}</p>
        <div class="mb-2">${renderStarAvg(avg, count)}</div>
        <p>${plant.description || ""}</p>
        <table class="table table-bordered">
          <tr><td><strong>Típus</strong></td><td>${plant.type}</td></tr>
          <tr><td><strong>Nehézség</strong></td><td>${plant.difficulty}</td></tr>
          <tr><td><strong>Öntözés</strong></td><td>💧 ${plant.watering_frequency || "N/A"}</td></tr>
          <tr><td><strong>Fényigény</strong></td><td>☀️ ${plant.sunlight || "N/A"}</td></tr>
        </table>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6">
        <h4 class="text-success">📖 Kapcsolódó wiki cikkek</h4>
        <div id="plant-wiki"></div>
      </div>
      <div class="col-md-6">
        <h4 class="text-success">⭐ Értékelések</h4>
        <div id="plant-reviews"></div>
        <div class="card p-3 mt-3">
          <h6>Értékelés hozzáadása</h6>
          <select id="rating-plants-${plant.id}" class="form-select mb-2">
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>
          <textarea id="comment-plants-${plant.id}" class="form-control mb-2" rows="3" placeholder="Vélemény (opcionális)"></textarea>
          <button class="btn btn-success" onclick="submitReview('plants', ${plant.id})">Értékelés küldése</button>
        </div>
      </div>
    </div>
  `;

  // Wiki cikkek betöltése
  const wikiRes = await fetch("/api/wiki");
  const articles = await wikiRes.json();
  const plantArticles = articles.filter((a) => a.plantId === plant.id);
  const wikiContainer = document.getElementById("plant-wiki");
  if (plantArticles.length === 0) {
    wikiContainer.innerHTML =
      '<p class="text-muted">Nincs kapcsolódó wiki cikk.</p>';
  } else {
    wikiContainer.innerHTML = plantArticles
      .map(
        (a) => `
      <div class="card p-3 mb-2">
        <h6 class="text-success">${a.title}</h6>
        <span class="badge bg-success mb-1">${a.category}</span>
        <p class="small">${a.content}</p>
      </div>
    `,
      )
      .join("");
  }

  // Értékelések betöltése
  loadReviews("plants", id, "plant-reviews");
}

// Termék részletes oldal
async function loadProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const id = window.location.pathname.split("/").pop();

  const res = await fetch(`/api/shop/products/${id}`);
  if (!res.ok) {
    container.innerHTML = '<p class="text-danger">Termék nem található!</p>';
    return;
  }
  const product = await res.json();
  const { avg, count } = await getAverageRating("products", id);

  container.innerHTML = `
    <div class="row">
      <div class="col-md-5">
        ${product.image ? `<img src="/uploads/${product.image}" class="img-fluid rounded" style="max-height: 400px; object-fit: cover; width: 100%;">` : '<div class="bg-light d-flex align-items-center justify-content-center rounded" style="height: 400px;">🛒</div>'}
      </div>
      <div class="col-md-7">
        <h2 class="text-success">${product.name}</h2>
        <div class="mb-2">${renderStarAvg(avg, count)}</div>
        <p>${product.description || ""}</p>
        <table class="table table-bordered">
          <tr><td><strong>Kategória</strong></td><td>${product.category}</td></tr>
          <tr><td><strong>Ár</strong></td><td>${product.price} Ft</td></tr>
          <tr><td><strong>Készlet</strong></td><td>${product.stock} db</td></tr>
        </table>
        <button class="btn btn-success btn-lg w-100" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">🛒 Kosárba</button>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <h4 class="text-success">⭐ Értékelések</h4>
        <div id="product-reviews"></div>
        <div class="card p-3 mt-3">
          <h6>Értékelés hozzáadása</h6>
          <select id="rating-products-${product.id}" class="form-select mb-2">
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>
          <textarea id="comment-products-${product.id}" class="form-control mb-2" rows="3" placeholder="Vélemény (opcionális)"></textarea>
          <button class="btn btn-success" onclick="submitReview('products', ${product.id})">Értékelés küldése</button>
        </div>
      </div>
    </div>
  `;

  loadReviews("products", id, "product-reviews");
}
// Sötét mód
function toggleDarkMode() {
  const body = document.body;
  const btn = document.getElementById("dark-mode-btn");
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    if (btn) btn.textContent = "☀️";
  } else {
    localStorage.setItem("darkMode", "disabled");
    if (btn) btn.textContent = "🌙";
  }
}

function loadDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  const btn = document.getElementById("dark-mode-btn");
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
    if (btn) btn.textContent = "☀️";
  }
}
async function loadMyOrders() {
  const container = document.getElementById("my-orders");
  if (!container) return;

  const token = getToken();
  if (!token) return;

  const res = await fetch("/api/shop/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const orders = await res.json();

  if (orders.length === 0) {
    container.innerHTML =
      '<p class="text-muted">Még nincsenek rendeléseid.</p>';
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
  <div class="card mb-3">
    <div class="card-header d-flex justify-content-between align-items-center">
      <strong>#${order.id} rendelés</strong>
      <span class="badge ${order.status === "teljesítve" ? "bg-success" : order.status === "törölve" ? "bg-danger" : "bg-warning text-dark"}">${order.status}</span>
    </div>
    <div class="card-body">
      <div class="row text-center mb-3">
        <div class="col-4">
          <small class="text-muted d-block">Szállítási cím</small>
          <strong>${order.shipping_address}</strong>
        </div>
        <div class="col-4">
          <small class="text-muted d-block">Végösszeg</small>
          <strong class="text-success">${order.total_price} Ft</strong>
        </div>
        <div class="col-4">
          <small class="text-muted d-block">Dátum</small>
          <strong>${new Date(order.createdAt).toLocaleDateString("hu-HU")}</strong>
        </div>
      </div>
      ${
        order.OrderItems && order.OrderItems.length > 0
          ? `
        <hr>
        <table class="table table-sm text-center">
          <thead>
            <tr>
              <th>Termék</th>
              <th>Mennyiség</th>
              <th>Egységár</th>
              <th>Összesen</th>
            </tr>
          </thead>
          <tbody>
            ${order.OrderItems.map(
              (item) => `
              <tr>
                <td>${item.Product ? item.Product.name : "Törölt termék"}</td>
                <td>${item.quantity} db</td>
                <td>${item.price} Ft</td>
                <td>${item.quantity * item.price} Ft</td>
              </tr>
            `,
            ).join("")}
          </tbody>
        </table>
      `
          : ""
      }
    </div>
  </div>
`,
    )
    .join("");
}

async function loadStats() {
  const countsContainer = document.getElementById("stats-counts");
  if (!countsContainer) return;

  const token = getToken();
  const res = await fetch("/api/admin/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    countsContainer.innerHTML =
      '<p class="text-danger">Hiba a statisztikák betöltésekor!</p>';
    return;
  }

  const data = await res.json();
  const { counts, orderStats, plantStats, productStats } = data;

  countsContainer.innerHTML = `
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">👥</div>
        <h3 class="text-success">${counts.users}</h3>
        <small class="text-muted">Felhasználó</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">🌱</div>
        <h3 class="text-success">${counts.plants}</h3>
        <small class="text-muted">Növény</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">🛒</div>
        <h3 class="text-success">${counts.products}</h3>
        <small class="text-muted">Termék</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">📦</div>
        <h3 class="text-success">${counts.orders}</h3>
        <small class="text-muted">Rendelés</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">📖</div>
        <h3 class="text-success">${counts.wiki}</h3>
        <small class="text-muted">Wiki cikk</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">💰</div>
        <h3 class="text-success">${counts.revenue.toLocaleString()}</h3>
        <small class="text-muted">Bevétel (Ft)</small>
      </div>
    </div>
  `;

  const colors = [
    "#198754",
    "#0d6efd",
    "#ffc107",
    "#dc3545",
    "#0dcaf0",
    "#6f42c1",
  ];

  const orderCtx = document.getElementById("orderChart");
  if (orderCtx && orderStats.length > 0) {
    new Chart(orderCtx, {
      type: "doughnut",
      data: {
        labels: orderStats.map((o) => o.status),
        datasets: [
          {
            data: orderStats.map((o) => parseInt(o.count)),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  const plantCtx = document.getElementById("plantChart");
  if (plantCtx && plantStats.length > 0) {
    new Chart(plantCtx, {
      type: "doughnut",
      data: {
        labels: plantStats.map((p) => p.type),
        datasets: [
          {
            data: plantStats.map((p) => parseInt(p.count)),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  const productCtx = document.getElementById("productChart");
  if (productCtx && productStats.length > 0) {
    new Chart(productCtx, {
      type: "doughnut",
      data: {
        labels: productStats.map((p) => p.category),
        datasets: [
          {
            data: productStats.map((p) => parseInt(p.count)),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }
}
async function loadStats() {
  const countsContainer = document.getElementById("stats-counts");
  if (!countsContainer) return;

  const token = getToken();
  const res = await fetch("/api/admin/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    countsContainer.innerHTML =
      '<p class="text-danger">Hiba a statisztikák betöltésekor!</p>';
    return;
  }

  const data = await res.json();
  const { counts, orderStats, plantStats, productStats } = data;

  countsContainer.innerHTML = `
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">👥</div>
        <h3 class="text-success">${counts.users}</h3>
        <small class="text-muted">Felhasználó</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">🌱</div>
        <h3 class="text-success">${counts.plants}</h3>
        <small class="text-muted">Növény</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">🛒</div>
        <h3 class="text-success">${counts.products}</h3>
        <small class="text-muted">Termék</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">📦</div>
        <h3 class="text-success">${counts.orders}</h3>
        <small class="text-muted">Rendelés</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">📖</div>
        <h3 class="text-success">${counts.wiki}</h3>
        <small class="text-muted">Wiki cikk</small>
      </div>
    </div>
    <div class="col-md-2 col-sm-4 col-6">
      <div class="card text-center p-3">
        <div style="font-size: 2rem;">💰</div>
        <h3 class="text-success">${counts.revenue.toLocaleString()}</h3>
        <small class="text-muted">Bevétel (Ft)</small>
      </div>
    </div>
  `;

  const colors = [
    "#198754",
    "#0d6efd",
    "#ffc107",
    "#dc3545",
    "#0dcaf0",
    "#6f42c1",
  ];

  const orderCtx = document.getElementById("orderChart");
  if (orderCtx && orderStats.length > 0) {
    new Chart(orderCtx, {
      type: "doughnut",
      data: {
        labels: orderStats.map((o) => o.status),
        datasets: [
          {
            data: orderStats.map((o) => parseInt(o.count)),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  const plantCtx = document.getElementById("plantChart");
  if (plantCtx && plantStats.length > 0) {
    new Chart(plantCtx, {
      type: "doughnut",
      data: {
        labels: plantStats.map((p) => p.type),
        datasets: [
          {
            data: plantStats.map((p) => parseInt(p.count)),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  const productCtx = document.getElementById("productChart");
  if (productCtx && productStats.length > 0) {
    new Chart(productCtx, {
      type: "doughnut",
      data: {
        labels: productStats.map((p) => p.category),
        datasets: [
          {
            data: productStats.map((p) => parseInt(p.count)),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }
}

// Kedvencek
async function toggleFavorite(type, id, btn) {
  const token = getToken();
  if (!token) {
    alert("Bejelentkezés szükséges a kedvencekhez!");
    return;
  }

  const isFav = btn.dataset.fav === "true";

  if (isFav) {
    const favId = btn.dataset.favId;
    const res = await fetch(`/api/favorites/${favId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      btn.dataset.fav = "false";
      btn.textContent = "🤍";
      btn.title = "Kedvencekhez adás";
    }
  } else {
    const body = type === "plant" ? { plantId: id } : { productId: id };
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      btn.dataset.fav = "true";
      btn.dataset.favId = data.favorite.id;
      btn.textContent = "❤️";
      btn.title = "Eltávolítás a kedvencekből";
    }
  }
}

async function checkFavoriteStatus(type, id, btn) {
  const token = getToken();
  if (!token) return;

  const param = type === "plant" ? `plantId=${id}` : `productId=${id}`;
  const res = await fetch(`/api/favorites/check?${param}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.isFavorite) {
    btn.dataset.fav = "true";
    btn.dataset.favId = data.favoriteId;
    btn.textContent = "❤️";
    btn.title = "Eltávolítás a kedvencekből";
  }
}

async function loadFavorites() {
  const container = document.getElementById("favorites-container");
  if (!container) return;

  const token = getToken();
  if (!token) {
    window.location.href = "/auth/login";
    return;
  }

  const res = await fetch("/api/favorites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const favorites = await res.json();

  if (favorites.length === 0) {
    container.innerHTML = '<p class="text-muted">Még nincsenek kedvenceid.</p>';
    return;
  }

  container.innerHTML = favorites
    .map((fav) => {
      const item = fav.Plant || fav.Product;
      const type = fav.Plant ? "növény" : "termék";
      const link = fav.Plant ? `/plants/${item.id}` : `/shop/${item.id}`;
      return `
      <div class="col-md-4">
        <div class="card h-100">
          ${item.image ? `<img src="/uploads/${item.image}" class="card-img-top" style="height: 200px; object-fit: cover;">` : '<div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">🌱</div>'}
          <div class="card-body">
            <h5 class="card-title text-success">${item.name}</h5>
            <span class="badge bg-success">${type}</span>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <a href="${link}" class="btn btn-success btn-sm">Részletek</a>
            <button class="btn btn-outline-danger btn-sm" onclick="removeFavoriteFromList(${fav.id}, this)">❤️ Eltávolítás</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

async function removeFavoriteFromList(favId, btn) {
  const token = getToken();
  const res = await fetch(`/api/favorites/${favId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    btn.closest(".col-md-4").remove();
  }
}

// Oldalbetöltéskor admin funkciók
document.addEventListener("DOMContentLoaded", () => {
  loadDarkMode();
  updateNavbar();
  updateCartBadge();
  loadProfile();
  loadPlantDetail();
  loadProductDetail();
  loadWikiDetail();
  loadStats();
  renderCart();
  loadMyOrders();
  loadFavorites();
  loadNutrientPlants();

  if (window.location.pathname.startsWith("/admin")) {
    adminGuard();
  }

  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.addEventListener("show.bs.modal", () => {
      renderCart();
    });
  }

  loadPlants();
  loadProducts();
  loadWiki();
  loadAdminUsers();
  loadAdminPlants();
  loadAdminProducts();
  loadAdminWiki();
  loadAdminOrders();
});
