const API = "http://localhost:8080"

export async function login(email, senha) {
    const res = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha, confirmacaoSenha: senha }),
    })
    if (!res.ok) throw new Error("E-mail ou senha incorretos")
    return res.json()
}

export async function cadastrar(email, senha, confirmacaoSenha) {
    const res = await fetch(`${API}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha, confirmacaoSenha }),
    })
    if (!res.ok) throw new Error("Erro ao cadastrar. Verifique os dados.")
    return res.json()
}

export async function buscarNoticias(query, language, fonte, usuarioId) {
    let url = `${API}/news/buscar?q=${encodeURIComponent(query)}&language=${language}`
    if (fonte) url += `&fontes=${encodeURIComponent(fonte)}`
    const res = await fetch(url, { headers: { usuarioId } })
    if (!res.ok) throw new Error("Erro ao buscar notícias")
    return res.json()
}

export async function buscarFontes(language) {
    const params = language ? `?language=${language}` : ""
    const res = await fetch(`${API}/sources${params}`)
    if (!res.ok) throw new Error("Erro ao buscar fontes")
    return res.json()
}

export async function buscarDestaques(country, category) {
    let url = `${API}/news/destaques?country=${country}`
    if (category) url += `&category=${category}`
    const res = await fetch(url)
    if (!res.ok) throw new Error("Erro ao buscar destaques")
    return res.json()
}

export async function listarFavoritos(usuarioId) {
    const res = await fetch(`${API}/favoritos`, { headers: { usuarioId } })
    if (!res.ok) throw new Error("Erro ao buscar favoritos")
    return res.json()
}

export async function adicionarFavorito(artigo, usuarioId) {
    const res = await fetch(`${API}/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", usuarioId },
        body: JSON.stringify({
            titulo: artigo.title,
            descricao: artigo.description,
            url: artigo.url,
            fonteNome: artigo.source?.name,
        }),
    })
    if (!res.ok) throw new Error("Erro ao adicionar favorito")
    return res.json()
}

export async function removerFavorito(id, usuarioId) {
    const res = await fetch(`${API}/favoritos/${id}`, {
        method: "DELETE",
        headers: { usuarioId },
    })
    if (!res.ok) throw new Error("Erro ao remover favorito")
}
