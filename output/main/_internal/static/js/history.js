document.addEventListener('DOMContentLoaded', () => {
    loadOrders();    

    document.getElementById('searchOrderId').addEventListener('input', filterOrders);
    document.getElementById('searchDate').addEventListener('change', filterOrders);
});

let allOrders = [];

function loadOrders() {
    fetch('/history/fetch')
        .then(response => response.json())
        .then(orders => {
            allOrders = orders;
            populateOrdersTable(orders);
        })
        .catch(error => console.error('Error:', error));
}

function populateOrdersTable(orders) {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${new Date(order.created_on).toLocaleString()}</td>
            <td>${order.total.toFixed(2)}</td>
            <td>
                <div class="d-flex justify-content-center gap-1 h-25">
                    <button class="btn btn-sm btn-success text-truncate" style="width: 40%" onclick="printInvoice(${order.id})">Print</button>
                    <button class="btn btn-sm btn-danger text-truncate" style="width: 40%" onclick="deleteOrder(${order.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterOrders() {
    const orderId = document.getElementById('searchOrderId').value.toLowerCase();
    const selectedDate = document.getElementById('searchDate').value;
    
    const filtered = allOrders.filter(order => {
        const matchesId = order.id.toString().includes(orderId);
        const orderDate = new Date(order.created_on).toISOString().split('T')[0];
        const matchesDate = selectedDate ? orderDate === selectedDate : true;
        return matchesId && matchesDate;
    });
    
    populateOrdersTable(filtered);
}

function clearSearch() {
    document.getElementById('searchOrderId').value = '';
    document.getElementById('searchDate').value = '';
    filterOrders();
}

function deleteOrder(id) {
    openConfirmDeleteModal();

    document.getElementById('confirmDeleteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        fetch(`/history/delete/${id}`, { method: 'POST' })
        .then(() => {
            // Get the existing modal instance and hide it
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
            if (modal) { // Check if an instance exists
                modal.hide();
            } else {
                // Fallback or error handling if instance isn't found (unlikely if modal was shown)
                console.warn("Bootstrap modal instance not found, cannot hide.");
            }
            loadOrders();
        })
        .catch(error => console.error('Error:', error));
    });
}

function printInvoice(orderId) {
    fetch(`/history/fetch/${orderId}`)
        .then(response => response.json())
        .then(orderData => {
            // Create temporary print container
            const printContainer = document.createElement('div');
            printContainer.innerHTML = document.getElementById('invoiceTemplate').innerHTML;
            
            // Populate invoice data
            printContainer.querySelector('#invoiceNumber').textContent = orderData.id;
            printContainer.querySelector('#invoiceDate').textContent = new Date(orderData.created_on).toLocaleString();
            printContainer.querySelector('#invoiceOrderType').textContent = orderData.order_type;

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
            itemsBody.innerHTML = orderData.items.map(item => `
                <tr>
                    <td colspan="2">${item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
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
        })
        .catch(error => console.error('Error:', error));
}

function updateMonthlySales() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlySales = allOrders
        .filter(order => {
            const orderDate = new Date(order.created_on);
            return orderDate.getMonth() === currentMonth && 
                   orderDate.getFullYear() === currentYear;
        })
        .reduce((sum, order) => sum + order.total, 0);

    document.getElementById('monthlySales').textContent = monthlySales.toFixed(2);
}