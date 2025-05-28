function openCategoriesListModal() {
    populateCategoriesTable(allCategories);

    document.getElementById("searchCategoriesForm").reset();
    document.getElementById("addCategoryForm").reset();
    
    new bootstrap.Modal(document.getElementById('categoriesListModal')).show();
}

let allCategories = [];

function loadCategories() {
    fetch('/categories/fetch')
        .then(response => response.json())
        .then(categories => {
            allCategories = categories;
            populateCategoriesDropdown();
            populateCategoriesTable(allCategories);
        })
        .catch(error => console.error('Error:', error));
}

function populateCategoriesDropdown() {
    const addDropdown = document.getElementById('productCategory');
    const editDropdown = document.getElementById('editProductCategory');
    
    [addDropdown, editDropdown].forEach(dropdown => {
        dropdown.innerHTML = '<option value="" hidden>Select Category</option>';
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            dropdown.appendChild(option);
        });
    });
}

function populateCategoriesTable(categories) {
    const tbody = document.getElementById('categoriesTable');
    tbody.innerHTML = '';

    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td>
                <div class="d-flex justify-content-center gap-2 h-25">
                    <button class="btn btn-sm btn-success text-truncate" style="width: 25%;" onclick="openEditCategoryModal(${category.id}, '${category.name}')">Edit</button>
                    <button class="btn btn-sm btn-danger text-truncate" style="width: 25%;" onclick="deleteCategory(${category.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function searchCategories(e) {
    e.preventDefault();
    const searchValue = document.getElementById('searchCategories').value.toLowerCase();
    
    const filteredCategories = allCategories.filter(category => {
        const matchesName = category.name.toLowerCase().includes(searchValue);
        return matchesName;
    });
    
    populateCategoriesTable(filteredCategories);
}

function addCategory(e) {
    e.preventDefault();
    const name = document.getElementById('categoryName').value.trim();
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }

    fetch('categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(response => response.json())
    .then(() => {
        document.getElementById('categoryName').value = '';
        loadCategories();
    })
    .catch(error => console.error('Error:', error));
}

function openEditCategoryModal(id, name) {
    document.getElementById('editCategoryId').value = id;
    document.getElementById('editCategoryName').value = name;
    new bootstrap.Modal(document.getElementById('editCategoryModal')).show();
}

function editCategory(e) {
    e.preventDefault();
    const id = document.getElementById('editCategoryId').value;
    const name = document.getElementById('editCategoryName').value.trim();
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }

    fetch(`/categories/edit/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(response => {
        if (response.ok) {
            // Get the existing modal instance and hide it
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
            if (editModal) { // Check if an instance exists
                editModal.hide();
            } else {
                // Fallback or error handling if instance isn't found (unlikely if modal was shown)
                console.warn("Bootstrap modal instance not found, cannot hide.");
            }
            loadCategories();
        }
    })
    .catch(error => console.error('Error:', error));
}

function deleteCategory(id) {
    openConfirmDeleteModal();
    document.getElementById('confirmDeleteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        fetch(`/categories/delete/${id}`, { method: 'POST' })
        .then(() => {
            // Get the existing modal instance and hide it
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
            if (modal) { // Check if an instance exists
                modal.hide();
            } else {
                // Fallback or error handling if instance isn't found (unlikely if modal was shown)
                console.warn("Bootstrap modal instance not found, cannot hide.");
            }
            loadCategories();
        })
        .catch(error => console.error('Error:', error));
    });
    
}
