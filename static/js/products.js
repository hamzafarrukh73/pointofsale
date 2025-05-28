document.addEventListener('DOMContentLoaded', () => {
    loadAll();

    document.getElementById('searchProductsForm').addEventListener('submit', searchProducts);
    document.getElementById('addProductForm').addEventListener('submit', addProduct);
    document.getElementById('editProductForm').addEventListener('submit', editProduct);
    
    document.getElementById('searchCategoriesForm').addEventListener('submit', searchCategories);
    document.getElementById('addCategoryForm').addEventListener('submit', addCategory);
    document.getElementById('editCategoryForm').addEventListener('submit', editCategory);

    document.getElementById("productImage").addEventListener("change", function(e) {
        const file = e.target.files[0];
        
        const reader = new FileReader();
        reader.addEventListener('load', function(e) {
            document.getElementById("addProductPreview").src = reader.result;
        });
        reader.readAsDataURL(file);
    });

    document.getElementById("editProductImage").addEventListener("change", function(e) {
        if (e.target.value !== ""){
            const file = e.target.files[0];

            const reader = new FileReader();
            reader.addEventListener('load', function(e) {
                document.getElementById("editProductPreview").src = reader.result;
            });
            reader.readAsDataURL(file);
        }
    });
});

function loadAll() {
    loadProducts();
    loadCategories();
}

let allProducts = [];

function loadProducts() {
    fetch('/products/fetch')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            populateProductsTable(allProducts);
        })
        .catch(error => console.error('Error:', error));
}

function populateProductsTable(products) {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-truncate">${product.name}</td>
            <td>${product.category_name}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>
                <div class="d-flex justify-content-center gap-1 h-25">
                    <button class="btn btn-sm btn-success text-truncate" style="width: 40%" onclick="openEditProductModal(${product.id}, '${product.name}', ${product.price}, ${product.quantity}, ${product.category_id}, '${product.image_url}')">Edit</button>
                    <button class="btn btn-sm btn-danger text-truncate" style="width: 40%" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
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
    
    populateProductsTable(filtered);
}

function openAddProductModal() {
    document.getElementById('addProductForm').reset();

    const defaultSrc = "static/images/no_preview.png";
    
    var preview = document.getElementById("addProductPreview"); 
    preview.src = defaultSrc;

    new bootstrap.Modal(document.getElementById('addProductModal')).show();
};

function addProduct(e) {
    e.preventDefault();

    const searchValue = document.getElementById('productName').value.toLowerCase();
    
    const filtered = allProducts.filter(product => {
        const matchesName = searchValue ? product.name.toLowerCase()  === searchValue : true;
        // const matchesDate = selectedDate ? orderDate === selectedDate : true;
        return matchesName;
    });

    if (filtered.length > 0) {
        document.getElementById("productName").className = "form-control form-control-sm is-invalid";
        document.getElementById("invalidProductName").className = "text-danger";
        return 0;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value.trim());
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('category_id', document.getElementById('productCategory').value);
    formData.append('quantity', document.getElementById('productStock').value);
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) formData.append('image', imageFile);

    fetch('/products/add', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(() => {
        document.getElementById('addProductForm').reset();
        document.getElementById("addProductPreview").src = "static/images/no_preview.png"; 
        loadProducts();
    })
    .catch(error => console.error('Error:', error));
}


function openEditProductModal(id, name, price, stock, categoryId, imageUrl) {
    // Reset file input
    document.getElementById('editProductImage').value = '';

    document.getElementById('editProductId').value = id;

    document.getElementById('editProductName').value = name;
    document.getElementById('editProductPrice').value = price;
    document.getElementById('editProductStock').value = stock;
    document.getElementById('editProductCategory').value = categoryId;
    
    // Show current image
    const imagePreview = document.getElementById('editProductPreview');
    if (imageUrl !== "null") {
        imagePreview.src = imageUrl;
    }
    else {
        imagePreview.src = 'static/images/no_preview.png';
    };

    new bootstrap.Modal(document.getElementById('editProductModal')).show();
}

function editProduct(e) {
    e.preventDefault();
    const formData = new FormData();
    const id = document.getElementById('editProductId').value;
    
    formData.append('name', document.getElementById('editProductName').value.trim());
    formData.append('price', document.getElementById('editProductPrice').value);
    formData.append('category_id', document.getElementById('editProductCategory').value);
    formData.append('quantity', document.getElementById('editProductStock').value);
    
    const imageFile = document.getElementById('editProductImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    fetch(`/products/edit/${id}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Get the existing modal instance and hide it
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            if (modal) { // Check if an instance exists
                modal.hide();
            } else {
                // Fallback or error handling if instance isn't found (unlikely if modal was shown)
                console.warn("Bootstrap modal instance not found, cannot hide.");
            }
            loadProducts();
        }
    })
    .catch(error => console.error('Error:', error));
}

function deleteProduct(id) {
    openConfirmDeleteModal();
    document.getElementById('confirmDeleteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        fetch(`/products/delete/${id}`, { method: 'POST' })
        .then(() => {
            // Get the existing modal instance and hide it
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
            if (modal) { // Check if an instance exists
                modal.hide();
            } else {
                // Fallback or error handling if instance isn't found (unlikely if modal was shown)
                console.warn("Bootstrap modal instance not found, cannot hide.");
            }
            loadProducts();
        })
        .catch(error => console.error('Error:', error));
    });
}

// function openRestockModal(itemId, currentQuantity) {
//     document.getElementById('restockItemId').value = itemId;
//     document.getElementById('restockQuantity').value = '';
//     new bootstrap.Modal(document.getElementById('restockModal')).show();
// }

// document.getElementById('restockForm').addEventListener('submit', function(e) {
//     e.preventDefault();
//     const itemId = document.getElementById('restockItemId').value;
//     const quantityToAdd = parseInt(document.getElementById('restockQuantity').value);
    
//     // if (quantityToAdd < 1) {
//     //     alert('Please enter a valid quantity');
//     //     return;
//     // }

//     fetch(`/api/inventory/${itemId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             quantity: parseInt(allProducts.find(item => item.id == itemId).quantity) + quantityToAdd
//         })
//     })
//     .then(response => response.json())
//     .then(updatedItem => {
//         // Update local data
//         const index = allProducts.findIndex(item => item.id == itemId);
//         allProducts[index] = updatedItem;
        
//         // Close modal and refresh display
//         new bootstrap.Modal(document.getElementById('restockModal')).hide();
//         populateProductsTable(allProducts);
//     })
//     .catch(error => console.error('Error:', error));
// });
