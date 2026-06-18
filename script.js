const cardContainer = document.getElementById("card-container");
const searchInput = document.getElementById("search-bar");
const roleFilter = document.getElementById("role-filter");

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

let champions = [];
let currentFilteredChamps = [];
let currentPage = 1;
const itemsPerPage = 20;

async function fetchChampions() {
    try {

        const versionResponse = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const versions = await versionResponse.json(); //we ask Riot the patch lists available

        const latestPatch = versions[0];
        console.log("Current patch detected: ", latestPatch);

        //dyanmic URL injecting the correct patch
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestPatch}/data/en_US/champion.json`);
        //response converted in json to be read by js
        const data = await response.json();
        //Riot delivers champs as a dictionary, we convert it in array
        const riotArray = Object.values(data.data);

        //translation of Riot data into the HTML card format we estabilished before
        champions = riotArray.map(champ => {
            return {
                name: champ.name,
                cost: champ.info.difficulty === 0 ? 1 : champ.info.difficulty,
                type: "Champion - " + champ.tags[0],
                effect: champ.blurb.substring(0, 90) + "...", //lore as card effect
                atk: champ.info.attack * 10, //multiply by 10 to have big stats
                def: champ.info.defense * 10,
                imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`,
                laneIcon: "TopLane.png", //for test purposes  
            };
        });

        console.log("Data downloaded from Riot servers: ", champions);
        //show the first 20 champs to not overload the screen

        const allRoles = new Set();

        // role extraction for filtering
        riotArray.forEach(champ => {
            allRoles.add(champ.tags[0]);
        });

        allRoles.forEach(role => {
            const optionHTML = `<option value="${role.toLowerCase()}">${role}</option>`;
            roleFilter.innerHTML += optionHTML; // injeceted into the dropdown menu
        });

        //filtered array with champs initialized 
        currentFilteredChamps = [...champions];
        displayCurrentPage(); //launch pagination for 1st time

    } catch (error) {
        console.error("Riot Server impossibile to reach: ", error);
        cardContainer.innerHTML = "<h2 style='color: white;'>API connection error. Check console.</h2>";
    }

}

// generate cards function

function generateCards(championsArray) {
    cardContainer.innerHTML = "";

    championsArray.forEach(champ => {
        const cardHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${champ.name}</h2>
                    <div class="card-cost">${champ.cost}</div>
                </div>
                
                <div class="card-image-placeholder">
                    <img src="${champ.imageUrl}" alt="${champ.name}" class="card-artwork">
                </div>
                
                <div class="card-body">
                    <div class="card-type">${champ.type}</div>
                    <div class="card-effect">${champ.effect}</div>
                </div>
                
                <div class="card-stats">
                    <span>ATK: ${champ.atk}</span>
                    <img src="${champ.laneIcon}" alt="Lane Icon" class="lane-icon">
                    <span>DEF: ${champ.def}</span>
                </div>
            </div>
        `;
        cardContainer.innerHTML += cardHTML;
    });
}




function displayCurrentPage() {

    //where to cut the array
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const championsToShow = currentFilteredChamps.slice(startIndex, endIndex);
    //show cards
    generateCards(championsToShow);

    //return pages total and update the text
    const totalPages = Math.ceil(currentFilteredChamps.lenght / itemsPerPage) || 1;
    pageInfo.innerText = `Page ${currentPage} of ${totalPage}`;

    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
    prevBtn.style.cursor = prevBtn.disabled ? "not-allowed" : "pointer";
    nextBtn.style.cursor = nextBtn.disabled ? "not-allowed" : "pointer";
}

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayCurrentPage();
        window.scrollTo({ top: 0, behavior: 'smooth' }); //back to top
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(currentFilteredChamps.lenght / itemsPerPage);
    if (currentPage < totalPage) {
        currentPage++;
        displayCurrentPage();
        window.scrollTo({ top: 0, behavior: 'smooth' }); //back to top 
    }
});



// filters
function applyFilters() {
    if (!searchInput || !roleFilter) return;

    const searchText = searchInput.value.toLowerCase();
    const selectedRole = roleFilter.value.toLowerCase();

    const filteredChamp = champions.filter(champ => {
        const matchesName = champ.name.toLowerCase().includes(searchText);
        const matchesRole = selectedRole === "all" || champ.type.toLowerCase().includes(selectedRole);
        return matchesName && matchesRole;
    });


    currentPage = 1;
    generateCards(filteredChamp);
}

//event listener
if (searchInput && roleFilter) {
    searchInput.addEventListener("keyup", applyFilters);
    roleFilter.addEventListener("change", applyFilters);
}



fetchChampions(); //request starts
