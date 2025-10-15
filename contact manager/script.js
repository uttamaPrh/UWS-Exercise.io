
// Array to hold all contact objects
let contacts = [];

// ID of the contact currently being edited (null if none)
let currentEditId = null;

// ID of the contact marked for deletion (null if none)
let deleteTargetId = null;

// Object to keep track of current sorting state: which key and order (asc/desc)
let currentSort = { key: null, order: 'asc' };

// Current page number for pagination
let currentPage = 1;

// Number of contacts to show per page
const pageSize = 5;

// --------------------
// Initialization
// --------------------

// On page load, load contacts from localStorage and setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadContacts(); // Load saved contacts and display them
    document.getElementById('search').addEventListener('input', searchContacts); // Setup search input listener
});

// --------------------
// Load & Save Contacts
// --------------------

// Loads contacts from localStorage into the contacts array and displays them
function loadContacts() {
    // Retrieve the 'contacts' item from localStorage, or initialize empty array if none found
    contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    displayContacts(); // Render contacts on the page
}

// Saves the current contacts array into localStorage to persist data
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// --------------------
// Pagination Logic
// --------------------

// Returns a subset (page) of the contact list based on the current page number and page size
function paginate(list, page = 1) {
    const start = (page - 1) * pageSize; // Calculate start index for slice
    return list.slice(start, start + pageSize); // Return the slice corresponding to current page
}

// Renders the pagination buttons (<Prev 1 2 3 Next>) based on total items and current page
function renderPagination(total, page) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Clear existing pagination controls

    // If total contacts less than or equal to one page, no pagination needed
    if (total <= pageSize) return;

    const totalPages = Math.ceil(total / pageSize); // Calculate total number of pages

    // Previous page button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '< Prev';
    prevBtn.disabled = page === 1; // Disable if on first page
    prevBtn.onclick = () => changePage(page - 1);
    pagination.appendChild(prevBtn);

    // Buttons for each page number
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === page) btn.classList.add('active'); // Highlight the current page
        btn.onclick = () => changePage(i);
        pagination.appendChild(btn);
    }

    // Next page button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next >';
    nextBtn.disabled = page === totalPages; // Disable if on last page
    nextBtn.onclick = () => changePage(page + 1);
    pagination.appendChild(nextBtn);
}

// Changes the current page and refreshes the displayed contacts accordingly
function changePage(page) {
    currentPage = page;
    displayContacts();
}

// --------------------
// Display Contacts
// --------------------

// Displays contacts in the table. If 'list' is provided, displays that filtered list.
// 'isSearch' flag indicates whether this is a search result (to display appropriate messages)
function displayContacts(list = contacts, isSearch = false) {
    const tbody = document.querySelector('#contacts-table tbody');
    const emptyDefault = document.getElementById('empty-default'); // Message for no contacts at all
    const emptySearch = document.getElementById('empty-search');   // Message for no search results
    const pagination = document.getElementById('pagination');

    tbody.innerHTML = '';          // Clear existing table rows
    emptyDefault.style.display = 'none'; // Hide default empty message
    emptySearch.style.display = 'none';  // Hide search empty message
    pagination.style.display = 'none';   // Hide pagination initially

    // If no contacts to display
    if (list.length === 0) {
        if (isSearch) emptySearch.style.display = 'block'; // Show "No contacts found" message if searching
        else emptyDefault.style.display = 'block';         // Show "No contacts yet" message if empty
        return; // Nothing else to render
    }

    // Get only the contacts for the current page
    const paginatedList = paginate(list, currentPage);

    // Create table rows for each contact in current page
    paginatedList.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${contact.name}</td>
          <td>${contact.phone}</td>
          <td>${contact.email}</td>
          <td class="action-buttons">
            <button class="edit" onclick="openEditModal(${contact.id})">Edit</button>
            <button class="delete" onclick="openDeleteModal(${contact.id})">Delete</button>
          </td>`;
        tbody.appendChild(row);
    });

    // Show pagination controls and render them based on total contacts
    pagination.style.display = 'flex';
    renderPagination(list.length, currentPage);
}

// --------------------
// Add Contact Functions
// --------------------

// Opens the modal dialog to add a new contact
function openAddModal() {
    document.getElementById('add-modal').style.display = 'flex';
}

// Closes the Add Contact modal and clears input fields
function closeAddModal() {
    document.getElementById('add-modal').style.display = 'none';
    document.getElementById('add-name').value = '';
    document.getElementById('add-phone').value = '';
    document.getElementById('add-email').value = '';
}

// Validates input and adds a new contact to the list and storage
function addContact() {
    const name = document.getElementById('add-name').value.trim();
    const phone = document.getElementById('add-phone').value.trim();
    const email = document.getElementById('add-email').value.trim();

    // Simple validation to ensure no empty fields
    if (!name || !phone || !email) {
        alert('Please fill all fields');
        return;
    }

    // Create new contact with a unique ID (timestamp)
    const newContact = { id: Date.now(), name, phone, email };

    // Add new contact to contacts array and save
    contacts.push(newContact);
    saveContacts();

    // Reset to first page and update display
    currentPage = 1;
    closeAddModal();
    displayContacts();
}

// --------------------
// Edit Contact Functions
// --------------------

// Opens the Edit modal and populates fields with selected contact data
function openEditModal(id) {
    currentEditId = id;
    const c = contacts.find(x => x.id === id);
    if (!c) return; // If contact not found, exit

    document.getElementById('edit-name').value = c.name;
    document.getElementById('edit-phone').value = c.phone;
    document.getElementById('edit-email').value = c.email;
    document.getElementById('edit-modal').style.display = 'flex';
}

// Closes the Edit Contact modal without saving changes
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Saves the edited contact details after validation
function saveEdit() {
    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const email = document.getElementById('edit-email').value.trim();

    // Validate fields
    if (!name || !phone || !email) {
        alert('Please fill all fields');
        return;
    }

    // Find index of contact being edited
    const i = contacts.findIndex(c => c.id === currentEditId);
    if (i !== -1) {
        // Update contact data
        contacts[i] = { id: currentEditId, name, phone, email };
        saveContacts();
        closeEditModal();
        displayContacts();
    }
}

// --------------------
// Delete Contact Functions
// --------------------

// Opens the confirmation modal for deleting a contact
function openDeleteModal(id) {
    deleteTargetId = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

// Closes the Delete confirmation modal without deleting
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

// Confirms deletion, removes contact from array and updates storage/display
function confirmDelete() {
    contacts = contacts.filter(c => c.id !== deleteTargetId);
    saveContacts();
    closeDeleteModal();
    displayContacts();
}

// --------------------
// Search Contacts
// --------------------

// Filters contacts based on search input and displays matching results
function searchContacts() {
    const query = document.getElementById('search').value.toLowerCase();

    // Filter contacts where name, phone, or email contains the query string
    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );

    currentPage = 1; // Reset to first page on new search
    displayContacts(filtered, true); // Display filtered contacts with search flag
}

// --------------------
// Sorting Contacts
// --------------------

// Sorts the contacts by given key ('name' or 'email'), toggling between ascending/descending
function sortContacts(key) {
    // If already sorting by this key, toggle order
    if (currentSort.key === key) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        // Otherwise, set key and default to ascending
        currentSort.key = key;
        currentSort.order = 'asc';
    }

    // Update the sorting icons for UI feedback
    const icons = {
        name: document.getElementById('sort-name'),
        email: document.getElementById('sort-email')
    };

    // Reset both icons to default state
    icons.name.textContent = '▲▼';
    icons.email.textContent = '▲▼';

    // Set active icon for current sort key
    icons[key].textContent = currentSort.order === 'asc' ? '▲' : '▼';

    // Perform the sorting on contacts array (case insensitive)
    contacts.sort((a, b) => {
        const A = a[key].toLowerCase();
        const B = b[key].toLowerCase();

        if (A < B) return currentSort.order === 'asc' ? -1 : 1;
        if (A > B) return currentSort.order === 'asc' ? 1 : -1;
        return 0;
    });

    saveContacts();    // Save sorted list
    currentPage = 1;   // Reset to first page after sort
    displayContacts(); // Re-render contacts table
}
