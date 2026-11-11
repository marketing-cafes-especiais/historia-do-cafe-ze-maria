import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import zeMariaCafeEspecialLogo from "./assets/logo-ze-maria-cafe-especial.png"
import heroFoto8 from "./assets/hero-bg-8.jpg"
import heroFoto11 from "./assets/hero-bg-11.jpg"
import colhedorCafe from "./assets/ficha-colhedor.jpg"
import paisagemItaguacu from "./assets/itaguacu-paisagem.jpg"

// Monta o caminho de uma imagem da pasta public/ respeitando o subdiretório
// de publicação (necessário no GitHub Pages, ex: /historia-do-cafe-ze-maria/).
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`

// Adicione mais imagens aqui para o fundo da abertura alternar automaticamente.
const heroImages = [
  heroFoto8,
  heroFoto11,
]

// Cole aqui o link de incorporação do YouTube quando o vídeo estiver pronto,
// ex: "https://www.youtube.com/embed/SEU_ID_AQUI". Deixe vazio para manter a prévia.
const historyVideoEmbedUrl = "https://www.youtube.com/embed/3saVBpGPTbc"

const sections = [
  ["historia", "História"],
  ["inicio", "Abertura"],
  ["ficha", "Ficha rápida"],
  ["producao", "Produção"],
  ["xicara", "Na xícara"],
  ["preparo", "Como preparar"],
  ["concurso", "Concurso cultural"],
  ["contato", "Contato"],
] as const

// Cole aqui a URL do seu Google Apps Script (Web App) depois de publicá-lo.
// Veja o passo a passo que a Claude te deu para criar essa URL.
const CONCURSO_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxdw98-iWMfd44Wacq5jMRgJGNje1aKnoRBWhG7U3q9DaNUcdp2Wer_4JnxEsNfU3FGSQ/exec"

// Período de inscrição do concurso cultural (horário de Brasília).
const CONCURSO_INICIO = new Date("2026-11-15T00:00:00-03:00")
const CONCURSO_FIM = new Date("2027-01-05T23:59:59-03:00")

type ConcursoFase = "antes" | "aberto" | "depois"

function getConcursoFase(agora: Date): ConcursoFase {
  if (agora < CONCURSO_INICIO) return "antes"
  if (agora > CONCURSO_FIM) return "depois"
  return "aberto"
}

const formatarData = (data: Date) =>
  data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })

type ConcursoEnvioStatus = "idle" | "enviando" | "sucesso" | "duplicado" | "erro"

function ConcursoCultural() {
  const [fase] = useState<ConcursoFase>(() => getConcursoFase(new Date()))
  const [regulamentoAberto, setRegulamentoAberto] = useState(false)
  const [lgpdAberto, setLgpdAberto] = useState(false)
  const [status, setStatus] = useState<ConcursoEnvioStatus>("idle")
  const [mensagemErro, setMensagemErro] = useState("")
  const [erros, setErros] = useState<Record<string, string>>({})
  const [cupomArquivo, setCupomArquivo] = useState<File | null>(null)
  const [cupomErro, setCupomErro] = useState("")
  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    instagram: "",
    cidadeUf: "",
    resposta: "",
    aceiteRegulamento: false,
    consentimentoLgpd: false,
    aceitaNovidades: false,
  })

  const atualizarCampo = (campo: keyof typeof form, valor: string | boolean) => {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  const escolherCupom = (arquivo: File | null) => {
    setCupomErro("")
    if (!arquivo) {
      setCupomArquivo(null)
      return
    }
    const tiposAceitos = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"]
    if (!tiposAceitos.includes(arquivo.type)) {
      setCupomErro("Envie uma imagem (jpg, png, webp) ou PDF.")
      return
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setCupomErro("O arquivo precisa ter até 5 MB.")
      return
    }
    setCupomArquivo(arquivo)
  }

  const arquivoParaBase64 = (arquivo: File) =>
    new Promise<string>((resolve, reject) => {
      const leitor = new FileReader()
      leitor.onload = () => resolve((leitor.result as string).split(",")[1] || "")
      leitor.onerror = () => reject(leitor.error)
      leitor.readAsDataURL(arquivo)
    })

  const validar = () => {
    const novosErros: Record<string, string> = {}
    if (!form.nome.trim()) novosErros.nome = "Informe seu nome completo."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      novosErros.email = "Informe um e-mail válido."
    }
    if (form.whatsapp.replace(/\D/g, "").length < 10) {
      novosErros.whatsapp = "Informe um WhatsApp válido, com DDD."
    }
    if (!form.cidadeUf.trim()) novosErros.cidadeUf = "Informe sua cidade e UF."
    if (!form.resposta.trim()) novosErros.resposta = "Escreva sua resposta."
    if (form.resposta.length > 1000) novosErros.resposta = "A resposta passou de 1000 caracteres."
    if (!form.aceiteRegulamento) novosErros.aceiteRegulamento = "Você precisa aceitar o regulamento."
    if (!form.consentimentoLgpd) novosErros.consentimentoLgpd = "Você precisa aceitar o uso dos seus dados."
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (fase !== "aberto") return
    if (!validar()) return

    setStatus("enviando")
    setMensagemErro("")
    try {
      let cupom: { nome: string; tipo: string; base64: string } | null = null
      if (cupomArquivo) {
        cupom = {
          nome: cupomArquivo.name,
          tipo: cupomArquivo.type,
          base64: await arquivoParaBase64(cupomArquivo),
        }
      }

      const resposta = await fetch(CONCURSO_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...form, cupom }),
      })
      const dados = await resposta.json()
      if (dados.status === "ok") {
        setStatus("sucesso")
      } else if (dados.status === "duplicado") {
        setStatus("duplicado")
      } else {
        setStatus("erro")
        setMensagemErro(dados.message || "Não foi possível enviar. Tente novamente.")
      }
    } catch {
      setStatus("erro")
      setMensagemErro("Não foi possível enviar. Verifique sua internet e tente novamente.")
    }
  }

  return (
    <section id="concurso" className="page-section contained">
      <SectionTitle
        number="06"
        eyebrow="Concurso cultural"
        title="Participe por aqui: conte como você prepara o seu café e qual método mais gosta."
      >
        Sem necessidade de compra — o ganhador é escolhido pela criatividade da resposta.
      </SectionTitle>

      <div className="concurso-grid">
        <div className="concurso-info">
          <div className="concurso-fact">
            <p>Inscrições</p>
            <strong>{formatarData(CONCURSO_INICIO)} a {formatarData(CONCURSO_FIM)}</strong>
          </div>
          <div className="concurso-fact">
            <p>Resultado</p>
            <strong>12/01/2027, no Instagram @cafezemaria</strong>
          </div>
          <div className="concurso-fact">
            <p>Prêmio</p>
            <strong>Kit barista completo para 1 ganhador(a)</strong>
            <span>Moedor de grãos, prensa francesa, balança eletrônica, copo dosador e spray</span>
          </div>
        </div>

        <div className="concurso-form-wrap">
          {fase === "antes" && (
            <div className="concurso-aviso">
              As inscrições começam em {formatarData(CONCURSO_INICIO)}. Volte aqui nessa data para participar.
            </div>
          )}
          {fase === "depois" && (
            <div className="concurso-aviso">
              As inscrições deste concurso terminaram em {formatarData(CONCURSO_FIM)}.
              Acompanhe o resultado em 12/01/2027 no Instagram @cafezemaria.
            </div>
          )}

          {fase === "aberto" && status === "sucesso" && (
            <div className="concurso-sucesso">
              Inscrição enviada! O resultado sai em 12/01/2027, no Instagram @cafezemaria.
            </div>
          )}

          {fase === "aberto" && status === "duplicado" && (
            <div className="concurso-aviso">
              Já recebemos uma inscrição com esse e-mail ou WhatsApp. Cada pessoa participa uma única vez.
            </div>
          )}

          {fase === "aberto" && status !== "sucesso" && status !== "duplicado" && (
            <form className="concurso-form" onSubmit={enviar} noValidate>
              <label>
                Nome completo
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  autoComplete="name"
                />
                {erros.nome && <span className="concurso-erro">{erros.nome}</span>}
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => atualizarCampo("email", e.target.value)}
                  autoComplete="email"
                />
                {erros.email && <span className="concurso-erro">{erros.email}</span>}
              </label>

              <label>
                WhatsApp (com DDD)
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => atualizarCampo("whatsapp", e.target.value)}
                  placeholder="(27) 99999-9999"
                  autoComplete="tel"
                />
                {erros.whatsapp && <span className="concurso-erro">{erros.whatsapp}</span>}
              </label>

              <label>
                @ do Instagram (opcional)
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => atualizarCampo("instagram", e.target.value)}
                  placeholder="@seuusuario"
                />
              </label>

              <a
                href="https://www.instagram.com/cafezemaria/"
                target="_blank"
                rel="noopener noreferrer"
                className="concurso-instagram"
              >
                Seguir @cafezemaria no Instagram
                <Icon className="h-4 w-4"><path d="M7 17 17 7M7 7h10v10" /></Icon>
              </a>

              <label>
                Cidade e UF
                <input
                  type="text"
                  value={form.cidadeUf}
                  onChange={(e) => atualizarCampo("cidadeUf", e.target.value)}
                  placeholder="Vila Velha, ES"
                />
                {erros.cidadeUf && <span className="concurso-erro">{erros.cidadeUf}</span>}
              </label>

              <label>
                Qual é o seu método de preparo favorito e por quê?
                <textarea
                  value={form.resposta}
                  onChange={(e) => atualizarCampo("resposta", e.target.value.slice(0, 1000))}
                  maxLength={1000}
                  rows={5}
                />
                <span className="concurso-contador">{form.resposta.length}/1000</span>
                {erros.resposta && <span className="concurso-erro">{erros.resposta}</span>}
              </label>

              <label>
                Cupom fiscal da compra
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => escolherCupom(e.target.files?.[0] ?? null)}
                />
                {cupomArquivo && <span className="concurso-contador">Selecionado: {cupomArquivo.name}</span>}
                {cupomErro && <span className="concurso-erro">{cupomErro}</span>}
              </label>

              <label className="concurso-checkbox">
                <input
                  type="checkbox"
                  checked={form.aceiteRegulamento}
                  onChange={(e) => atualizarCampo("aceiteRegulamento", e.target.checked)}
                />
                <span>
                  Tenho 18 anos ou mais e li e aceito o{" "}
                  <button
                    type="button"
                    className="concurso-link-regulamento"
                    onClick={() => setRegulamentoAberto(true)}
                  >
                    regulamento
                  </button>
                  .
                </span>
              </label>
              {erros.aceiteRegulamento && <span className="concurso-erro">{erros.aceiteRegulamento}</span>}

              <label className="concurso-checkbox">
                <input
                  type="checkbox"
                  checked={form.consentimentoLgpd}
                  onChange={(e) => atualizarCampo("consentimentoLgpd", e.target.checked)}
                />
                <span>
                  Autorizo o uso dos meus dados para participação neste concurso, conforme a{" "}
                  <button
                    type="button"
                    className="concurso-link-regulamento"
                    onClick={() => setLgpdAberto(true)}
                  >
                    LGPD
                  </button>
                  .
                </span>
              </label>
              {erros.consentimentoLgpd && <span className="concurso-erro">{erros.consentimentoLgpd}</span>}

              <label className="concurso-checkbox">
                <input
                  type="checkbox"
                  checked={form.aceitaNovidades}
                  onChange={(e) => atualizarCampo("aceitaNovidades", e.target.checked)}
                />
                <span>Quero receber novidades da Zé Maria.</span>
              </label>

              {status === "erro" && <div className="concurso-erro-envio">{mensagemErro}</div>}

              <button type="submit" className="concurso-submit" disabled={status === "enviando"}>
                {status === "enviando" ? "Enviando..." : "Participar do concurso"}
              </button>
            </form>
          )}
        </div>
      </div>

      <details
        className="concurso-regulamento"
        open={regulamentoAberto}
        onToggle={(e) => setRegulamentoAberto((e.target as HTMLDetailsElement).open)}
      >
        <summary>Ver regulamento</summary>
        <div className="concurso-regulamento-texto">
          <p><strong>1. Empresa promotora.</strong> Cafe Ze Maria LTDA, CNPJ 11.756.868/0001-32.</p>
          <p><strong>2. Período de participação.</strong> De 15/11/2026 a 05/01/2027.</p>
          <p>
            <strong>3. Quem pode participar.</strong> Pessoas maiores de 18 anos, residentes no
            Brasil. Não podem participar funcionários da Zé Maria e seus familiares.
          </p>
          <p>
            <strong>4. Como participar.</strong> Pelo formulário desta página, respondendo à
            pergunta "Qual é o seu método de preparo favorito e por quê?". A participação é
            gratuita, sem necessidade de compra, e cada pessoa pode participar uma única vez. O
            formulário também permite anexar, de forma totalmente opcional, uma foto do cupom
            fiscal de uma compra do Café Zé Maria — esse anexo é apenas informativo e não
            influencia a avaliação nem é necessário para participar.
          </p>
          <p>
            <strong>5. Critérios de julgamento.</strong> As respostas serão avaliadas por
            criatividade, originalidade e adequação ao tema, por uma comissão interna da Zé
            Maria. Este é um concurso cultural: o ganhador é escolhido por mérito, com base na
            qualidade da resposta enviada. A comissão também define o 2º e o 3º colocados como suplentes.
          </p>
          <p>
            <strong>6. Prêmio.</strong> Um kit barista para 1 (um) ganhador, composto por moedor
            de grãos de café, prensa francesa, balança eletrônica, copo dosador e spray. O prêmio
            não pode ser trocado por dinheiro.
          </p>
          <p>
            <strong>7. Resultado.</strong> Divulgado em 12/01/2027, no Instagram @cafezemaria.
          </p>
          <p>
            <strong>8. Contato com o ganhador.</strong> A Zé Maria entrará em contato por
            WhatsApp e e-mail no dia do resultado, solicitando nome completo, CEP, endereço,
            número, complemento, cidade, estado e telefone para entrega. O ganhador tem 5 (cinco)
            dias úteis para responder; sem resposta nesse prazo, o prêmio passa ao suplente seguinte.
          </p>
          <p>
            <strong>9. Entrega.</strong> O prêmio será enviado pelos Correios, com frete pago pela
            Zé Maria.
          </p>
          <p>
            <strong>10. Desclassificação.</strong> Serão desclassificadas respostas ofensivas,
            cópias de outros textos (plágio), ou cadastros com dados falsos ou incompletos.
          </p>
          <p>
            <strong>11. Uso da resposta.</strong> Ao participar, você autoriza a Zé Maria a
            divulgar sua resposta e seu nome em seus canais, caso seja a pessoa ganhadora.
          </p>
          <p>
            <strong>12. LGPD.</strong> Coletamos nome, e-mail, WhatsApp, Instagram (se informado),
            cidade/UF e sua resposta, apenas para viabilizar a participação neste concurso e, caso
            você autorize no formulário, para enviar novidades da marca. Os dados ficam guardados
            pelo tempo necessário para a apuração do concurso e entrega do prêmio, e são
            removidos depois disso. Para pedir a exclusão dos seus dados antes disso, escreva para{" "}
            <a href="mailto:pamela.soares@bodenclub.com.br">pamela.soares@bodenclub.com.br</a>.
          </p>
          <p>
            <strong>13. Instagram.</strong> Seguir o perfil @cafezemaria é opcional, serve apenas
            para acompanhar o resultado, e não influencia o julgamento.
          </p>
          <p>
            <strong>14. Disposições gerais.</strong> A participação neste concurso implica a
            aceitação total deste regulamento. Dúvidas podem ser enviadas para{" "}
            <a href="mailto:pamela.soares@bodenclub.com.br">pamela.soares@bodenclub.com.br</a>.
          </p>
        </div>
      </details>

      <details
        className="concurso-regulamento"
        open={lgpdAberto}
        onToggle={(e) => setLgpdAberto((e.target as HTMLDetailsElement).open)}
      >
        <summary>Ver política de privacidade (LGPD)</summary>
        <div className="concurso-regulamento-texto">
          <p>
            <strong>Controlador dos dados.</strong> Cafe Ze Maria LTDA, CNPJ 11.756.868/0001-32.
          </p>
          <p>
            <strong>Quais dados coletamos.</strong> Nome completo, e-mail, WhatsApp, @ do
            Instagram (se informado), cidade/UF, a resposta que você enviar no formulário e, se
            você optar por anexar, a foto do cupom fiscal.
          </p>
          <p>
            <strong>Para que usamos.</strong> Para viabilizar sua participação neste concurso
            cultural — inscrição, contato em caso de ganho e divulgação do nome do ganhador — e,
            somente se você marcar essa opção no formulário, para enviar novidades da marca Zé
            Maria.
          </p>
          <p>
            <strong>Base legal.</strong> O seu consentimento, dado ao marcar as caixinhas do
            formulário.
          </p>
          <p>
            <strong>Por quanto tempo guardamos.</strong> Pelo tempo necessário para a apuração do
            concurso e entrega do prêmio. Depois disso, os dados são removidos — exceto se você
            tiver autorizado o recebimento de novidades, caso em que ficam até você pedir a
            remoção.
          </p>
          <p>
            <strong>Compartilhamento.</strong> Seus dados não são vendidos nem compartilhados com
            terceiros, exceto o necessário para o envio do prêmio pelos Correios, caso você seja a
            pessoa ganhadora.
          </p>
          <p>
            <strong>Seus direitos.</strong> Você pode pedir, a qualquer momento, a confirmação, a
            correção ou a exclusão dos seus dados, escrevendo para{" "}
            <a href="mailto:pamela.soares@bodenclub.com.br">pamela.soares@bodenclub.com.br</a>.
          </p>
        </div>
      </details>

      <SectionNav previous="preparo" next="contato" nextLabel="Falar com a gente" />
    </section>
  )
}

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
            {sections.map(([id, label], index) => (
              <a key={id} href={`#${id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
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
            Você acaba de receber o café Zé Maria. Agora, chegue mais perto:
            conheça o caminho do café, da lavoura ao seu jeito de preparar.
          </p>
          <div className="hero-actions">
            <a href="#video-historia" className="preparation-button">
              Conheça a história Zé Maria
              <Icon className="h-4 w-4">
                <path d="m9 18 6-6-6-6" />
              </Icon>
            </a>
            <a href="#concurso" className="preparation-button kit">
              <span aria-hidden="true">🎁</span>
              Quero ganhar o kit
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
            src={paisagemItaguacu}
            alt="Vista de Itaguaçu, com a igreja e o morro ao fundo"
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
        <SectionNav previous="xicara" next="concurso" nextLabel="Concurso cultural" />
      </section>

      <ConcursoCultural />

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
