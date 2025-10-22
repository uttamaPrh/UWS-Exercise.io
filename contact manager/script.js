// Default avatar image URL for contacts without a custom image
const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

// Retrieve existing contacts from localStorage or initialize an empty array
let contacts = JSON.parse(localStorage.getItem('contacts')) || [];

// Variables to manage editing, deleting, and pagination
let currentEditId = null;
let deleteTargetId = null;
let currentPage = 1;

// Responsive settings: determine device type and contacts per page
const isMobile = () => window.innerWidth <= 768;
const perPage = () => (isMobile() ? 6 : 12);

// Load contacts after DOM is ready and update display on window resize
document.addEventListener('DOMContentLoaded', () => displayContacts());
window.addEventListener('resize', () => displayContacts());

// Add event listener for search functionality
document.getElementById('search').addEventListener('input', searchContacts);

// Displays a preview of the selected image before adding or editing a contact
function previewImage(input, previewId) {
    const file = input.files[0]; // Get the first selected image file from the input element
    const preview = document.getElementById(previewId); 
 // Create a FileReader to read the file and set image source to the file content
    if (file) {
        const reader = new FileReader();
        reader.onload = e => preview.src = e.target.result; 
        reader.readAsDataURL(file);
    } else {
        //default avatar if no file is selected
        preview.src = defaultAvatar;
    }
}


// Paginate contacts for display
function paginate(list) {
    const start = (currentPage - 1) * perPage();
    const end = start + perPage();
    return list.slice(start, end);
}

// Render pagination buttons dynamically
function renderPagination(list) {
    const totalPages = Math.ceil(list.length / perPage());
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous page button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '⟨ Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.className = currentPage === 1 ? 'disabled' : '';
    prevBtn.onclick = () => { currentPage--; displayContacts(list); };
    pagination.appendChild(prevBtn);

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => { currentPage = i; displayContacts(list); };
        pagination.appendChild(btn);
    }

    // Next page button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next ⟩';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.className = currentPage === totalPages ? 'disabled' : '';
    nextBtn.onclick = () => { currentPage++; displayContacts(list); };
    pagination.appendChild(nextBtn);
}

// Display all contacts in grid view
function displayContacts(list = contacts, isSearch = false) {
    const grid = document.getElementById('contacts-grid');
    const emptyDefault = document.getElementById('empty-default');
    const emptySearch = document.getElementById('empty-search');
    grid.innerHTML = '';
    emptyDefault.style.display = 'none';
    emptySearch.style.display = 'none';

    // Handle empty state for default or search
    if (list.length === 0) {
        (isSearch ? emptySearch : emptyDefault).style.display = 'block';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // Render paginated contact cards
    const paginated = paginate(list);
    paginated.forEach(c => {
        const card = document.createElement('div');
        card.className = 'contact-card';
        card.innerHTML = `
          <img src="${c.image || defaultAvatar}" alt="${c.name}">
          <h4>${c.name}</h4>
        `;
        card.onclick = () => openViewModal(c.id);
        grid.appendChild(card);
    });

    // Render pagination controls
    renderPagination(list);
}

// Open modal to add a new contact
function openAddModal() {
    document.getElementById('add-modal').style.display = 'flex';
    document.getElementById('add-preview').src = defaultAvatar;
}

// Close add contact modal and reset fields
function closeAddModal() {
    document.getElementById('add-modal').style.display = 'none';
    document.getElementById('add-name').value = '';
    document.getElementById('add-phone').value = '';
    document.getElementById('add-email').value = '';
    document.getElementById('add-image').value = '';
}

// Add a new contact and store it in localStorage
function addContact() {
    const name = document.getElementById('add-name').value.trim();
    const phone = document.getElementById('add-phone').value.trim();
    const email = document.getElementById('add-email').value.trim();
    const image = document.getElementById('add-preview').src;
    //check if the required fields are filled or not
    if (!name || !phone || !email) return alert("Please fill all fields.");

    contacts.unshift({ id: Date.now(), name, phone, email, image });
    localStorage.setItem('contacts', JSON.stringify(contacts)); // Save updated contacts
    closeAddModal();
    currentPage = 1;
    displayContacts();
}

// Open contact view modal
function openViewModal(id) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    document.getElementById('view-avatar').src = c.image || defaultAvatar;
    document.getElementById('view-details').innerHTML = `
        <p><strong>Name:</strong> ${c.name}</p>
        <p><strong>Phone:</strong> ${c.phone}</p>
        <p><strong>Email:</strong> ${c.email}</p>`;
    document.getElementById('view-modal').style.display = 'flex';

    // Assign actions for edit and delete buttons
    document.getElementById('view-edit-btn').onclick = () => { closeViewModal(); openEditModal(id); };
    document.getElementById('view-delete-btn').onclick = () => { closeViewModal(); openDeleteModal(id); };
}

// Close the view contact modal
function closeViewModal() { document.getElementById('view-modal').style.display = 'none'; }

// Open modal for editing a selected contact
function openEditModal(id) {
    currentEditId = id;
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    document.getElementById('edit-name').value = c.name;
    document.getElementById('edit-phone').value = c.phone;
    document.getElementById('edit-email').value = c.email;
    document.getElementById('edit-preview').src = c.image || defaultAvatar;
    document.getElementById('edit-modal').style.display = 'flex';
}

// Close edit contact modal
function closeEditModal() { document.getElementById('edit-modal').style.display = 'none'; }

// Save edited contact details and update localStorage
function saveEdit() {
    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const image = document.getElementById('edit-preview').src;
    if (!name || !phone || !email) return alert("Please fill all fields.");

    const i = contacts.findIndex(c => c.id === currentEditId);
    if (i !== -1) {
        contacts[i] = { ...contacts[i], name, phone, email, image };
        localStorage.setItem('contacts', JSON.stringify(contacts)); // Update stored data
        closeEditModal();
        displayContacts();
    }
}

// Open delete confirmation modal
function openDeleteModal(id) {
    deleteTargetId = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() { document.getElementById('delete-modal').style.display = 'none'; }

// Confirm deletion and remove contact from localStorage
function confirmDelete() {
    contacts = contacts.filter(c => c.id !== deleteTargetId);
    localStorage.setItem('contacts', JSON.stringify(contacts)); // Update stored contacts
    closeDeleteModal();
    displayContacts();
}

// Search contacts by name
function searchContacts() {
    const q = document.getElementById('search').value.toLowerCase();
    const filtered = contacts.filter(c => c.name.toLowerCase().includes(q));
    currentPage = 1;
    displayContacts(filtered, true);
}

// Global click event to close modals when clicking outside
window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) modal.style.display = 'none';
    });
});
