// Script do concurso cultural da Zé Maria.
// Cole este código inteiro no Apps Script da planilha (veja o passo a passo).
// A aba da planilha precisa se chamar exatamente "Respostas" e ter, na primeira
// linha, estes cabeçalhos nesta ordem:
// Data | Nome | E-mail | WhatsApp | Instagram | Cidade/UF | Resposta | Quer novidades

const NOME_DA_ABA = "Respostas"

function doPost(e) {
  const trava = LockService.getScriptLock()
  trava.waitLock(10000)
  try {
    const dados = JSON.parse(e.postData.contents)

    const nome = (dados.nome || "").toString().trim()
    const email = (dados.email || "").toString().trim().toLowerCase()
    const whatsapp = (dados.whatsapp || "").toString().replace(/\D/g, "")
    const instagram = (dados.instagram || "").toString().trim()
    const cidadeUf = (dados.cidadeUf || "").toString().trim()
    const resposta = (dados.resposta || "").toString().trim()
    const aceitaNovidades = !!dados.aceitaNovidades

    if (!nome || !email || whatsapp.length < 10 || !cidadeUf || !resposta) {
      return respostaJson({ status: "erro", message: "Faltou preencher algum campo obrigatório." })
    }
    if (resposta.length > 1000) {
      return respostaJson({ status: "erro", message: "A resposta passou de 1000 caracteres." })
    }
    if (!dados.aceiteRegulamento || !dados.consentimentoLgpd) {
      return respostaJson({ status: "erro", message: "É preciso aceitar o regulamento e o uso dos dados." })
    }

    const planilha = SpreadsheetApp.getActiveSpreadsheet()
    const aba = planilha.getSheetByName(NOME_DA_ABA)
    if (!aba) {
      return respostaJson({ status: "erro", message: "Aba da planilha não encontrada." })
    }

    const linhas = aba.getDataRange().getValues()
    for (let i = 1; i < linhas.length; i++) {
      const emailExistente = (linhas[i][2] || "").toString().trim().toLowerCase()
      const whatsappExistente = (linhas[i][3] || "").toString().replace(/\D/g, "")
      if (emailExistente === email || whatsappExistente === whatsapp) {
        return respostaJson({ status: "duplicado" })
      }
    }

    aba.appendRow([
      new Date(),
      nome,
      email,
      whatsapp,
      instagram,
      cidadeUf,
      resposta,
      aceitaNovidades ? "Sim" : "Não",
    ])

    return respostaJson({ status: "ok" })
  } catch (erro) {
    return respostaJson({ status: "erro", message: "Erro ao salvar. Tente novamente." })
  } finally {
    trava.releaseLock()
  }
}

function respostaJson(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON)
}
