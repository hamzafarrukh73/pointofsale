document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    document.getElementById('orderType').value = ''; // Set the initial value to an empty string
    document.getElementById('searchProductsForm').addEventListener('submit', searchProducts);
    document.getElementById('discountValue').addEventListener('input', updateOrderDisplay);
    document.getElementById('discountType').addEventListener('change', function() {
        const discountValue = document.getElementById('discountValue');
        discountValue.disabled = this.value === '';
        if (this.value === '') discountValue.value = '';
        updateOrderDisplay();
    });
});

let allProducts = [];

function loadProducts() {
    fetch('/products/fetch')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            populateProductsContainer(allProducts);
        })
        .catch(error => console.error('Error:', error));
}

function populateProductsContainer(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
        
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'm-0';
        card.innerHTML = `
            <div class="card d-flex bg-success text-light">
                <div class="card-header">
                    <h6 class="text-truncate m-0" data-bs-toggle="tooltip" data-bs-title="${product.name}">${product.name}</h6>
                </div>
                <div class="card-body p-3">
                    <div class="row g-0">
                        <div class="col m-0">
                            <div class="d-flex justify-content-between align-items-center">
                                <p class="m-0 p-0 text-start text-truncate">Stk: ${product.quantity}</p>
                                <button class="btn btn-outline-light btn-sm w-50" onclick="addToOrder(${product.id}, '${product.name}', ${product.price})">Add</button>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    });
}

function searchProducts(e) {
    e.preventDefault();
    const searchValue = document.getElementById('searchProducts').value.toLowerCase();
    // const selectedDate = document.getElementById('searchDate').value;
    
    const filtered = allProducts.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchValue);
        // const matchesDate = selectedDate ? orderDate === selectedDate : true;
        return matchesName;
    });
    
    populateProductsContainer(filtered);
}

// function clearSearch() {
//     document.getElementById('searchItems').value = '';
//     searchItems();
// }

let currentOrder = {
    products: [],
    subtotal: 0,
    discount: 0,
    total: 0
};

function addToOrder(productId, productName, productPrice) {
    const existingItem = currentOrder.products.find(product => product.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentOrder.products.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    updateOrderDisplay();
}

function updateOrderDisplay() {
    calculateTotals();
    // Update displayed totals
    document.getElementById('orderSubtotal').textContent = currentOrder.subtotal.toFixed(2);
    document.getElementById('orderDiscount').textContent = `-${currentOrder.discount.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = currentOrder.total.toFixed(2);

    const container = document.getElementById('orderProducts');
    const totalElement = document.getElementById('orderTotal');
    let total = 0;
    
    container.innerHTML = currentOrder.products.length === 0 ? 
        '<p class="text-muted">No items added yet</p>' : 
        currentOrder.products.map(product => `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="m-0">${product.name}</h6>
                    <small class="text-muted">${product.price.toFixed(2)} per unit</small>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="adjustQuantity(${product.id}, -1)">
                        -
                    </button>
                    <span class="mx-2">${product.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="adjustQuantity(${product.id}, 1)">
                        +
                    </button>
                    <button class="btn btn-sm btn-danger ms-2" 
                            onclick="removeItem(${product.id})">
                        ×
                    </button>
                </div>
            </div>
        `).join('');
    
    // currentOrder.total = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = currentOrder.total.toFixed(2);
}

function adjustQuantity(productId, delta) {
    const product = currentOrder.products.find(product => product.id === productId);
    if (product) {
        product.quantity += delta;
        if (product.quantity < 1) {
            currentOrder.products = currentOrder.products.filter(product => product.id !== productId);
        }
        updateOrderDisplay();
    }
}

function removeItem(productId) {
    currentOrder.products = currentOrder.products.filter(product => product.id !== productId);
    updateOrderDisplay();
}

function clearOrder() {
    // if (confirm('Are you sure you want to clear the current order?')) {
        document.getElementById('orderType').value = '';
        document.getElementById('tableNumber').value = '';
        document.getElementById('discountType').selectedIndex = 0;
        currentOrder = { products: [], total: 0 };
        updateOrderDisplay();
    // }
}

function calculateTotals() {
    currentOrder.subtotal = currentOrder.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    
    if (discountType === 'percent') {
        currentOrder.discount = currentOrder.subtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
        currentOrder.discount = Math.min(discountValue, currentOrder.subtotal);
    } else {
        currentOrder.discount = 0;
    }
    
    currentOrder.total = currentOrder.subtotal - currentOrder.discount;
}

function saveOrder() {
    if (currentOrder.products.length === 0) {
        alert('Please add items to the order before saving');
        return;
    }

    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;

    if (discountType !== "None") {
        if (discountValue < 0) {
            alert('Discount should be positive.');
            return;
        }
    }
    
    const orderType = document.getElementById('orderType').value;

    if (!orderType) { // Check if orderType is empty
        alert('Please select an order type before saving');
        return;
    }
    else if (orderType === "Dine in") {
        order_range = document.getElementById('tableNumber').value;
        if (order_range < 1 || order_range > 10) {
            alert('Table Range should be between 1 and 10');
            return;
        }
    }

    const orderData = {
        products: currentOrder.products.map(product => ({
            id: product.id,
            quantity: product.quantity
        })),
        discount_type: discountType || null,
        discount_value: discountValue || null,
        order_type: orderType || null,
    };

    fetch('/checkout/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        printInvoice(data);
        loadProducts();
        clearOrder();
    })
    .catch(error => {
        alert(error.error || 'Failed to save order');
    });
}

function printInvoice(orderData) {
    // Create temporary print container
    const printContainer = document.createElement('div');
    printContainer.innerHTML = document.getElementById('invoiceTemplate').innerHTML;
    
    // Populate invoice data
    printContainer.querySelector('#invoiceNumber').textContent = orderData.id;
    printContainer.querySelector('#invoiceDate').textContent = new Date().toLocaleString();
    printContainer.querySelector('#invoiceOrderType').textContent = orderData.order_type;

    if (orderData.order_type === "Dine in"){
        printContainer.querySelector('#invoiceTable').classList.remove("d-none");
        printContainer.querySelector('#invoiceTableNumber').textContent = document.getElementById('tableNumber').value; 
    }
        

    const discount_type  = orderData.discount_type;
    if (discount_type === "percent"){
        printContainer.querySelector('#invoiceDiscount').textContent = orderData.discount_value + "%";
    }
    else{
        printContainer.querySelector('#invoiceDiscount').textContent = orderData.discount_value.toFixed(2);
    }
    printContainer.querySelector('#invoiceTotal').textContent = orderData.subtotal.toFixed(2);
    printContainer.querySelector('#invoiceGrandTotal').textContent = orderData.total.toFixed(2);
    
    const itemsBody = printContainer.querySelector('#invoiceItems');
    itemsBody.innerHTML = currentOrder.products.map(product => `
        <tr>
            <td colspan="2">${product.name}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>${(product.price * product.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    // Add print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            body * {
                visibility: hidden;
                margin: 0 !important;
                padding: 0 !important;
            }
            #invoiceContainer, #invoiceContainer * {
                visibility: visible;
            }
            #invoiceContainer {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
            }
        }
    `;
    
    // Create final container
    const invoiceContainer = document.createElement('div');
    invoiceContainer.id = 'invoiceContainer';
    invoiceContainer.appendChild(style);
    invoiceContainer.appendChild(printContainer);
    
    // Add to document
    document.body.appendChild(invoiceContainer);
    
    const duplicateCopy = printContainer.cloneNode(true); 
    invoiceContainer.appendChild(duplicateCopy);

    // Trigger print
    window.print();
    
    // Clean up after print
    setTimeout(() => {
        document.body.removeChild(invoiceContainer);
    }, 100);
}