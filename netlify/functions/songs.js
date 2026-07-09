const DEFAULT_SELECT = "id,title,year,artist_id,artists(id,name),albums(id,album),theme,link,created_at";

exports.handler = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return json({ error: "Configuration Supabase manquante. Ajoutez SUPABASE_URL et SUPABASE_ANON_KEY aux variables d'environnement Netlify." }, 500);
  }

  const endpoint = new URL("/rest/v1/songs", supabaseUrl);
  endpoint.searchParams.set("select", DEFAULT_SELECT);
  endpoint.searchParams.set("order", "title.asc");

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    if (!response.ok) {
      return json({ error: data.message || "Supabase a refusé la requête." }, response.status);
    }

    return json({ songs: data });
  } catch (error) {
    return json({ error: error.message || "Erreur de chargement des chansons." }, 500);
  }
};

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
    body: JSON.stringify(body),
  };
}
