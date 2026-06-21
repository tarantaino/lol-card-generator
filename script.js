// --- 1. VARIABILI GLOBALI ---
const cardContainer = document.getElementById("card-container");
const searchInput = document.getElementById("search-bar");
const roleFilter = document.getElementById("role-filter");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const paginationControls = document.getElementById("pag-ctrls");
const pageSelector = document.getElementById("page-selector");
const modal = document.getElementById("champion-modal");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close-btn");

let champions = [];
let currentFilteredChamps = [];
let currentPage = 1;
const itemsPerPage = 20;
//security function
function secHTML(str) {
    if (!str) return "";
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// modal

async function openModal(champName) {

    if (!champName) return;

    const champBase = champions.find(c => c.name === champName || secHTML(c.name) === champName);

    if (!champBase) {
        console.error(`[DEBUG] Errore: campione ${champName} non trovato nell'array.`);
        return;
    }

    // loading
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
            <h2 style="color: #ffcc00;">Summoning...</h2>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    try {
        const patch = window.currentPatch || "14.4.1";

        //api call to get the entire lore
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${champBase.id}.json`);

        if (!response.ok) {
            throw new Error(`Net error: ${response.status}`);
        }

        const fullData = await response.json();
        const champFull = fullData.data[champBase.id];


        // print lore
        modalBody.innerHTML = `
            <h2 style="color: #ffcc00; text-align: center; font-size: 28px; margin-bottom: 5px;">
                ${secHTML(champFull.name)}
                <span style="font-size: 16px; color: #aaa; display: block; margin-top: 5px;">${secHTML(champFull.title.toUpperCase())}</span>
            </h2>
            <img src="${champBase.imageUrl}" style="width: 100%; border-radius: 5px; border: 2px solid var(--card-border); margin-top: 15px;">
            <p style="margin-top: 20px; font-size: 16px; line-height: 1.6; text-align: justify; padding-right: 15px;">${secHTML(champFull.lore)}</p>
            <div class="card-stats" style="justify-content: center; margin-top: 20px; font-size: 20px;">
                <span class="stat-atk" style="margin-right: 20px;">ATK: ${champBase.atk}</span> 
                <span class="stat-def">DEF: ${champBase.def}</span>
            </div>
        `;
    } catch (error) {
        console.error("API error:", error);
        modalBody.innerHTML = `<h2 style="color: red; text-align: center;">Errore nel caricamento della storia. Controlla la console.</h2>`;
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // unlock scroll
    }
}

if (closeBtn) closeBtn.onclick = closeModal;
window.onclick = (e) => {
    if (modal && e.target == modal) closeModal();
};


function generateCards(championsArray) {
    if (!cardContainer) return;

    let htmlContent = "";

    championsArray.forEach(champ => {
        const nameSafe = secHTML(champ.name);
        htmlContent += `
            <div class="card" data-name="${nameSafe}" style="cursor: pointer;">
                <div class="card-header">
                    <h2 class="card-title">${nameSafe}</h2>
                    <div class="card-cost">${champ.cost}</div>
                </div>
                <div class="card-image-placeholder">
                    <img src="${champ.imageUrl}" alt="${nameSafe}" class="card-artwork">
                </div>
                <div class="card-body">
                    <div class="card-type">${secHTML(champ.type)}</div>
                    <div class="card-effect">${secHTML(champ.effect)}</div>
                </div>
                <div class="card-stats">
                    <span class="stat-atk">ATK: ${champ.atk}</span>
                    <span class="stat-def">DEF: ${champ.def}</span>
                </div>
            </div>
        `;
    });

    cardContainer.innerHTML = htmlContent;
}


if (cardContainer) {
    cardContainer.addEventListener("click", (event) => {

        const clickedCard = event.target.closest(".card");
        if (clickedCard) {
            const targetChamp = clickedCard.getAttribute("data-name");
            openModal(targetChamp);
        }
    });
}

//pagination
function displayCurrentPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    generateCards(currentFilteredChamps.slice(startIndex, endIndex));

    const totalPages = Math.ceil(currentFilteredChamps.length / itemsPerPage) || 1;

    if (paginationControls) paginationControls.style.display = totalPages <= 1 ? "none" : "flex";
    if (prevBtn) prevBtn.style.visibility = currentPage === 1 ? "hidden" : "visible";
    if (nextBtn) nextBtn.style.visibility = currentPage === totalPages ? "hidden" : "visible";

    if (pageSelector) {
        pageSelector.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const isSelected = i === currentPage ? "selected" : "";
            pageSelector.innerHTML += `<option value="${i}" ${isSelected}>Page ${i} of ${totalPages}</option>`;
        }
    }
}

function applyFilters() {
    if (!searchInput || !roleFilter) return;

    const searchText = secHTML(searchInput.value.toLowerCase());
    const selectedRole = roleFilter.value.toLowerCase();

    currentFilteredChamps = champions.filter(champ => {
        const matchesName = champ.name.toLowerCase().includes(searchText);
        const matchesRole = selectedRole === "all" || champ.type.toLowerCase().includes(selectedRole);
        return matchesName && matchesRole;
    });

    currentPage = 1;
    displayCurrentPage();
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayCurrentPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(currentFilteredChamps.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayCurrentPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

if (pageSelector) {
    pageSelector.addEventListener("change", (event) => {
        currentPage = parseInt(event.target.value);
        displayCurrentPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (roleFilter) roleFilter.addEventListener("change", applyFilters);


async function fetchChampions() {
    try {
        const versionResponse = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const versions = await versionResponse.json();
        const latestPatch = versions[0];

        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestPatch}/data/en_US/champion.json`);
        const data = await response.json();
        const riotArray = Object.values(data.data);

        champions = riotArray.map(champ => ({
            id: champ.id,
            name: champ.name,
            cost: champ.info.difficulty === 0 ? 1 : champ.info.difficulty,
            type: "Champion - " + champ.tags[0],
            effect: champ.blurb,
            atk: champ.info.attack === 0 ? 50 : champ.info.attack * 10,
            def: champ.info.defense === 0 ? 50 : champ.info.defense * 10,
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`,
        }));

        const allRoles = new Set(riotArray.map(c => c.tags[0]));
        allRoles.forEach(role => {
            roleFilter.innerHTML += `<option value="${role.toLowerCase()}">${role}</option>`;
        });

        currentFilteredChamps = [...champions];
        displayCurrentPage();
    } catch (error) {
        console.error("Errore API Riot:", error);
        if (cardContainer) cardContainer.innerHTML = "<h2 style='color: white;'>API connection error.</h2>";
    }
}

fetchChampions();