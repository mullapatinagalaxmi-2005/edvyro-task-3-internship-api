const API_URL = "/api/internships";

let internships = [];
let currentPage = 1;
let totalPages = 1;
const limit = 6;
let editingId = null;

// ============================================================
// DOM ELEMENTS
// ============================================================

const internshipList = document.getElementById("internshipList");

const searchInput = document.getElementById("search");
const domainFilter = document.getElementById("domainFilter");
const modeFilter = document.getElementById("modeFilter");

const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const message = document.getElementById("message");

const totalInternships =
    document.getElementById("totalInternships");

const totalDomains =
    document.getElementById("totalDomains");

const totalOpenings =
    document.getElementById("totalOpenings");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const addBtn = document.getElementById("addBtn");

const internshipForm =
    document.getElementById("internshipForm");

const internshipId =
    document.getElementById("internshipId");

const codeInput =
    document.getElementById("code");

const titleInput =
    document.getElementById("title");

const domainInput =
    document.getElementById("domain");

const modeInput =
    document.getElementById("mode");

const locationInput =
    document.getElementById("location");

const skillsInput =
    document.getElementById("skills");

const openingsInput =
    document.getElementById("openings");

// ============================================================
// INITIAL LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadInternships();

    searchInput?.addEventListener(
        "input",
        handleFilterChange
    );

    domainFilter?.addEventListener(
        "change",
        handleFilterChange
    );

    modeFilter?.addEventListener(
        "change",
        handleFilterChange
    );

    prevBtn?.addEventListener(
        "click",
        () => {

            if (currentPage > 1) {
                currentPage--;
                loadInternships();
            }

        }
    );

    nextBtn?.addEventListener(
        "click",
        () => {

            if (currentPage < totalPages) {
                currentPage++;
                loadInternships();
            }

        }
    );

    addBtn?.addEventListener(
        "click",
        openAddModal
    );

    closeModal?.addEventListener(
        "click",
        closeFormModal
    );

    cancelBtn?.addEventListener(
        "click",
        closeFormModal
    );

    internshipForm?.addEventListener(
        "submit",
        handleFormSubmit
    );

    modal?.addEventListener(
        "click",
        (event) => {

            if (event.target === modal) {
                closeFormModal();
            }

        }
    );

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                modal &&
                !modal.classList.contains("hidden")
            ) {
                closeFormModal();
            }

        }
    );
});

// ============================================================
// LOAD DATA
// ============================================================

async function loadInternships() {

    showLoading();

    try {

        const response = await fetch(
            `${API_URL}?page=${currentPage}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(
                `Server error: ${response.status}`
            );
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.error?.message ||
                "Unable to load internships."
            );
        }

        internships =
            Array.isArray(result.data)
                ? result.data
                : [];

        totalPages =
            result.pagination?.totalPages || 1;

        window.__internshipPaginationTotal =
            result.pagination?.total ||
            internships.length;

        populateDomainFilter();

        const filtered =
            filterInternships(internships);

        renderInternships(filtered);

        updatePagination(
            result.pagination
        );

        updateStatistics(
            result.pagination
        );

    } catch (error) {

        console.error(error);

        showErrorState();

        showMessage(
            error.message ||
            "Failed to load internships.",
            "error"
        );
    }
}

// ============================================================
// FILTER
// ============================================================

function filterInternships(data) {

    const search =
        searchInput?.value
            .trim()
            .toLowerCase() || "";

    const selectedDomain =
        domainFilter?.value || "";

    const selectedMode =
        modeFilter?.value || "";

    return data.filter((internship) => {

        const title =
            String(internship.title || "")
                .toLowerCase();

        const code =
            String(internship.code || "")
                .toLowerCase();

        const domain =
            String(internship.domain || "")
                .toLowerCase();

        const location =
            String(internship.location || "")
                .toLowerCase();

        const skills =
            Array.isArray(internship.skills)
                ? internship.skills
                    .join(" ")
                    .toLowerCase()
                : "";

        const matchesSearch =
            search === "" ||
            title.includes(search) ||
            code.includes(search) ||
            domain.includes(search) ||
            location.includes(search) ||
            skills.includes(search);

        const matchesDomain =
            selectedDomain === "" ||
            selectedDomain === "all" ||
            internship.domain === selectedDomain;

        const matchesMode =
            selectedMode === "" ||
            selectedMode === "all" ||
            internship.mode === selectedMode;

        return (
            matchesSearch &&
            matchesDomain &&
            matchesMode
        );
    });
}

function handleFilterChange() {

    const filtered =
        filterInternships(internships);

    renderInternships(filtered);
}

// ============================================================
// RENDER INTERNSHIPS
// ============================================================

function renderInternships(data) {

    if (!internshipList) return;

    if (!data.length) {
        showEmptyState();
        return;
    }

    internshipList.innerHTML =
        data
            .map(createInternshipCard)
            .join("");

    document
        .querySelectorAll(".edit-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {
                    openEditModal(
                        button.dataset.id
                    );
                }
            );

        });

    document
        .querySelectorAll(".delete-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {
                    deleteInternship(
                        button.dataset.id
                    );
                }
            );

        });
}

// ============================================================
// CARD
// ============================================================

function createInternshipCard(internship) {

    const skills =
        Array.isArray(internship.skills)
            ? internship.skills
            : [];

    /*
     * IMPORTANT:
     * Each skill gets its own span.
     */

    const skillsHTML = skills
        .map((skill) => {

            return `
                <span class="skill">
                    ${escapeHTML(skill)}
                </span>
            `;

        })
        .join("");

    const modeClass =
        getModeClass(internship.mode);

    return `
        <article class="card">

            <div class="card-top">

                <div class="card-icon">
                    ${getDomainIcon(
                        internship.domain
                    )}
                </div>

                <div class="card-heading">

                    <span class="card-code">
                        ${escapeHTML(
                            internship.code
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            internship.title
                        )}
                    </h3>

                </div>

            </div>


            <div class="card-details">

                <div class="detail-item">

                    <span class="detail-icon">
                        ◈
                    </span>

                    <span>
                        ${escapeHTML(
                            internship.domain
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-icon">
                        ⌖
                    </span>

                    <span>
                        ${escapeHTML(
                            internship.location
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-icon">
                        ♙
                    </span>

                    <span>
                        ${internship.openings}
                        opening${
                            internship.openings === 1
                                ? ""
                                : "s"
                        }
                    </span>

                </div>

            </div>


            <div class="card-mode">

                <span class="badge ${modeClass}">
                    ${escapeHTML(
                        internship.mode
                    )}
                </span>

            </div>


            <div class="skills">

                ${skillsHTML}

            </div>


            <div class="card-actions">

                <button
                    type="button"
                    class="btn edit-btn"
                    data-id="${internship.id}"
                >
                    ✎ Edit
                </button>

                <button
                    type="button"
                    class="btn delete-btn"
                    data-id="${internship.id}"
                >
                    ♲ Delete
                </button>

            </div>

        </article>
    `;
}

// ============================================================
// ICONS
// ============================================================

function getDomainIcon(domain) {

    const value =
        String(domain || "")
            .toLowerCase();

    if (value.includes("web")) {
        return "⌘";
    }

    if (value.includes("backend")) {
        return "⚙";
    }

    if (value.includes("design")) {
        return "✦";
    }

    if (value.includes("data")) {
        return "◫";
    }

    if (
        value.includes("security") ||
        value.includes("cyber")
    ) {
        return "◉";
    }

    if (value.includes("cloud")) {
        return "☁";
    }

    return "◆";
}

function getModeClass(mode) {

    if (mode === "Remote") {
        return "remote";
    }

    if (mode === "Hybrid") {
        return "hybrid";
    }

    if (mode === "On-site") {
        return "onsite";
    }

    return "";
}

// ============================================================
// DOMAIN FILTER
// ============================================================

function populateDomainFilter() {

    if (!domainFilter) return;

    const previousValue =
        domainFilter.value;

    const domains = [
        ...new Set(
            internships
                .map(
                    (item) =>
                        item.domain
                )
                .filter(Boolean)
        )
    ].sort();

    domainFilter.innerHTML = `
        <option value="">
            All Domains
        </option>

        ${domains
            .map(
                (domain) => `
                    <option
                        value="${escapeHTML(
                            domain
                        )}"
                    >
                        ${escapeHTML(
                            domain
                        )}
                    </option>
                `
            )
            .join("")}
    `;

    if (
        domains.includes(
            previousValue
        )
    ) {

        domainFilter.value =
            previousValue;

    } else {

        domainFilter.value = "";
    }
}

// ============================================================
// STATISTICS
// ============================================================

function updateStatistics(pagination) {

    const total =
        pagination?.total ||
        window.__internshipPaginationTotal ||
        internships.length;

    if (totalInternships) {
        totalInternships.textContent =
            total;
    }

    const domains =
        new Set(
            internships
                .map(
                    (item) =>
                        item.domain
                )
                .filter(Boolean)
        );

    const openings =
        internships.reduce(
            (sum, item) => {

                const value =
                    Number(
                        item.openings
                    );

                return (
                    sum +
                    (
                        Number.isFinite(value)
                            ? value
                            : 0
                    )
                );

            },
            0
        );

    if (totalDomains) {
        totalDomains.textContent =
            domains.size;
    }

    if (totalOpenings) {
        totalOpenings.textContent =
            openings;
    }
}

// ============================================================
// PAGINATION
// ============================================================

function updatePagination(pagination) {

    if (!pagination) return;

    currentPage =
        pagination.page ||
        currentPage;

    totalPages =
        pagination.totalPages ||
        1;

    if (pageInfo) {

        pageInfo.textContent =
            `Page ${currentPage} of ${totalPages}`;
    }

    if (prevBtn) {
        prevBtn.disabled =
            currentPage <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled =
            currentPage >= totalPages;
    }
}

// ============================================================
// ADD
// ============================================================

function openAddModal() {

    editingId = null;

    if (modalTitle) {
        modalTitle.textContent =
            "Add Internship";
    }

    internshipForm?.reset();

    if (internshipId) {
        internshipId.value = "";
    }

    openFormModal();
}

// ============================================================
// EDIT
// ============================================================

async function openEditModal(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.error?.message ||
                "Unable to load internship."
            );
        }

        const internship =
            result.data;

        editingId =
            internship.id;

        modalTitle.textContent =
            "Edit Internship";

        internshipId.value =
            internship.id;

        codeInput.value =
            internship.code || "";

        titleInput.value =
            internship.title || "";

        domainInput.value =
            internship.domain || "";

        modeInput.value =
            internship.mode || "";

        locationInput.value =
            internship.location || "";

        skillsInput.value =
            Array.isArray(
                internship.skills
            )
                ? internship.skills.join(", ")
                : "";

        openingsInput.value =
            internship.openings || 1;

        openFormModal();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Unable to load internship.",
            "error"
        );
    }
}

// ============================================================
// MODAL
// ============================================================

function openFormModal() {

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(() => {

        codeInput?.focus();

    }, 100);
}

function closeFormModal() {

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );

    editingId = null;
}

// ============================================================
// FORM SUBMIT
// ============================================================

async function handleFormSubmit(event) {

    event.preventDefault();

    const skills =
        skillsInput.value
            .split(",")
            .map(
                (skill) =>
                    skill.trim()
            )
            .filter(Boolean);

    const data = {

        code:
            codeInput.value.trim(),

        title:
            titleInput.value.trim(),

        domain:
            domainInput.value.trim(),

        mode:
            modeInput.value,

        location:
            locationInput.value.trim(),

        skills,

        openings:
            Number(
                openingsInput.value
            )
    };

    const errors =
        validateFormData(data);

    if (errors.length) {

        showMessage(
            errors.join(" "),
            "error"
        );

        return;
    }

    const isEditing =
        editingId !== null;

    const url =
        isEditing
            ? `${API_URL}/${editingId}`
            : API_URL;

    const method =
        isEditing
            ? "PUT"
            : "POST";

    try {

        setFormLoading(true);

        const response =
            await fetch(
                url,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.error?.message ||
                "Unable to save internship."
            );
        }

        closeFormModal();

        showMessage(
            isEditing
                ? "Internship updated successfully."
                : "Internship created successfully.",
            "success"
        );

        await loadInternships();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Failed to save internship.",
            "error"
        );

    } finally {

        setFormLoading(false);
    }
}

// ============================================================
// VALIDATION
// ============================================================

function validateFormData(data) {

    const errors = [];

    if (
        !data.code ||
        data.code.length < 2
    ) {
        errors.push(
            "Enter a valid internship code."
        );
    }

    if (
        !data.title ||
        data.title.length < 2
    ) {
        errors.push(
            "Title must contain at least 2 characters."
        );
    }

    if (!data.domain) {
        errors.push(
            "Domain is required."
        );
    }

    if (
        ![
            "Remote",
            "Hybrid",
            "On-site"
        ].includes(data.mode)
    ) {
        errors.push(
            "Select a valid work mode."
        );
    }

    if (!data.location) {
        errors.push(
            "Location is required."
        );
    }

    if (
        !data.skills.length
    ) {
        errors.push(
            "Enter at least one skill."
        );
    }

    if (
        !Number.isInteger(
            data.openings
        ) ||
        data.openings <= 0
    ) {
        errors.push(
            "Openings must be a positive number."
        );
    }

    return errors;
}

// ============================================================
// DELETE
// ============================================================

async function deleteInternship(id) {

    const internship =
        internships.find(
            (item) =>
                String(item.id) ===
                String(id)
        );

    const title =
        internship?.title ||
        "this internship";

    const confirmed =
        confirm(
            `Are you sure you want to delete "${title}"?`
        );

    if (!confirmed) return;

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.error?.message ||
                "Unable to delete internship."
            );
        }

        showMessage(
            "Internship deleted successfully.",
            "success"
        );

        if (
            internships.length === 1 &&
            currentPage > 1
        ) {
            currentPage--;
        }

        await loadInternships();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Failed to delete internship.",
            "error"
        );
    }
}

// ============================================================
// LOADING
// ============================================================

function showLoading() {

    if (!internshipList) return;

    internshipList.innerHTML = `
        <div class="empty">

            <div class="loader"></div>

            <h3>
                Loading internships...
            </h3>

            <p>
                Please wait while we fetch
                the latest opportunities.
            </p>

        </div>
    `;
}

// ============================================================
// FORM LOADING
// ============================================================

function setFormLoading(isLoading) {

    const submitButton =
        internshipForm?.querySelector(
            'button[type="submit"]'
        );

    if (!submitButton) return;

    if (isLoading) {

        submitButton.disabled = true;

        submitButton.dataset.originalText =
            submitButton.textContent;

        submitButton.textContent =
            "Saving...";

    } else {

        submitButton.disabled = false;

        submitButton.textContent =
            submitButton.dataset.originalText ||
            "Save Internship";
    }
}

// ============================================================
// EMPTY STATE
// ============================================================

function showEmptyState() {

    if (!internshipList) return;

    internshipList.innerHTML = `
        <div class="empty">

            <div class="empty-icon">
                ⌕
            </div>

            <h3>
                No internships found
            </h3>

            <p>
                Try changing your search or filters,
                or add a new internship opportunity.
            </p>

            <button
                type="button"
                class="btn primary-btn"
                id="emptyAddBtn"
            >
                + Add Internship
            </button>

        </div>
    `;

    document
        .getElementById("emptyAddBtn")
        ?.addEventListener(
            "click",
            openAddModal
        );
}

// ============================================================
// ERROR STATE
// ============================================================

function showErrorState() {

    if (!internshipList) return;

    internshipList.innerHTML = `
        <div class="empty">

            <div class="empty-icon">
                !
            </div>

            <h3>
                Unable to load internships
            </h3>

            <p>
                Please make sure the backend
                server is running.
            </p>

            <button
                type="button"
                class="btn primary-btn"
                id="retryBtn"
            >
                Try Again
            </button>

        </div>
    `;

    document
        .getElementById("retryBtn")
        ?.addEventListener(
            "click",
            loadInternships
        );
}

// ============================================================
// MESSAGE
// ============================================================

let messageTimer;

function showMessage(
    text,
    type = "success"
) {

    if (!message) return;

    clearTimeout(messageTimer);

    message.textContent =
        text;

    message.classList.remove(
        "hidden",
        "success",
        "error"
    );

    message.classList.add(
        type
    );

    messageTimer =
        setTimeout(
            () => {

                message.classList.add(
                    "hidden"
                );

            },
            4000
        );
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
