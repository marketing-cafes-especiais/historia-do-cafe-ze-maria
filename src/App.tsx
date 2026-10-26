import { useEffect, useState, type ReactNode } from "react"
import zeMariaCafeEspecialLogo from "./assets/logo-ze-maria-cafe-especial.png"
import heroFoto8 from "./assets/hero-bg-8.jpg"
import heroFoto11 from "./assets/hero-bg-11.jpg"
import colhedorCafe from "./assets/ficha-colhedor.jpg"

// Monta o caminho de uma imagem da pasta public/ respeitando o subdiretório
// de publicação (necessário no GitHub Pages, ex: /claudinhocode/).
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`

// Adicione mais imagens aqui para o fundo da abertura alternar automaticamente.
const heroImages = [
  heroFoto8,
  heroFoto11,
]

// Cole aqui o link de incorporação do YouTube quando o vídeo estiver pronto,
// ex: "https://www.youtube.com/embed/SEU_ID_AQUI". Deixe vazio para manter a prévia.
const historyVideoEmbedUrl = ""

const sections = [
  ["historia", "História"],
  ["inicio", "Abertura"],
  ["ficha", "Ficha rápida"],
  ["producao", "Produção"],
  ["xicara", "Na xícara"],
  ["preparo", "Como preparar"],
  ["contato", "Contato"],
] as const

const Icon = ({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode
  className?: string
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
)

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark">
        <img src={zeMariaCafeEspecialLogo} alt="" />
      </div>
      <div className={compact ? "hidden sm:block" : ""}>
        <p className="text-sm font-bold leading-none tracking-wide">Zé Maria</p>
        <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] opacity-60">
          Cafés Especiais
        </p>
      </div>
    </div>
  )
}

function SectionNav({
  previous,
  next,
  nextLabel,
}: {
  previous?: string
  next?: string
  nextLabel?: string
}) {
  return (
    <div className="section-nav">
      {previous ? (
        <a href={`#${previous}`} className="quiet-link">
          <Icon className="h-4 w-4">
            <path d="m15 18-6-6 6-6" />
          </Icon>
          Voltar
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a href={`#${next}`} className="next-link">
          {nextLabel ?? "Continuar"}
          <Icon className="h-4 w-4">
            <path d="m9 18 6-6-6-6" />
          </Icon>
        </a>
      )}
    </div>
  )
}

function SectionTitle({
  number,
  eyebrow,
  title,
  titleClassName,
  children,
}: {
  number: string
  eyebrow: string
  title: ReactNode
  titleClassName?: string
  children?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div className="section-number">{number}</div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={titleClassName}>{title}</h2>
        {children && <p className="section-intro">{children}</p>}
      </div>
    </div>
  )
}

function App() {
  const [dark, setDark] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    if (heroImages.length < 2) return
    const id = window.setInterval(
      () => setHeroIndex((i) => (i + 1) % heroImages.length),
      6000,
    )
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem("ze-maria-theme")
    setDark(
      stored
        ? stored === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    )
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light"
    window.localStorage.setItem("ze-maria-theme", dark ? "dark" : "light")
  }, [dark])

  return (
    <main>
      <header className="topbar">
        <div className="topbar-inner">
          <a href="#inicio" aria-label="Zé Maria Cafés Especiais — início">
            <Brand compact />
          </a>
          <nav aria-label="Navegação principal" className="desktop-nav">
            {sections.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="theme-button"
            aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
            onClick={() => setDark((value) => !value)}
          >
            {dark ? (
              <Icon>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
              </Icon>
            ) : (
              <Icon>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </Icon>
            )}
          </button>
        </div>
        <nav
          aria-label="Atalhos das seções"
          className="mobile-nav touch-pan-x snap-x snap-proximity scroll-smooth [&>a]:snap-start"
        >
          {sections.map(([id, label], index) => (
            <a key={id} href={`#${id}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section id="inicio" className="hero page-section">
        <div className="hero-slides" aria-hidden="true">
          {heroImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={i === heroIndex ? "is-active" : ""}
            />
          ))}
        </div>
        <div className="hero-text">
          <div className="inline-flex items-center gap-2">
            <span className="copper-line" />
            <p className="eyebrow">Montanhas Capixabas</p>
          </div>
          <h1>
            Da nossa terra
            <span className="!font-medium">para a sua xícara.</span>
          </h1>
          <p className="hero-copy">
            Você acaba de receber o café&nbsp;&nbsp;Zé Maria na embalagem da Boden Club. Agora, chegue mais perto:
            conheça o caminho do café, da lavoura ao seu jeito de preparar.
          </p>
          <div className="hero-actions">
            <a href="#video-historia" className="preparation-button">
              Conheça a história Zé Maria
              <Icon className="h-4 w-4">
                <path d="m9 18 6-6-6-6" />
              </Icon>
            </a>
            <a href="#preparo" className="preparation-button compact">
              Como preparar
              <Icon className="h-4 w-4">
                <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
                <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M3 22h15" />
                <path d="M8 5c0-1 1-1.5 1-2.5M12 5c0-1 1-1.5 1-2.5" />
              </Icon>
            </a>
          </div>
        </div>

        <div
          className="hero-art [&_.sun]:z-10 [&_.sun]:bg-transparent [&_.sun]:shadow-2xl [&_.sun_img]:opacity-100"
          aria-label="Cafezal nas montanhas com o selo Melhor Café 2020"
        >
          <img
            src={publicAsset("cafe-montanhas.jpg")}
            alt="Cafezal carregado de frutos nas montanhas"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="sun overflow-hidden p-0">
            <img
              src={publicAsset("selo-melhor-cafe-2025.png")}
              alt="Coffee of the Year Brasil — Melhor Café 2025"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="historia" className="page-section story-section">
        <div className="contained story-grid !bg-[var(--forest)]">
          <div
            id="video-historia"
            className="story-visual [&::before]:hidden [&::after]:hidden"
          >
            {historyVideoEmbedUrl ? (
              <div className="story-video-embed">
                <iframe
                  src={historyVideoEmbedUrl}
                  title="A história do Café Zé Maria"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="story-video-preview"
                role="img"
                aria-label="Prévia do vídeo sobre a história do Café Zé Maria"
              >
                <img
                  src={publicAsset("cafe-montanhas.jpg")}
                  alt=""
                  className="story-video-image"
                />
                <div className="story-video-shade" />
                <div className="story-video-content">
                  <span className="story-video-label">Vídeo da história</span>
                  <span className="story-video-play" aria-hidden="true">
                    <Icon className="h-5 w-5">
                      <path d="m9 7 8 5-8 5Z" />
                    </Icon>
                  </span>
                  <strong>A história por trás de cada xícara.</strong>
                  <span className="story-video-status">Prévia • vídeo em breve</span>
                </div>
              </div>
            )}
            <p className="story-video-caption">
              “Em memória do meu querido pai, José Maria Ovani!”
              <br />- Cleberson Ovani
            </p>
          </div>
          <div>
            <SectionTitle
              number="01"
              eyebrow="Nossa história"
              titleClassName="py-[7px] px-0"
              title={
                <>
                  <span>O que torna o nosso café tão especial</span>                </>
              }
            >
              Cafés especiais da família Ovani, cultivados e colhidos à mão nas
              Montanhas Capixabas, em Itaguaçu (ES), desde 1971.
            </SectionTitle>
            <div className="prose">
              <p className="story-chapter">A nossa história</p>
              <p>
                Tudo começou em 1971, nas Montanhas Capixabas. A família Ovani,
                que havia chegado da Itália décadas antes, escolheu essa terra
                para criar raízes.
              </p>
              <p>
                Foi ali que José Maria Ovani e Maria de Lourdes iniciaram uma
                jornada que atravessaria gerações: a busca por um café cada vez
                melhor.
              </p>
              <p>
                Com o tempo, aprenderam a conhecer a terra e a cultivar o café
                por meio da observação, da experiência e da dedicação diária,
                transmitindo esse conhecimento e cuidado de geração em geração.
              </p>
              <blockquote>
                O nome dele ficou em cada pacote. A missão, com o filho,
                Cleberson Ovani.
              </blockquote>
            </div>
          </div>
          <div className="story-details">
            <article>
              <p className="story-chapter">De pai para filho</p>
              <p>
                Zé Maria era um pai dedicado, um trabalhador incansável e um
                apaixonado por café especial. Há muitos anos a família perdeu o
                patriarca, mas Cleberson conduz a fazenda com o mesmo zelo e o
                mesmo compromisso com a excelência, em homenagem ao pai.
              </p>
            </article>
            <article>
              <p className="story-chapter">A fazenda e a montanha</p>
              <p>
                O Café Zé Maria nasce na Fazenda José e Maria, em Itaguaçu, no
                Espírito Santo. As lavouras ficam a mais de mil metros de
                altitude, onde as noites são frias e o fruto amadurece mais
                devagar. Esse tempo extra deixa o grão mais denso e costuma se
                traduzir, na xícara, em mais doçura e clareza de sabor.
              </p>
              <p>
                A colheita é feita à mão, respeitando o ponto exato de maturação
                de cada fruto, e só os mais maduros seguem adiante. É um trabalho
                feito grão a grão, safra após safra.
              </p>
            </article>
            <article>
              <p className="story-chapter">Qualidade comprovada</p>
              <p>
                Depois da colheita, a torra é feita pela torrefação Flor de
                Março, que dá ao café o ponto certo para revelar o que a montanha
                entregou.
              </p>
              <p>
                Cada lote é analisado por profissionais certificados, seguindo
                os padrões da SCA, e os laudos técnicos ficam abertos no nosso
                site. É assim que a qualidade sentida na xícara tem comprovação
                e o café tem origem certa: o Café Zé Maria ficou entre os 50
                melhores cafés do Brasil no Coffee of the Year (COY) 2025.
              </p>
            </article>
            <article className="story-today">
              <p className="story-chapter">Hoje</p>
              <p>
                O que começou com Zé Maria e Maria de Lourdes continua nas mãos
                da família. Cada xícara de Café Zé Maria leva um pedaço dessa
                história: o amor pela terra, a dedicação de quem planta e colhe
                e o orgulho de ser café capixaba.
              </p>
              <strong>Mais que um café. Um legado.</strong>
              <a
                href="https://www.cafezemaria.com/"
                className="story-cta"
                target="_blank"
                rel="noreferrer"
              >
                Conheça nossos cafés
                <Icon className="h-4 w-4">
                  <path d="m9 18 6-6-6-6" />
                </Icon>
              </a>
            </article>
          </div>
          <div className="story-navigation">
            <SectionNav previous="inicio" next="ficha" />
          </div>
        </div>
      </section>

      <section id="ficha" className="page-section contained">
        <SectionTitle
          number="02"
          eyebrow="Em poucas palavras"
          title="Um café com endereço."
        >
          Antes de falar de sabor, vale saber de onde ele vem. Esta é a
          identidade do Café Zé Maria.
        </SectionTitle>

        <figure className="ficha-photo">
          <img src={colhedorCafe} alt="Colhedor peneirando grãos de café no cafezal" />
        </figure>

        <div className="fact-grid">
          <article className="fact-card featured">
            <Icon>
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </Icon>
            <div>
              <p>Origem</p>
              <h3>Itaguaçu, Espírito Santo</h3>
              <span>Montanhas Capixabas, ES, Brasil</span>
            </div>
          </article>
          <article className="fact-card">
            <Icon>
              <path d="m3 20 7-12 4 7 3-5 4 10Z" />
            </Icon>
            <div>
              <p>Território</p>
              <h3>Clima de montanha</h3>
              <span>Dias amenos e maturação cuidadosa</span>
            </div>
          </article>
          <article className="fact-card">
            <Icon>
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 18 2 18 2c0 3.8 2 6.5 2 10a8 8 0 0 1-8 8Z" />
              <path d="M2 21c0-3 1.9-5.4 5.1-6.9C9.9 12.7 13.5 12 18 12" />
            </Icon>
            <div>
              <p>Cuidado</p>
              <h3>Produção em pequena escala</h3>
              <span>Acompanhada de perto, do fruto ao pacote</span>
            </div>
          </article>
          <article className="fact-card">
            <Icon>
              <path d="M18.7 5.3c3.3 3.3 2 8.8-1.4 12.2s-8.9 4.7-12.2 1.4-2-8.8 1.4-12.2 8.9-4.7 12.2-1.4Z" />
              <path d="M6 19c.3-3.8 2.5-5.1 4.7-6.5 2.4-1.5 4.8-3.1 4.7-7.6" />
            </Icon>
            <div>
              <p>Na xícara</p>
              <h3>Doce e equilibrado</h3>
              <span>Gostoso puro e fácil de beber</span>
            </div>
          </article>
        </div>
        <SectionNav previous="historia" next="producao" />
      </section>

      <section id="producao" className="page-section contained">
        <SectionTitle
          number="03"
          eyebrow="Da lavoura ao pacote"
          title="O cuidado aparece em cada etapa."
        >
          Não é preciso entender de café para reconhecer um trabalho
          caprichado. Veja o que acontece antes de o pacote chegar até você.
        </SectionTitle>

        <figure className="production-photo">
          <img
            src="https://images.unsplash.com/photo-1762277142890-24902d58e8f0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1400"
            alt="Mãos colhendo frutos maduros de café"
          />
          <figcaption>Colhido à mão, fruto por fruto.</figcaption>
        </figure>

        <ol className="process-list">
          {[
            ["01", "Cultivo", "O café cresce nas montanhas, acompanhando o ritmo do clima e da lavoura."],
            ["02", "Colheita", "A colheita manual seleciona apenas os frutos maduros. Depois, o café passa por processos controlados de secagem e beneficiamento, preservando suas características naturais."],
            ["03", "Secagem", "Depois de colhidos, os frutos perdem umidade de forma controlada para preservar sua qualidade."],
            ["04", "Seleção", "Os grãos são avaliados e separados para que o lote mantenha um resultado consistente."],
            ["05", "Torra", "Calor e tempo são ajustados para destacar doçura, aroma e equilíbrio — sem gosto de queimado."],
          ].map(([number, title, text]) => (
            <li key={number}>
              <span>{number}</span>
              <div className="process-icon" aria-hidden="true">
                <span />
              </div>
              <div>
                <h3>{title}</h3>
                <p
                  className={
                    title === "Colheita"
                      ? "!mb-8 !text-[14px] font-normal !leading-[23.1px]"
                      : ""
                  }
                >
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <figure className="origin-landscape">
          <img
            src="https://images.unsplash.com/photo-1646753555452-cf31c0f86159?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1600"
            alt="Montanhas e lavouras de café no Brasil"
          />
          <figcaption>
            <span>Itaguaçu, Espírito Santo</span>
            A paisagem também faz parte do sabor.
          </figcaption>
        </figure>
        <SectionNav previous="ficha" next="xicara" />
      </section>

      <section id="xicara" className="page-section cup-section">
        <div className="contained">
          <SectionTitle
            number="04"
            eyebrow="Na xícara"
            title="Sabor bom não precisa de tradução."
          >
            Prove primeiro. Depois, se quiser, use estas pistas para perceber o
            que aparece na sua xícara.
          </SectionTitle>

          <div className="taste-layout">
            <div className="cup-illustration" aria-hidden="true">
              <div className="steam steam-one" />
              <div className="steam steam-two" />
              <div className="cup">
                <div />
              </div>
              <div className="saucer" />
            </div>
            <div className="taste-content">
              <p className="plain-language">
                <strong>Em linguagem simples:</strong> um café agradável,
                naturalmente doce, com acidez delicada e final confortável.
              </p>
              <div className="taste-row">
                {[
                  ["Doçura", "Presente"],
                  ["Acidez", "Delicada"],
                  ["Corpo", "Agradável"],
                ].map(([name, value]) => (
                  <div key={name}>
                    <span>{name}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="pending note-pending">
                <span>Notas do café</span>
                Notas florais, pêssego, mamão e frutas amarelas.
              </div>
              <p className="taste-tip">
                Dica: deixe o café esfriar um pouco e prove novamente. A doçura
                costuma aparecer mais quando a bebida não está tão quente.
              </p>
            </div>
          </div>
          <SectionNav previous="producao" next="preparo" />
        </div>
      </section>

      <section id="preparo" className="page-section contained">
        <SectionTitle
          number="05"
          eyebrow="Como preparar"
          title="Um bom café, sem complicação."
        >
          Esta é uma receita simples para o filtro de papel. Use como ponto de
          partida e ajuste ao seu gosto.
        </SectionTitle>

        <div className="recipe-card">
          <div className="recipe-summary">
            <div>
              <p>Café</p>
              <strong>20 g</strong>
              <span>cerca de 2 colheres</span>
            </div>
            <div>
              <p>Água</p>
              <strong>300 ml</strong>
              <span>filtrada e bem quente</span>
            </div>
            <div>
              <p>Tempo</p>
              <strong>3–4 min</strong>
              <span>sem pressa</span>
            </div>
          </div>
          <ol className="recipe-steps">
            <li>
              <span>1</span>
              <p><strong>Prepare o filtro.</strong> Dobre, encaixe no suporte e passe um pouco de água quente. Descarte essa água.</p>
            </li>
            <li>
              <span>2</span>
              <p><strong>Coloque o café.</strong> Espalhe o pó no filtro e deixe a superfície nivelada.</p>
            </li>
            <li>
              <span>3</span>
              <p><strong>Comece devagar.</strong> Molhe todo o café com pouca água e espere cerca de 30 segundos.</p>
            </li>
            <li>
              <span>4</span>
              <p><strong>Complete o preparo.</strong> Despeje o restante da água aos poucos, em movimentos circulares.</p>
            </li>
          </ol>
        </div>

        <div className="other-methods">
          <div>
            <p className="eyebrow">Outros jeitos de fazer</p>
            <h3>Use o método que já faz parte da sua rotina.</h3>
          </div>
          <div className="method-chips" aria-label="Métodos alternativos">
            {["Prensa francesa", "Aeropress", "Moka", "Chemex", "V60"].map((method) => (
              <span key={method}>{method}</span>
            ))}
          </div>
        </div>
        <SectionNav previous="xicara" next="contato" nextLabel="Falar com a gente" />
      </section>

      <section id="contato" className="page-section contact-section">
        <div className="contained contact-grid">
          <div>
            <p className="eyebrow light">Da montanha, com carinho</p>
            <h2>Agora esta história continua com você.</h2>
            <p>
              Preparou seu Zé Maria? Conte para a gente como ficou, tire suas
              dúvidas ou marque a gente na sua xícara.
            </p>
            <div className="contact-actions">
              <a href="https://www.instagram.com/cafezemaria/" target="_blank" rel="noopener noreferrer" aria-label="Contato pelo Instagram">
                Instagram
                <Icon className="h-4 w-4"><path d="M7 17 17 7M7 7h10v10" /></Icon>
              </a>
              <a href="https://wa.me/5527997762348" target="_blank" rel="noopener noreferrer" aria-label="Contato pelo WhatsApp">
                WhatsApp
                <Icon className="h-4 w-4"><path d="M7 17 17 7M7 7h10v10" /></Icon>
              </a>
            </div>
          </div>
          <div className="contact-mark">
            <img
              src={zeMariaCafeEspecialLogo}
              alt="Zé Maria Café Especial"
              className="contact-logo"
            />
            <div className="contact-divider" />
            <p>Itaguaçu<br />Espírito Santo, Brasil</p>
          </div>
        </div>
        <div className="contained footer-row">
          <span>© {new Date().getFullYear()} Zé Maria Cafés Especiais</span>
          <a href="#inicio">Voltar ao início ↑</a>
        </div>
      </section>

      <a href="#inicio" className="back-to-top" aria-label="Voltar ao topo">
        <Icon className="h-4 w-4">
          <path d="m6 15 6-6 6 6" />
        </Icon>
      </a>
    </main>
  )
}

export default App
