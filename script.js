const champions = [
    {
        name: "Deathlord Morderkaiser",
        cost: 5,
        type: "Champion - Bruiser",
        effect: "<strong> Death Realm: </strong> Exile target in another dimension for 7 secs stealing 10% of his base stats",
        atk: 35,
        def: 40,
        imageUrl: "https://cdnb.artstation.com/p/assets/images/images/018/710/363/large/alex-flores-mordekaiser2019-alexflores.jpg?1560412968",
        laneIcon: "TopLane.png"
    },

    {
        name: "Darius, Hand of Noxus",
        cost: 5,
        type: "Champion - Duelist",
        effect: "<strong> Noxian Guillotine: </strong> Leaps to target champion and strikes a lethal blow.",
        atk: 45,
        def: 30,
        imageUrl: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c6/Skin_Splash_Classic_Darius.jpg/revision/latest/scale-to-width-down/1000?cb=20191210032348",
        laneIcon: "TopLane.png"
    }
];

const cardContainer = document.getElementById("card-container");

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
                                ${champ.effect}
                            </div>
                            
                            <div class="card-stats">
                                <span>ATK: ${champ.atk}</span>
                                <img src="${champ.laneIcon}" alt="Lane Icon" class="lane-icon">
                                <span>DEF: ${champ.def}</span>
                            </div>
                        </div>
                    `;
        cardContainer.innerHTML += cardHTML;
    })
}


generateCards(champions);
console.log("DB succesfully loaded!", champions);

const searchInput = document.getElementById("search-bar");

searchInput.addEventListener("keyup", (event) => {

    const searchText = event.target.value.toLowerCase();

    const filteredChamp = champions.filter(champ => {
        return champ.name.toLocaleLowerCase().includes(searchText);
    })

    generateCards(filteredChamp);
});

