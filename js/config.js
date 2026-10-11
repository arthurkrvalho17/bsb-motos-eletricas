/* Configuração única da LP. Edite aqui; depois rode, na raiz do projeto, UMA vez:  node tools/aplicar-config.js
   (grava o número de WhatsApp nos links wa.me do index.html, que funcionam mesmo sem JavaScript).
   Tudo vazio hoje = a página mostra marcadores .pendente e oculta o que depende de dado real. */
window.LP_CONFIG = {
  /* [DADO: número de WhatsApp] formato: DDD + número, só dígitos (ex.: "61999999999"). O 55 é adicionado sozinho.
     Vazio: os links abrem https://wa.me/?text=... (sem destinatário) e há aviso no console. */
  whatsapp: "",

  /* [DADO: nome do modelo] Vazio: mensagens do WhatsApp dizem só "moto elétrica". */
  modelo: "FOSTON X12 MAX",

  /* [DADO] Preços: SÓ O NÚMERO, sem "R$" (o HTML já traz o prefixo; um "R$" digitado é removido). Ex.: "9.990".
     Vazios: aparece o marcador amarelo.
     "de" (preço anterior) só pode ser preenchido com preço realmente praticado e período documentado
     (CDC art. 37) [CONFIRMAR com o responsável]. Vazio: o riscado não é renderizado. */
  preco: { avista: "4.446,20", parcelado: "10x de R$ 444,62", de: "" },

  /* Faixa "OFERTAS EXCLUSIVAS" e todas as menções à oferta (Hero, Produto, Pagamento, FAQ, CTA final, rodapé).
     Só renderiza se texto, validade E condicoes estiverem preenchidos e a validade ainda não tiver vencido.
     validade: ISO com fuso, ex.: "2026-12-31T23:59:00-03:00". Sem contador; só a data em texto.
     Hoje (briefing: n/a): vazio, nada é renderizado. */
  oferta: { texto: "", validade: "", condicoes: "" },

  /* Checklist de publicação (só documentação; o JS apenas usa siteUrl para montar og:image/og:url em teste local).
     1) remover <meta name="robots" content="noindex, nofollow"> do index.html;
     2) trocar og:image no HTML por URL absoluta (siteUrl + "/img/<foto real>.webp"), com FOTO REAL;
     3) preencher siteUrl, ex.: "https://dominio.com.br" ([DADO: domínio a decidir]). */
  publicacao: { siteUrl: "" },

  /* [DADO: ID de conversão Google Ads] Ex.: id "AW-XXXXXXXXX", label "abcDEF123".
     Com id vazio (hoje): nenhum script externo, nenhum banner. Com id preenchido: o banner de consentimento aparece;
     o gtag.js só é carregado depois de "Aceitar" (Consent Mode padrão "denied"; "Recusar" não carrega nada).
     A conversão (id/label) dispara no clique do WhatsApp só se o consentimento foi dado. */
  ads: { id: "", label: "" }
};
