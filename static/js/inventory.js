document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    document.getElementById('searchInventory').addEventListener('input', filterInventory);
});

let allItems = [];

function loadInventory() {
    fetch('/api/inventory')
        .then(response => response.json())
        .then(items => {
            allItems = items;
            populateInventoryTable(items);
        })
        .catch(error => console.error('Error:', error));
}

function populateInventoryTable(items) {
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>
                ${item.image_url ? 
                    `<img src="${item.image_url}" alt="${item.name}" class="img-thumbnail" style="max-width: 80px;">` : 
                    'No Image'}
            </td>
            <td>${item.name}</td>
            <td>${item.category_name}</td>
            <td>${item.price.toFixed(2)}</td>
            <td class="${item.quantity < 10 ? 'text-danger fw-bold' : ''}">${item.quantity}</td>
            <td>
                <button class="btn btn-sm btn-warning" 
                        onclick="openRestockModal(${item.id}, ${item.quantity})">
                    Restock
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterInventory() {
    const searchTerm = this.value.toLowerCase();
    const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.category_name.toLowerCase().includes(searchTerm) ||
        item.id.toString().includes(searchTerm)
    );
    populateInventoryTable(filtered);
}

function openRestockModal(itemId, currentQuantity) {
    document.getElementById('restockItemId').value = itemId;
    document.getElementById('restockQuantity').value = '';
    new bootstrap.Modal(document.getElementById('restockModal')).show();
}

document.getElementById('restockForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const itemId = document.getElementById('restockItemId').value;
    const quantityToAdd = parseInt(document.getElementById('restockQuantity').value);
    
    // if (quantityToAdd < 1) {
    //     alert('Please enter a valid quantity');
    //     return;
    // }

    fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quantity: parseInt(allItems.find(item => item.id == itemId).quantity) + quantityToAdd
        })
    })
    .then(response => response.json())
    .then(updatedItem => {
        // Update local data
        const index = allItems.findIndex(item => item.id == itemId);
        allItems[index] = updatedItem;
        
        // Close modal and refresh display
        new bootstrap.Modal(document.getElementById('restockModal')).hide();
        populateInventoryTable(allItems);
    })
    .catch(error => console.error('Error:', error));
});