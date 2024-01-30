// https://api.opensea.io/api/v2/collection/{collection name}/nfts?limit=5
const getNFTsByCollectionURL = "https://api.opensea.io/api/v2/collection/"
const NFTsLimit = 5;

// https://api.opensea.io/api/v2/chain/{chain}/contract/{address}/nfts/{identifier}
const getNFTByContractURL = "https://api.opensea.io/api/v2/chain/";

// https://api.opensea.io/api/v2/listings/collection/{collection_slug}/nfts/{identifier}/best
const getPriceOfNFTURL = "https://api.opensea.io/api/v2/listings/collection/"

// Elements
const nftCollectionRankingEl = document.getElementById("nft");
const walletEl = document.getElementById("wallet");

// Global variables
var nftCollectionsRankingByVolume = [];
var nft = {
  identifier : "",
  collection : "",
  contract : "",
  token_standard : "",
  name : "",
  dayPurchased : "",
  price : {
    "currency": "",
    "decimals": 0,
    "value": "",
  },
  image_url : "",
};
var currentNFTPrice = {
  "currency": "",
  "decimals": 0,
  "value": "",
};


// Object: wallet keep track of NFTs and Coins which are the list of NFTs and coins in the wallet save to localstorage
var wallet = {
  coins : [],
  NFTs : [],

//  // element of NFTs
//   NFT = {
//     identifier : "",
//     collection : "",
//     contract : "",
//     token_standard : "",
//     name : "",
//     dayPurchased : "",
//     purchasedPrice : {
//        "currency": "",
//        "decimals": 0,
//        "value": "",
//      },
//     image_url : "",
//   }

  // _checkDuplicate: check if the NFT has been existed in the NFTs, return index of found duplicate or -1 if not found.
  _checkNFTDuplicate : function(address, id) {
    if (this.NFTs.length > 0) {
      for (let index = 0; index < this.NFTs.length; index++) {
        const element = this.NFTs[index];
        if (element.contract === address && element.identifier === id) {
          return index;
        }
      };
    };
    return -1;
  },
  
  // saveNFT gets NFT and save NFT to NFTs in localStorage after transform to string.
  // return false/true if it failed/success to save to localStorage
  saveNFT : function(nft) {
    // console.log(nft);
    // console.log(this.NFTs);
    // check if the NFT has been existed. If yes, return true.
    var index = this._checkNFTDuplicate(nft.contract, nft.identifier);
    if (index >= 0) {
      return true;
    } else {
        this.NFTs.push(nft);
    };
    // this.NFTs.push(nft);
    // console.log(this.NFTs);
    try {
      localStorage.setItem('NFTs', JSON.stringify(this.NFTs));
      return true;
    } catch(e) {
      return false;
    };      
  },
    
  // loadNFTs returns array of objects from NFTs in localStorage.
  loadNFTs : function() {
      if (localStorage.getItem("NFTs") != null) {
          //  get string from NFTs in localStorage and transform back to array of objects.
          this.NFTs = JSON.parse(localStorage.getItem("NFTs"));           
      };
      return this.NFTs;
  },
    
  // clearAll clears the array NFTs and NFTs in localStorage
  clearAllNFTs : function() {
      if (this.NFTs.length != 0) {
          this.NFTs.length = 0;
      };
      localStorage.removeItem("NFTs");
  },
};


// getNFTsByCollection request API https://api.opensea.io/api/v2/collections/{collection_slug}
// 
function getNFTsByCollection(collection, limit) {
    const options = {method: 'GET', headers: {accept: 'application/json', 'x-api-key': '0c9e93e867e640e081971469d0447097'}};
    var url = getNFTsByCollectionURL + collection + "/nfts?limit=" + limit;

    fetch(url, options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));    
};

// getNFTsByContract request API https://api.opensea.io/api/v2/chain/{chain}/contract/{address}/nfts/{identifier}
function getNFTByContract(chain, address, identifier) {
    const options = {method: 'GET', headers: {accept: 'application/json', 'x-api-key': '0c9e93e867e640e081971469d0447097'}};
    var url = getNFTByContractURL + chain + "/contract/" + address + "/nfts/" + identifier;

    fetch(url, options)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // return data to global variable nft
      console.log(data);
      nft.identifier = data.nft.identifier;
      nft.collection = data.nft.collection;
      nft.contract = data.nft.contract;
      nft.token_standard = data.nft.token_standard;
      nft.name = data.nft.name;
      //nft.dayPurchased = new Date()
    })
    .catch(err => console.error(err));
}

// 
function getPriceOfNFT(collection, identifier) {
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-api-key': '0c9e93e867e640e081971469d0447097'}};
  var url = getPriceOfNFTURL + collection + "/nfts/" + identifier + "/best";

  fetch(url, options)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    // return price data to global variable currentNFTPrice
    currentNFTPrice = data.price.current;
  })
  .catch(err => console.error(err));
}

//
function renderPrice(el, collection, id) {
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-api-key': '0c9e93e867e640e081971469d0447097'}};
  var url = getPriceOfNFTURL + collection + "/nfts/" + id + "/best";

  fetch(url, options)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // console.log(data);
    // console.log(el);
    // return price data to global variable currentNFTPrice
    if (typeof data.price != "undefined") {
      el.textContent = data.price.current.value/Math.pow(10, data.price.current.decimals) + " " + data.price.current.currency;      
    } else {
      el.textContent = "";
    }
    
  })
  .catch(err => console.error(err));
  
}

// render top 3 collections ranking by volume in 1 day
function renderTop3CollectionRankingByVolumeIn1Day() {
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-api-key': 'nRneSF8mGcK2LHkhbPKszsvz'}};
  var url = 'https://restapi.nftscan.com/api/v2/statistics/ranking/collection?sort_field=volume_1d&sort_direction=desc&limit=3';

  fetch(url, options)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data.data);
    for (let index = 0; index < data.data.length; index++) {
      const element = data.data[index];
      var i = index + 1;
      var str = "nft-" + i;
      var collectionEl = document.getElementById(str);
      collectionEl.innerHTML = "";
      
      // set contract address to get NFTs later
      collectionEl.setAttribute("data-contract", element.contract_address);

      // display banner logo
      var section1El = document.createElement('section');
      var imgEl = document.createElement('img');
      section1El.classList = 'container flex bg-cyan-100';
      imgEl.src = element.banner_url;
      section1El.appendChild(imgEl);
      collectionEl.appendChild(section1El);

      // display name of collection
      var section2El = document.createElement('section');
      var h32El = document.createElement('h3');
      section2El.classList = 'container flex bg-red-100';
      h32El.textContent = element.contract_name;
      section2El.appendChild(h32El);
      collectionEl.appendChild(section2El);
      // console.log(element);
      // var collection = {
      //   contract_address : element.contract_address,
      //   contract_name : element.contract_name,
      //   logo_url : element.logo_url,
      //   items_total : element.items_total,
      //   volume_1d : element.volume_1d,
      //   volume_change_1d : element.volume_change_1d,
      //   market_cap : element.market_cap,
      // };

      // nftCollectionsRankingByVolume.push(collection);
    };
  });
};

// render NFT collection
function renderNFTPage() {
  //render top 3 collections ranking by volume in 1 day
  renderTop3CollectionRankingByVolumeIn1Day();
  //render 10NFTs for each collection
}
// renderNFTwallet render the list of NFT from the object wallet.
function renderNFTwallet() {
  // get NFT wallet El
  var nftWalletEl = walletEl.lastElementChild.lastElementChild;
  // console.log(walletEl);
  // console.log(nftWalletEl);

  // reset HTML Element
  nftWalletEl.innerHTML = "";


  if (wallet.NFTs.length === 0) {
    return;
  };

  var nfts = wallet.loadNFTs();
  // console.log(nfts);
  for (let index = 0; index < nfts.length; index++) {
    const element = nfts[index];
    var nftEl = document.createElement('section');
    //nftWalletEl.appendChild(nftEl);
    // console.log(nftEl);
    nftEl.classList = 'container flex';
    nftEl.setAttribute("data-contract", element.contract);
    nftEl.setAttribute("data-identifier", element.identifier);
    nftEl.setAttribute("data-token_standard", element.token_standard);
    nftWalletEl.appendChild(nftEl);

    //
    var section1El = document.createElement('section');
    var h31El = document.createElement('h3');
    section1El.classList = 'container flex bg-cyan-100';
    h31El.textContent = element.name + " #" + element.identifier;
    section1El.appendChild(h31El);
    nftEl.appendChild(section1El);

    //
    var section2El = document.createElement('section');
    var h32El = document.createElement('h3');
    section2El.classList = 'container flex bg-red-100';
    h32El.textContent = element.collection;
    section2El.appendChild(h32El);
    nftEl.appendChild(section2El);

    //
    var section3El = document.createElement('section');
    var h33El = document.createElement('h3');
    section3El.classList = 'container flex bg-yellow-100';

    renderPrice(h33El, element.collection, element.identifier);
    section3El.appendChild(h33El);
    nftEl.appendChild(section3El);

    //
    var section4El = document.createElement('section');
    var imgEl = document.createElement('img');
    section4El.classList = 'container flex bg-green-100';
    imgEl.src = element.image_url;
    section4El.appendChild(imgEl);
    nftEl.appendChild(section4El);
  };


}

