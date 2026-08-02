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
    if (song.albums) return "albums";
    if (song.singles) return "singles";
    if (song.EP) return "EP";
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
        const artist = song.groups?.name || song.artists?.name || "Artiste inconnu";
        const year = song.year ? `<span class="pill">${escapeHtml(song.year)}</span>` : "";
        const theme = song.theme ? `<span class="pill">${escapeHtml(song.theme)}</span>` : "";
        const keywords = song.keywords ? `<span class="pill">${escapeHtml(song.keywords)}</span>` : "";
        const link = song.link || song.lien;
        const album = song[whatisit(song)]?.name ? `<span class="pill">${escapeHtml(song[whatisit(song)]?.name)}</span>` : "";
        const category = song.categories?.name ? `<span class="pill">${escapeHtml(song.categories?.name)}</span>` : "";

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
    modals.artist.dataset.id = song.groups?.id || song.artists?.id || ""; 
    modals.description.textContent = song.description || "";
    modals.details.innerHTML = [
      {type: "theme", value : song.theme}, {value: song.categories?.name, type: "category", origin: song.theme}
    ].filter(item => item.value).map(v => `<span class="pill" data-origin=${v?.origin} data-type=${v.type}>${escapeHtml(v.value)}</span>`).join("");
    modals.details2.innerHTML = [
      {type: whatisit(song),value: song[whatisit(song)]?.name, id:song[whatisit(song)]?.id}, {type: "year", value: song.year}
    ].filter(item => item.value).map(v => `<span class="pill" data-type=${v.type} data-id=${v.id || ""}>${escapeHtml(v.value)}</span>`).join(""); 

    const cover = modals.cover;
    cover.style.backgroundImage = song[whatisit(song)]?.pochette ? `url(${song[whatisit(song)]?.pochette})` : "url(logo2.png)";
    cover.href = song[whatisit(song)]?.link || "";

    document.getElementById("overlay").classList.add("open");
  }

function closeModal() {
  document.getElementById("overlay").classList.remove("open");
}

function refreshSession(file,newValue){
  sessionStorage.removeItem("songs");
  sessionStorage.setItem("songs",JSON.stringify(newValue));
}

async function getArtistGroup(song){
    const groupId = song.groups.id;

    const {data, error} = await client
    .from("artist_group")
    .select("artist_id,group_member_id,artists(id,name),member_group:groups!artist_group_group_member_id_fkey(id,name)")
    .eq("group_id",groupId);
    console.table(data);
  
    if (error) throw error;

    return data.map(row => {
        if (row.artist_id !== null) {
            return {
                type: "artist",
                id: row.artists.id,
                name: row.artists.name
            };
        }

        return {
            type: "group",
            id: row.member_group.id,
            name: row.member_group.name
        };
    });
  }

async function getHTMLartist(song){
  if (!song.groups?.name?.includes("ft.")){

      const type = song.groups ? "group" : "artist";
      const obj = song.groups ?? song.artists;

      return `
          <span class="artist-link"
                data-id="${obj.id}"
                data-type="${type}">
              ${escapeHtml(obj.name)}
          </span>
      `;

  }else{
    
    const participants = await getArtistGroup(song);
    
    return participants.map((p, i) => `
      <span class="artist-link"
            data-id="${p.id}"
            data-type="${p.type}">
          ${escapeHtml(p.name)}
      </span>${i < participants.length - 1 ? " ft. " : ""}
  `).join("");

  }
}

const eq_col = {
  "singles": "single",
  "EP": "ep",
  "albums": "album",
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

menuToggle.addEventListener("click", toggleMenu);
menuOverlay.addEventListener("click", toggleMenu);