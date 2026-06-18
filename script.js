const cardContainer = document.getElementById("card-container");
const searchInput = document.getElementById("search-bar");
const roleFilter = document.getElementById("role-filter");

let champions = [];

async function fetchChampions() {
    try {
        // HTTP request - Patch 13.24.1 data
        const resopnse = await fetch("https://ddragon.leagueoflegends.com/cdn/13.24.1/data/en_US/champion.json");
        //response converted in json to be read by js
        const data = await Response.json();
        //Riot delivers champs as a dictionary, we convert it in array
        const riotArray = Object.values(data.data);

        //translation of Riot data into the HTML card format we estabilished before
        champions = riotArray.map(champ => {
            return {
                name: champ.name,
                cost: champ.info.difficulty,
                type: "Champion - " + champ.tags[0],
                effect: champ.blurb.substring(0, 90) + "...", //lore as card effect
                atk: champ.info.attack * 10, //multiply by 10 to have big stats
                def: champ.info.defense * 10,
                imageUrl: 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg',
                laneIcon = "TopLane.png", //for test purposes
            };
        });

        console.log("Data downloaded from Riot servers: ", champions);
        //show the first 20 champs to not overload the screen
        generateCards(champions.slice(0, 20));

    } catch (error) {
        console.errore("Riot Server impossibile to reach: ", error);
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

    generateCards(filteredChamp);
}

//event listener
if (searchInput && roleFilter) {
    searchInput.addEventListener("keyup", applyFilters);
    roleFilter.addEventListener("change", applyFilters);
}

fetchChampions(); //request starts
