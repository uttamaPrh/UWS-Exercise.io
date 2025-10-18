
        const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
        let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        let currentEditId = null;
        let deleteTargetId = null;
        let currentPage = 1;

        const isMobile = () => window.innerWidth <= 768;
        const perPage = () => (isMobile() ? 6 : 12);

        document.addEventListener('DOMContentLoaded', () => displayContacts());
        window.addEventListener('resize', () => displayContacts());
        document.getElementById('search').addEventListener('input', searchContacts);

        function previewImage(input, previewId) {
            const file = input.files[0];
            const preview = document.getElementById(previewId);
            if (file) {
                const reader = new FileReader();
                reader.onload = e => preview.src = e.target.result;
                reader.readAsDataURL(file);
            } else {
                preview.src = defaultAvatar;
            }
        }

        function paginate(list) {
            const start = (currentPage - 1) * perPage();
            const end = start + perPage();
            return list.slice(start, end);
        }

        function renderPagination(list) {
            const totalPages = Math.ceil(list.length / perPage());
            const pagination = document.getElementById('pagination');
            pagination.innerHTML = '';

            if (totalPages <= 1) return;

            const prevBtn = document.createElement('button');
            prevBtn.textContent = '⟨ Prev';
            prevBtn.disabled = currentPage === 1;
            prevBtn.className = currentPage === 1 ? 'disabled' : '';
            prevBtn.onclick = () => { currentPage--; displayContacts(list); };
            pagination.appendChild(prevBtn);

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                btn.className = i === currentPage ? 'active' : '';
                btn.onclick = () => { currentPage = i; displayContacts(list); };
                pagination.appendChild(btn);
            }

            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next ⟩';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.className = currentPage === totalPages ? 'disabled' : '';
            nextBtn.onclick = () => { currentPage++; displayContacts(list); };
            pagination.appendChild(nextBtn);
        }

        function displayContacts(list = contacts, isSearch = false) {
            const grid = document.getElementById('contacts-grid');
            const emptyDefault = document.getElementById('empty-default');
            const emptySearch = document.getElementById('empty-search');
            grid.innerHTML = '';
            emptyDefault.style.display = 'none';
            emptySearch.style.display = 'none';

            if (list.length === 0) {
                (isSearch ? emptySearch : emptyDefault).style.display = 'block';
                document.getElementById('pagination').innerHTML = '';
                return;
            }

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

            renderPagination(list);
        }

        function openAddModal() {
            document.getElementById('add-modal').style.display = 'flex';
            document.getElementById('add-preview').src = defaultAvatar;
        }

        function closeAddModal() {
            document.getElementById('add-modal').style.display = 'none';
            document.getElementById('add-name').value = '';
            document.getElementById('add-phone').value = '';
            document.getElementById('add-email').value = '';
            document.getElementById('add-image').value = '';
        }

        function addContact() {
            const name = document.getElementById('add-name').value.trim();
            const phone = document.getElementById('add-phone').value.trim();
            const email = document.getElementById('add-email').value.trim();
            const image = document.getElementById('add-preview').src;
            if (!name || !phone || !email) return alert("Please fill all fields.");

            contacts.unshift({ id: Date.now(), name, phone, email, image });
            localStorage.setItem('contacts', JSON.stringify(contacts));
            closeAddModal();
            currentPage = 1;
            displayContacts();
        }

        function openViewModal(id) {
            const c = contacts.find(x => x.id === id);
            if (!c) return;
            document.getElementById('view-avatar').src = c.image || defaultAvatar;
            document.getElementById('view-details').innerHTML = `
        <p><strong>Name:</strong> ${c.name}</p>
        <p><strong>Phone:</strong> ${c.phone}</p>
        <p><strong>Email:</strong> ${c.email}</p>`;
            document.getElementById('view-modal').style.display = 'flex';
            document.getElementById('view-edit-btn').onclick = () => { closeViewModal(); openEditModal(id); };
            document.getElementById('view-delete-btn').onclick = () => { closeViewModal(); openDeleteModal(id); };
        }

        function closeViewModal() { document.getElementById('view-modal').style.display = 'none'; }

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

        function closeEditModal() { document.getElementById('edit-modal').style.display = 'none'; }

        function saveEdit() {
            const name = document.getElementById('edit-name').value.trim();
            const phone = document.getElementById('edit-phone').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const image = document.getElementById('edit-preview').src;
            if (!name || !phone || !email) return alert("Please fill all fields.");

            const i = contacts.findIndex(c => c.id === currentEditId);
            if (i !== -1) {
                contacts[i] = { ...contacts[i], name, phone, email, image };
                localStorage.setItem('contacts', JSON.stringify(contacts));
                closeEditModal();
                displayContacts();
            }
        }

        function openDeleteModal(id) {
            deleteTargetId = id;
            document.getElementById('delete-modal').style.display = 'flex';
        }

        function closeDeleteModal() { document.getElementById('delete-modal').style.display = 'none'; }

        function confirmDelete() {
            contacts = contacts.filter(c => c.id !== deleteTargetId);
            localStorage.setItem('contacts', JSON.stringify(contacts));
            closeDeleteModal();
            displayContacts();
        }

        function searchContacts() {
            const q = document.getElementById('search').value.toLowerCase();
            const filtered = contacts.filter(c => c.name.toLowerCase().includes(q));
            currentPage = 1;
            displayContacts(filtered, true);
        }

        window.addEventListener('click', (e) => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (e.target === modal) modal.style.display = 'none';
            });
        });