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

function renderSongCard(song,index) {
        const artist = song.groups?.name || song.artists?.name || "Artiste inconnu";
        const year = song.year ? `<span class="pill">${escapeHtml(song.year)}</span>` : "";
        const theme = song.theme ? `<span class="pill">${escapeHtml(song.theme)}</span>` : "";
        const keywords = song.keywords ? `<span class="pill">${escapeHtml(song.keywords)}</span>` : "";
        const link = song.link || song.lien;
        const album = song[whatisit(song)]?.name ? `<span class="pill">${escapeHtml(song[whatisit(song)]?.name)}</span>` : "";
        const category = song.categories?.name ? `<span class="pill">${escapeHtml(song.categories?.name)}</span>` : "";

        return `
          <article class="song" data-index="${index}">
            <div>
              <h2 class="titre">${escapeHtml(song.title || "Sans titre")}</h2>
              <p class="artist">${escapeHtml(artist)}</p>
            </div>
            <div class="details">${album}${year}</div>
          </article>
        `;
}

const eq_col = {
  "singles": "single",
  "EP": "ep",
  "albums": "album",
}

const sup_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaHhlZ2JqZWN2Zm5tZHRvZHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTUzNzgsImV4cCI6MjA5OTA3MTM3OH0.Wwr1x3mj_e8fSiSi4NT8CYP1w0wGYbbms1040kFmGRo"
const sup_url = "https://wihxegbjecvfnmdtodvq.supabase.co/rest/v1/"