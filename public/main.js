const tbody = document.getElementById("phonesTbody");
const msgBox = document.getElementById("msg");

function showMsg(type, text) {
  msgBox.innerHTML = `
    <div class="alert alert-${type} mb-0" role="alert">
      ${text}
    </div>
  `;
}

// Render Phones Table
function renderPhones(phones){
    tbody.innerHTML = "";

    if (!phones || phones.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 11;
        td.className = "text-center text-muted py-4";
        td.textContent = "No phones found.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    for (const p of phones) {
    const tr = document.createElement("tr");

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
      "—" // actions for future
    ];

    for (const value of cells) {
      const td = document.createElement("td");
      td.textContent = value ?? "";
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
}

async function loadPhones() {
  // show loading row
  tbody.innerHTML = `
    <tr>
      <td colspan="11" class="text-center py-4">Loading...</td>
    </tr>
  `;

  msgBox.innerHTML = "";

  try {
    const res = await fetch("/phones"); // because backend is mounted at /phones
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const phones = await res.json();
    renderPhones(phones);
  } catch (err) {
    renderPhones([]);
    showMsg("danger", "Failed to load phones. Check server is running.");
    console.error(err);
  }
}

// ===== 5) Auto-load when page opens =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadPhones);
} else {
  loadPhones();
}
