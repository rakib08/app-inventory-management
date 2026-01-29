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

    currentPhones = phones || [];

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
        ];

        for (const value of cells) {
            const td = document.createElement('td');
            td.textContent = value ?? '';
            tr.appendChild(td);
        }

        const actionTd = document.createElement('td');
        actionTd.innerHTML = `
            <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${p.id}">Edit</button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}">Delete</button>
            </div>
        `;

        tr.appendChild(actionTd);

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
let currentPhones = [];
let editingId = null;

const submitBtn = phoneForm ? phoneForm.querySelector('button[type="submit"]') : null;

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
            const url = editingId ? `/phones/${editingId}` : '/phones';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    data && (data.error || data.message)
                        ? data.error || data.message
                        : editingId
                          ? 'Failed to update phone.'
                          : 'Failed to add phone.';
                showMsg('danger', msg);
                return;
            }

            showMsg(
                'success',
                editingId ? 'Phone updated successfully' : 'Phone added successfully',
            );
            editingId = null;
            if (submitBtn) submitBtn.textContent = 'Add Phone';
            phoneForm.reset();
            await loadPhones();
        } catch (err) {
            console.error(err);
            showMsg(
                'danger',
                editingId
                    ? 'Server error while updating phone.'
                    : 'Server error while adding phone.',
            );
        }
    });

    phoneForm.addEventListener('reset', () => {
        editingId = null;
        if (submitBtn) submitBtn.textContent = 'Add Phone';
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

// delete or edite
tbody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const delBtn = e.target.closest('.btn-delete');

    // EDIT
    if (editBtn) {
        const id = Number(editBtn.dataset.id);
        const phone = currentPhones.find((x) => x.id === id);
        if (!phone) return;

        // fill form
        document.getElementById('brand').value = phone.brand ?? '';
        document.getElementById('model').value = phone.model ?? '';
        document.getElementById('ram').value = phone.ram ?? '';
        document.getElementById('storage').value = phone.storage ?? '';
        document.getElementById('color').value = phone.color ?? '';
        document.getElementById('purchasePrice').value = phone.purchasePrice ?? '';
        document.getElementById('sellingPrice').value = phone.sellingPrice ?? '';
        document.getElementById('quantity').value = phone.quantity ?? '';
        document.getElementById('status').value = phone.status ?? 'in_stock';

        editingId = id;
        if (submitBtn) submitBtn.textContent = 'Update Phone';
        showMsg('info', `Editing phone #${id}. Submit to update.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // DELETE
    if (delBtn) {
        const id = Number(delBtn.dataset.id);
        const ok = confirm(`Delete phone #${id}?`);
        if (!ok) return;

        try {
            const res = await fetch(`/phones/${id}`, { method: 'DELETE' });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showMsg('danger', data && data.error ? data.error : 'Delete failed');
                return;
            }

            showMsg('success', 'Deleted successfully!');
            await loadPhones();
        } catch (err) {
            console.error(err);
            showMsg('danger', 'Network/server error while deleting.');
        }
    }
});
