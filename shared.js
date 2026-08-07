const normalize = (value) => String(value || "").toLocaleLowerCase("fr").trim();

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    }[char]));
}

function capitalize(str) {
    return str
        ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
        : "";
}

function titleCase(str) {
    return str
        .split(" ")
        .map(capitalize)
        .join(" ");
}

function whatisit(song){
    if (song.album) return "album";
    if (song.single) return "single";
    if (song.ep) return "ep";
  }

async function toggleLike(song, iconElement) {
    const client = supabase.createClient(client_url,sup_key);
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      alert("Connecte-toi pour liker une chanson.");
      return;
    }

    if (song.liked) {
      await client
        .from("liked")
        .delete()
        .eq("user_id", user.id)
        .eq("song_id", song.id);
      song.liked = false;
      iconElement.src = "star_record_empty.png";
    } else {
      await client
        .from("liked")
        .insert({ user_id: user.id, song_id: song.id });
      song.liked = true;
      iconElement.src = "star_record_filled.png";
    }
  }

function renderSongCard(song,index) {
        const liked = song?.liked ? "<img src='star_record_filled.png' class='like-button'>" : "<img src='star_record_empty.png' class='like-button'>"; 
        const artist = getGroup(song)?.name || getArtist(song)?.name || "Artiste inconnu";
        const year = song.year ? `<span class="pill">${escapeHtml(song.year)}</span>` : "";
        const theme = song.theme ? `<span class="pill">${escapeHtml(song.theme)}</span>` : "";
        const keywords = song.keywords ? `<span class="pill">${escapeHtml(song.keywords)}</span>` : "";
        const link = song.link || song.lien;
        const album = getWhatever(song)?.name ? `<span class="pill">${escapeHtml(getWhatever(song)?.name)}</span>` : "";
        const category = getCategory(song)?.name ? `<span class="pill">${escapeHtml(getCategory(song)?.name)}</span>` : "";

        return `
          <article class="song" data-index="${index}" data-id="${song.id}">
            ${liked}
            <div class="song-header">
              <h2 class="titre">${escapeHtml(song.title || "Sans titre")}</h2>
              <p class="artist">${escapeHtml(artist)}</p>
            </div>
            <div class="details">${album}${year}</div>
          </article>
        `;
}

async function openModal(song) {
    modals.title.textContent = song.title || "Sans titre";
    modals.title.href = song.link || "#";
    modals.title.target = "_blank";
    modals.artist.innerHTML = await getHTMLartist(song);
    modals.artist.dataset.id = getGroup(song)?.id || getArtist(song)?.id || ""; 
    modals.description.textContent = song.description || "";
    modals.details.innerHTML = [
      {type: "theme", value : song.theme}, {value: getCategory(song)?.name, type: "category", origin: song.theme}
    ].filter(item => item.value).map(v => `<span class="pill" data-origin=${v?.origin} data-type=${v.type}>${escapeHtml(v.value)}</span>`).join("");
    modals.details2.innerHTML = [
      {type: whatisit(song),value: getWhatever(song)?.name, id:getWhatever(song)?.id}, {type: "year", value: song.year}
    ].filter(item => item.value).map(v => `<span class="pill" data-type=${v.type} data-id=${v.id || ""}>${escapeHtml(v.value)}</span>`).join(""); 

    const cover = modals.cover;
    cover.style.backgroundImage = getWhatever(song)?.pochette ? `url(${getWhatever(song)?.pochette})` : "url(logo2.png)";
    cover.href = getWhatever(song)?.link || "";

    document.getElementById("overlay").classList.add("open");
  }

function closeModal() {
  document.getElementById("overlay").classList.remove("open");
}

function refreshSession(file,newValue){
  sessionStorage.removeItem("songs");
  sessionStorage.setItem("songs",JSON.stringify(newValue));
}


function getArtistGroup(groupId) {
    const rows = catalog.artistGroupByGroup[groupId] ?? [];

    return rows.map(row => {
        if (row.artist_id !== null) {
            const artist = catalog.artistById[row.artist_id];

            return {
                type: "artist",
                id: artist.id,
                name: artist.name
            };
        }

        const group = catalog.groupById[row.group_member_id];

        return {
            type: "group",
            id: group.id,
            name: group.name
        };
    });
}

async function getHTMLartist(song){
  if (!getGroup(song)?.name?.includes("ft.")){

      const type = getGroup(song) ? "group" : "artist";
      const obj = getGroup(song) ?? getArtist(song.group);

      return `
          <span class="artist-link"
                data-id="${obj.id}"
                data-type="${type}">
              ${escapeHtml(obj.name)}
          </span>
      `;

  }else{
    
    const participants = await getArtistGroup(song.group);
    
    return participants.map((p, i) => `
      <span class="artist-link"
            data-id="${p.id}"
            data-type="${p.type}">
          ${escapeHtml(p.name)}
      </span>${i < participants.length - 1 ? " ft. " : ""}
  `).join("");

  }
}

function getArtist(song) {
    return catalog.artistById[song.artist];
}

function getGroup(song) {
    return catalog.groupById[song.group];
}

function getWhatever(song){
  const type = whatisit(song);
  return catalog[`${type}ById`][song[whatisit(song)]]
}

function getAlbum(song) {
    return catalog.albumsById[song.album];
}

function getEP(song) {
    return catalog.EPById[song.ep];
}

function getSingle(song) {
    return catalog.singlesById[song.single];
}

function getCategory(song) {
    return catalog.categoryById[song.category];
}


const client_url = "https://wihxegbjecvfnmdtodvq.supabase.co"
const sup_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaHhlZ2JqZWN2Zm5tZHRvZHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTUzNzgsImV4cCI6MjA5OTA3MTM3OH0.Wwr1x3mj_e8fSiSi4NT8CYP1w0wGYbbms1040kFmGRo"
const sup_url = "https://wihxegbjecvfnmdtodvq.supabase.co/rest/v1/"

const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");

function toggleMenu() {
  menuToggle.classList.toggle("open");
  sideMenu.classList.toggle("open");
  menuOverlay.classList.toggle("open");
}

menuToggle?.addEventListener("click", toggleMenu);
menuOverlay?.addEventListener("click", toggleMenu);