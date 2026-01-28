const tbody = document.getElementById('phonesTbody');
const msgBox = document.getElementById('msg');
const phoneForm = document.getElementById('phoneForm');

// message Box
function clearMsg() {
    msgBox.innerHTML = '';
}

function showMsg(type, text) {
    msgBox.innerHTML = `
    <div class="alert alert-${type} mb-0" role="alert">
      ${text}
      <button type="button" class="btn-close" aria-label="Close" id="msgCloseBtn"></button>
    </div>
  `;

    const btn = document.getElementById('msgCloseBtn');
    if (btn) {
        btn.addEventListener('click', clearMsg); // Fixed: lowercase 'click' and correct function name
    }
}

// Render Phones Table
function renderPhones(phones) {
    tbody.innerHTML = '';

    if (!phones || phones.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 11;
        td.className = 'text-center text-muted py-4';
        td.textContent = 'No phones found.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    for (const p of phones) {
        const tr = document.createElement('tr');

        const cells = [
            p.id,
            p.brand,
            p.model,
            p.ram,
            p.storage,
            p.color,
            p.purchasePrice,
            p.sellingPrice,
            p.quantity,
            p.status,
            '—',
        ];

        for (const value of cells) {
            const td = document.createElement('td');
            td.textContent = value ?? '';
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }
}

const refreshBtn = document.getElementById('refreshBtn');

refreshBtn.addEventListener('click', loadPhones);

// load table
async function loadPhones(filters = {}) {
    tbody.innerHTML = `
    <tr>
      <td colspan="11" class="text-center py-4">Loading...</td>
    </tr>
  `;

    const params = new URLSearchParams();
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.model) params.set('model', filters.model);

    const url = params.toString() ? `/phones?${params.toString()}` : '/phones';

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const phones = await res.json();
        renderPhones(phones);
    } catch (err) {
        renderPhones([]);
        showMsg('danger', 'Failed to load phones. Check server is running.');
        console.error(err);
    }
}

// auto load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadPhones());
} else {
    loadPhones();
}

// addPhones
if (phoneForm) {
    phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const brand = document.getElementById('brand').value.trim();
        const model = document.getElementById('model').value.trim();
        const ram = document.getElementById('ram').value;
        const storage = document.getElementById('storage').value;
        const color = document.getElementById('color').value.trim();
        const purchasePrice = document.getElementById('purchasePrice').value;
        const sellingPrice = document.getElementById('sellingPrice').value;
        const quantity = document.getElementById('quantity').value;
        const status = document.getElementById('status').value;

        // validation
        if (!brand || !model || !color) {
            showMsg('danger', 'Brand, model, and color are required.');
            return;
        }

        const payload = {
            brand,
            model,
            ram: Number(ram),
            storage: Number(storage),
            color,
            purchasePrice: String(purchasePrice),
            sellingPrice: String(sellingPrice),
            quantity: Number(quantity),
            status,
        };

        try {
            const res = await fetch('/phones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    data && (data.error || data.message)
                        ? data.error || data.message
                        : 'Failed to add phone.';
                showMsg('danger', msg);
                return;
            }

            showMsg('success', 'Phone added successfully');
            phoneForm.reset();
            await loadPhones();
        } catch (err) {
            console.error(err);
            showMsg('danger', 'Server error while adding phone.');
        }
    });
}

// search/filter
const searchBrand = document.getElementById('searchBrand');
const searchModel = document.getElementById('searchModel');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const brand = searchBrand ? searchBrand.value.trim() : '';
        const model = searchModel ? searchModel.value.trim() : '';

        loadPhones({ brand, model });
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (searchBrand) searchBrand.value = '';
        if (searchModel) searchModel.value = '';

        loadPhones();
    });
}
