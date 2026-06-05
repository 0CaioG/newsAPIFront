import { useState, useEffect } from "react"
import {
    buscarNoticias, buscarFontes, buscarDestaques,
    listarFavoritos, adicionarFavorito, removerFavorito,
    listarMonitoramento, adicionarMonitoramento, removerMonitoramento, buscarFeedMonitoramento,
} from "../Services/api"
import { Search, Star, Clock, User, TrendingUp, Bell } from "lucide-react"

const MENU_ITEMS = [
    { id: "destaques",      label: "Destaques",      icon: <TrendingUp size={18} /> },
    { id: "busca",          label: "Busca",          icon: <Search size={18} /> },
    { id: "favoritos",      label: "Favoritos",      icon: <Star size={18} /> },
    { id: "monitoramento",  label: "Monitoramento",  icon: <Bell size={18} /> },
    { id: "historico",      label: "Histórico",      icon: <Clock size={18} /> },
    { id: "perfil",         label: "Perfil",         icon: <User size={18} /> },
]

const CATEGORIAS = [
    { id: "general",       label: "Geral" },
    { id: "technology",    label: "Tecnologia" },
    { id: "business",      label: "Negócios" },
    { id: "sports",        label: "Esportes" },
    { id: "entertainment", label: "Entretenimento" },
    { id: "health",        label: "Saúde" },
    { id: "science",       label: "Ciência" },
]

function Sidebar({ aba, setAba, usuario, onLogout }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-tag">Portal de notícias</span>
                <h2 className="sidebar-title">InfoNews</h2>
            </div>

            <nav className="sidebar-nav">
                {MENU_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${aba === item.id ? "active" : ""}`}
                        onClick={() => setAba(item.id)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <span className="sidebar-email">{usuario.email}</span>
                <button className="logout-btn" onClick={onLogout}>Sair</button>
            </div>
        </aside>
    )
}

function DestaquesTab({ usuario }) {
    const [categoria, setCategoria] = useState("general")
    const [noticias, setNoticias] = useState([])
    const [feed, setFeed] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")

    const carregarDestaques = async (cat) => {
        setLoading(true)
        setErro("")
        try {
            const data = await buscarDestaques("br", cat)
            setNoticias(data.articles || [])
        } catch (err) {
            setErro(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDestaques(categoria)
        buscarFeedMonitoramento(usuario.id)
            .then(data => setFeed(data))
            .catch(() => {})
    }, [])

    const trocarCategoria = (cat) => {
        setCategoria(cat)
        carregarDestaques(cat)
    }

    return (
        <>
            <section className="search-section">
                <h2 className="section-title">Notícias em alta</h2>
                <div className="category-tabs">
                    {CATEGORIAS.map(c => (
                        <button
                            key={c.id}
                            className={`category-btn ${categoria === c.id ? "active" : ""}`}
                            onClick={() => trocarCategoria(c.id)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="results-section">
                {erro && <p className="erro-msg">{erro}</p>}
                {loading && <p className="hint">Carregando destaques...</p>}
                {!loading && noticias.length === 0 && !erro && (
                    <p className="hint">Nenhum destaque encontrado.</p>
                )}
                <div className="cards-grid">
                    {noticias.map((article, i) => (
                        <a key={i} href={article.url} target="_blank"
                           rel="noopener noreferrer" className="news-card">
                            <div className="card-source">{article.source?.name}</div>
                            <h2 className="card-title">{article.title}</h2>
                            <p className="card-desc">{article.description}</p>
                            <span className="card-date">
                                {article.publishedAt
                                    ? new Date(article.publishedAt).toLocaleDateString("pt-BR")
                                    : ""}
                            </span>
                        </a>
                    ))}
                </div>

                {feed.length > 0 && (
                    <div className="monitor-feed">
                        <h2 className="section-title" style={{ marginTop: "40px" }}>Meu monitoramento</h2>
                        {feed.map(item => (
                            <div key={item.monitoramentoId} className="feed-section">
                                <h3 className="feed-section-title">
                                    <Bell size={14} />
                                    {item.nome}
                                    <span className="feed-tipo">{item.tipo === "TEMA" ? "Tema" : "Fonte"}</span>
                                </h3>
                                {item.artigos.length === 0 ? (
                                    <p className="hint" style={{ margin: "8px 0" }}>Nenhuma notícia encontrada.</p>
                                ) : (
                                    <div className="cards-grid">
                                        {item.artigos.slice(0, 3).map((article, i) => (
                                            <a key={i} href={article.url} target="_blank"
                                               rel="noopener noreferrer" className="news-card">
                                                <div className="card-source">{article.source?.name}</div>
                                                <h2 className="card-title">{article.title}</h2>
                                                <p className="card-desc">{article.description}</p>
                                                <span className="card-date">
                                                    {article.publishedAt
                                                        ? new Date(article.publishedAt).toLocaleDateString("pt-BR")
                                                        : ""}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    )
}

function BuscaTab({ usuario }) {
    const [query, setQuery] = useState("")
    const [idioma, setIdioma] = useState("pt")
    const [fonteSelecionada, setFonteSelecionada] = useState("")
    const [fontes, setFontes] = useState([])
    const [noticias, setNoticias] = useState([])
    const [favoritosMap, setFavoritosMap] = useState({})
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")
    const [buscado, setBuscado] = useState(false)

    useEffect(() => {
        buscarFontes().then(data => setFontes(data.sources || [])).catch(() => {})
        listarFavoritos(usuario.id).then(data => {
            const map = {}
            data.forEach(f => { map[f.url] = f.id })
            setFavoritosMap(map)
        }).catch(() => {})
    }, [])

    const realizarBusca = async (termoDeBusca, idiomaEscolhido, fonteId) => {
        if (!termoDeBusca.trim()) return
        setErro("")
        setLoading(true)
        setBuscado(true)
        try {
            const data = await buscarNoticias(termoDeBusca, idiomaEscolhido, fonteId, usuario.id)
            setNoticias(data.articles || [])
        } catch (err) {
            setErro(err.message)
        } finally {
            setLoading(false)
        }
    }

    const buscarForm = (e) => {
        e.preventDefault()
        realizarBusca(query, idioma, fonteSelecionada)
    }

    const trocarIdioma = (e) => {
        const novoIdioma = e.target.value
        setIdioma(novoIdioma)
        if (query.trim()) realizarBusca(query, novoIdioma, fonteSelecionada)
    }

    const trocarFonte = (e) => {
        const novaFonte = e.target.value
        setFonteSelecionada(novaFonte)
        if (query.trim()) realizarBusca(query, idioma, novaFonte)
    }

    const toggleFavorito = async (e, artigo) => {
        e.preventDefault()
        e.stopPropagation()
        const url = artigo.url
        if (favoritosMap[url]) {
            await removerFavorito(favoritosMap[url], usuario.id)
            const novo = { ...favoritosMap }
            delete novo[url]
            setFavoritosMap(novo)
        } else {
            const salvo = await adicionarFavorito(artigo, usuario.id)
            setFavoritosMap({ ...favoritosMap, [url]: salvo.id })
        }
    }

    return (
        <>
            <section className="search-section">
                <form className="search-form" onSubmit={buscarForm}>
                    <input
                        type="text"
                        placeholder="Busque por assunto, ex: tecnologia, política..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input"
                    />
                    <div className="search-filters">
                        <select value={idioma} onChange={trocarIdioma} className="filter-select">
                            <option value="pt">Português</option>
                            <option value="en">Inglês</option>
                            <option value="es">Espanhol</option>
                            <option value="fr">Francês</option>
                            <option value="de">Alemão</option>
                            <option value="it">Italiano</option>
                            <option value="nl">Holandês</option>
                            <option value="ru">Russo</option>
                            <option value="zh">Chinês</option>
                            <option value="ar">Árabe</option>
                        </select>

                        <select value={fonteSelecionada} onChange={trocarFonte} className="filter-select">
                            <option value="">Todas as fontes</option>
                            {fontes.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>

                        <button type="submit" className="search-btn" disabled={loading}>
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="results-section">
                {erro && <p className="erro-msg">{erro}</p>}
                {!buscado && !loading && (
                    <p className="hint">Digite um assunto acima para buscar notícias.</p>
                )}
                {buscado && !loading && noticias.length === 0 && !erro && (
                    <p className="hint">Nenhuma notícia encontrada para "{query}".</p>
                )}
                <div className="cards-grid">
                    {noticias.map((article, i) => (
                        <a key={i} href={article.url} target="_blank"
                           rel="noopener noreferrer" className="news-card">
                            <div className="card-header">
                                <div className="card-source">{article.source?.name}</div>
                                <button
                                    className={`card-fav-btn ${favoritosMap[article.url] ? "fav-active" : ""}`}
                                    onClick={(e) => toggleFavorito(e, article)}
                                    title={favoritosMap[article.url] ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                >
                                    <Star size={15} fill={favoritosMap[article.url] ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <h2 className="card-title">{article.title}</h2>
                            <p className="card-desc">{article.description}</p>
                            <span className="card-date">
                                {article.publishedAt
                                    ? new Date(article.publishedAt).toLocaleDateString("pt-BR")
                                    : ""}
                            </span>
                        </a>
                    ))}
                </div>
            </section>
        </>
    )
}

function FavoritosTab({ usuario }) {
    const [favoritos, setFavoritos] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState("")

    useEffect(() => {
        listarFavoritos(usuario.id)
            .then(data => setFavoritos(data))
            .catch(err => setErro(err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleRemover = async (id) => {
        try {
            await removerFavorito(id, usuario.id)
            setFavoritos(favoritos.filter(f => f.id !== id))
        } catch (err) {
            setErro(err.message)
        }
    }

    if (loading) return <p className="hint">Carregando favoritos...</p>

    return (
        <section className="results-section" style={{ paddingTop: "32px" }}>
            <h2 className="section-title">Seus Favoritos</h2>
            {erro && <p className="erro-msg">{erro}</p>}
            {favoritos.length === 0 && (
                <p className="hint">Nenhuma notícia favoritada ainda. Salve notícias na aba Busca!</p>
            )}
            <div className="cards-grid">
                {favoritos.map(f => (
                    <div key={f.id} className="news-card">
                        <div className="card-header">
                            <div className="card-source">{f.fonteNome}</div>
                            <button
                                className="card-fav-btn fav-active"
                                onClick={() => handleRemover(f.id)}
                                title="Remover dos favoritos"
                            >
                                <Star size={15} fill="currentColor" />
                            </button>
                        </div>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="card-title-link">
                            <h2 className="card-title">{f.titulo}</h2>
                        </a>
                        <p className="card-desc">{f.descricao}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

function MonitoramentoTab({ usuario }) {
    const [itens, setItens] = useState([])
    const [tipo, setTipo] = useState("TEMA")
    const [nome, setNome] = useState("")
    const [valor, setValor] = useState("")
    const [fontes, setFontes] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState("")

    useEffect(() => {
        listarMonitoramento(usuario.id)
            .then(data => setItens(data))
            .catch(err => setErro(err.message))
            .finally(() => setLoading(false))
        buscarFontes().then(data => setFontes(data.sources || [])).catch(() => {})
    }, [])

    const handleAdicionar = async (e) => {
        e.preventDefault()
        if (!nome.trim() || !valor.trim()) return
        try {
            const novo = await adicionarMonitoramento({ nome, valor, tipo }, usuario.id)
            setItens([...itens, novo])
            setNome("")
            setValor("")
        } catch (err) {
            setErro(err.message)
        }
    }

    const handleRemover = async (id) => {
        try {
            await removerMonitoramento(id, usuario.id)
            setItens(itens.filter(i => i.id !== id))
        } catch (err) {
            setErro(err.message)
        }
    }

    const handleTipoChange = (e) => {
        setTipo(e.target.value)
        setValor("")
    }

    return (
        <section className="results-section" style={{ paddingTop: "32px" }}>
            <h2 className="section-title">Monitoramento</h2>
            <p className="monitor-desc">
                Adicione temas ou fontes para monitorar. As notícias aparecem na aba Destaques.
            </p>

            {erro && <p className="erro-msg">{erro}</p>}

            <form className="monitor-form" onSubmit={handleAdicionar}>
                <select value={tipo} onChange={handleTipoChange} className="filter-select">
                    <option value="TEMA">Tema</option>
                    <option value="FONTE">Fonte</option>
                </select>

                <input
                    type="text"
                    placeholder="Nome de exibição (ex: Tecnologia)"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="search-input"
                />

                {tipo === "TEMA" ? (
                    <input
                        type="text"
                        placeholder="Termo de busca (ex: inteligência artificial)"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className="search-input"
                    />
                ) : (
                    <select
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className="filter-select"
                        style={{ flex: 1 }}
                    >
                        <option value="">Selecione uma fonte</option>
                        {fontes.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                )}

                <button type="submit" className="search-btn">Adicionar</button>
            </form>

            {loading && <p className="hint">Carregando...</p>}

            <div className="monitor-list">
                {itens.length === 0 && !loading && (
                    <p className="hint">Nenhum item monitorado. Adicione um tema ou fonte acima.</p>
                )}
                {itens.map(item => (
                    <div key={item.id} className="monitor-item">
                        <div className="monitor-item-info">
                            <span className="monitor-item-nome">{item.nome}</span>
                            <span className="monitor-item-valor">{item.valor}</span>
                            <span className={`monitor-item-tipo ${item.tipo.toLowerCase()}`}>
                                {item.tipo === "TEMA" ? "Tema" : "Fonte"}
                            </span>
                        </div>
                        <button
                            className="monitor-remove-btn"
                            onClick={() => handleRemover(item.id)}
                            title="Remover monitoramento"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </section>
    )
}

function HistoricoTab() {
    return (
        <div className="tab-placeholder">
            <span className="tab-icon">🕒</span>
            <h3>Histórico</h3>
            <p>Suas buscas recentes aparecerão aqui.</p>
        </div>
    )
}

function PerfilTab({ usuario }) {
    return (
        <div className="tab-placeholder">
            <span className="tab-icon">👤</span>
            <h3>Perfil</h3>
            <p className="perfil-email">{usuario.email}</p>
            <p>Configurações de perfil em breve.</p>
        </div>
    )
}

export default function NewsPage({ usuario, onLogout }) {
    const [aba, setAba] = useState("destaques")

    return (
        <div className="app-layout">
            <Sidebar aba={aba} setAba={setAba} usuario={usuario} onLogout={onLogout} />

            <main className="main-content">
                {aba === "destaques"     && <DestaquesTab usuario={usuario} />}
                {aba === "busca"         && <BuscaTab usuario={usuario} />}
                {aba === "favoritos"     && <FavoritosTab usuario={usuario} />}
                {aba === "monitoramento" && <MonitoramentoTab usuario={usuario} />}
                {aba === "historico"     && <HistoricoTab />}
                {aba === "perfil"        && <PerfilTab usuario={usuario} />}
            </main>
        </div>
    )
}
