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
