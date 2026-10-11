/* LP BSB Motos Elétricas - comportamento. Sem dependências. Lê window.LP_CONFIG (js/config.js). */
(function () {
  'use strict';

  var C = window.LP_CONFIG || {};
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var state = { cor: '' };

  /* ---------- Oferta (fonte única da validade) ---------- */
  function ofertaAtiva() {
    var o = C.oferta || {};
    if (!o.texto || !o.validade || !o.condicoes) return false;
    var t = Date.parse(o.validade);
    return !isNaN(t) && t > Date.now();
  }
  function fmtValidade() {
    var d = new Date(C.oferta.validade);
    try {
      return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return C.oferta.validade; }
  }
  var OFERTA = ofertaAtiva();

  function renderOferta() {
    var els = $$('[data-oferta]');
    if (!OFERTA) { els.forEach(function (e) { e.hidden = true; }); return; }
    var map = { texto: C.oferta.texto, validade: fmtValidade(), condicoes: C.oferta.condicoes };
    Object.keys(map).forEach(function (k) {
      $$('[data-oferta-' + k + ']').forEach(function (e) { e.textContent = map[k]; });
    });
    els.forEach(function (e) { e.hidden = false; });
    /* A cápsula do header fica abaixo da faixa de oferta (sticky). */
    var bar = $('.offer-bar');
    var setH = function () { document.documentElement.style.setProperty('--offer-h', bar.offsetHeight + 'px'); };
    if (bar) { setH(); window.addEventListener('resize', setH); }
  }

  /* ---------- Dados de config no texto (modelo, preços) ---------- */
  function fill(sel, value) {
    if (!value) return;
    $$(sel).forEach(function (e) { e.textContent = value; });
  }
  function renderDados() {
    fill('[data-modelo]', C.modelo);
    var p = C.preco || {};
    var num$ = function (v) { return String(v || '').replace(/^\s*R\$\s*/i, ''); };
    fill('[data-preco-avista]', num$(p.avista));
    fill('[data-preco-parcelado]', num$(p.parcelado));
    if (p.de) { fill('[data-preco-de]', num$(p.de)); var de = $('.price__de'); if (de) de.hidden = false; }
    var num = digits(C.whatsapp);
    if (num) fill('[data-wa-numero]', formatNumero(num));
  }

  /* ---------- WhatsApp ---------- */
  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function waNumero() {
    var n = digits(C.whatsapp);
    if (!n) return '';
    if (n.length <= 11) n = '55' + n;
    return n;
  }
  function formatNumero(n) {
    var l = n.replace(/^55/, '');
    return l.length === 11 ? '(' + l.slice(0, 2) + ') ' + l.slice(2, 7) + '-' + l.slice(7) : l;
  }
  function msg(kind) {
    var modelo = C.modelo ? ' ' + C.modelo : '';
    var cor = state.cor;
    var corTxt = cor ? ' na cor ' + cor : '';
    switch (kind) {
      case 'habilitacao':
        return 'Olá! Tenho interesse na moto elétrica' + modelo + ' e quero confirmar: preciso de habilitação para pilotar?';
      case 'pagamento':
        return 'Olá! Quero simular o pagamento da moto elétrica' + modelo + corTxt + '. Quais as opções à vista e parcelado?';
      case 'cobertura':
        return 'Olá! Moro em [sua cidade] e tenho interesse na moto elétrica' + modelo + '. Vocês entregam aqui?';
      default:
        if (OFERTA) {
          return 'Olá! Vi a oferta exclusiva "' + C.oferta.texto + '" no site da BSB Motos Elétricas, válida até ' + fmtValidade() +
            '. Tenho interesse na moto elétrica' + modelo + (cor ? ' na cor ' + cor : '. Ainda não escolhi a cor') + '. Pode me passar as condições?';
        }
        if (cor) {
          return 'Olá! Vi o site da BSB Motos Elétricas e tenho interesse na moto elétrica' + modelo + ' na cor ' + cor + '. Essa cor está disponível? Qual o valor à vista e parcelado?';
        }
        return 'Olá! Vi o site da BSB Motos Elétricas e tenho interesse na moto elétrica' + modelo + '. Ainda não escolhi a cor. Quais cores estão disponíveis hoje?';
    }
  }
  function atualizaLinks() {
    var base = 'https://wa.me/' + waNumero();
    $$('a[data-wa]').forEach(function (a) {
      a.href = base + '?text=' + encodeURIComponent(msg(a.getAttribute('data-wa')));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  if (!waNumero() && window.console) console.warn('[LP] LP_CONFIG.whatsapp vazio: links wa.me sem destinatário. [DADO] pendente.');

  /* ---------- Conversão Google Ads (preparada, sem carregar tag) ---------- */
  var ADS = C.ads || {};
  var CONSENT_KEY = 'lp_consent';
  var consentido = false;

  function posicao(a) {
    var p = a.getAttribute('data-pos') || 'desconhecida';
    if (p === 'fixo') p = window.matchMedia('(min-width: 768px)').matches ? 'fixo-desktop' : 'fixo-mobile';
    return p;
  }
  function track(pos) {
    /* Só mede com consentimento dado e ID preenchido; sem isso, nada é enviado nem enfileirado. */
    if (!ADS.id || !consentido || typeof window.gtag !== 'function') return;
    window.gtag('event', 'whatsapp_click', { posicao: pos, cor: state.cor || undefined, oferta_ativa: OFERTA });
    if (ADS.label) {
      window.gtag('event', 'conversion', { send_to: ADS.id + '/' + ADS.label, posicao: pos, cor: state.cor || undefined });
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-wa]');
    if (a) track(posicao(a));
  });

  /* ---------- Consentimento LGPD + gtag.js (só com ads.id) ---------- */
  function lerConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function salvaConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* sem storage: vale só nesta visita */ } }
  var gtagInjetado = false;
  function carregaGtag() {
    if (consentido) return;
    consentido = true;
    window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    if (gtagInjetado) return;
    gtagInjetado = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS.id);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', ADS.id);
  }
  function iniciaConsent() {
    if (!ADS.id) return; /* sem ID: nada externo, sem banner */
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
    var box = $('#consent');
    var salvo = lerConsent();
    if (box) {
      $$('[data-consent]', box).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-consent');
          salvaConsent(v);
          box.hidden = true;
          if (v === 'granted') carregaGtag(); else revogaGtag();
        });
      });
    }
    /* Link "Preferências de cookies" no rodapé: só existe com ads.id; reabre o banner e permite revogar. */
    var pref = $('[data-consent-prefs]');
    if (pref) {
      pref.hidden = false;
      var btn = $('button', pref);
      if (btn && box) btn.addEventListener('click', function () { box.hidden = false; var f = $('[data-consent]', box); if (f) f.focus(); });
    }
    if (salvo === 'granted') carregaGtag();
    else if (salvo !== 'denied' && box) box.hidden = false;
  }
  function revogaGtag() {
    /* Revogação: para de enviar eventos e nega o consentimento; limpa o estado local. */
    if (!consentido) return;
    consentido = false;
    window.gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
  }

  /* ---------- Seletor de cores ---------- */
  function iniciaCores() {
    var out = $('#cor-escolhida');
    $$('input[name="cor"]').forEach(function (r) {
      r.addEventListener('change', function () {
        state.cor = r.value;
        if (out) out.textContent = 'Cor selecionada: ' + r.value + '. Ela já vai na mensagem do WhatsApp.';
        atualizaLinks();
      });
    });
  }

  /* ---------- Botão fixo: esconde com Hero ou CTA final visíveis ---------- */
  function iniciaFixo() {
    var fixo = $('#wa-fixed');
    if (!fixo || !('IntersectionObserver' in window)) { if (fixo) fixo.hidden = false; return; }
    /* Esconde a barra só enquanto o botão do Hero ou o do CTA final está na tela (o CTA já está visível, sem duplicar). */
    var vis = {}, visto = false;
    fixo.hidden = true; /* estado inicial: oculto até o observer confirmar que o CTA do Hero saiu da tela */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.getAttribute('data-pos')] = e.isIntersecting; visto = true; });
      fixo.hidden = !visto || !!(vis.hero || vis.final);
    });
    ['hero', 'final'].forEach(function (p) { var el = $('main a[data-pos="' + p + '"]'); if (el) io.observe(el); });
  }

  /* ---------- Animações de entrada ao rolar (IO) ----------
     Tudo abaixo do Hero sobe e aparece ao entrar na tela; irmãos da mesma lista entram em cascata.
     O estado escondido só existe com a classe .rv-on no <html>, que só é posta aqui (com JS, IO e movimento permitido);
     sem isso a página aparece inteira, sem animação. */
  var APARECER = [
    '.specbar__item', '.specbar__foot', '.specbar__pend',
    '.section h2:not(.sr-only)', '.section .label', '.section .lead', '.prose > p', '.section .note',
    '.motivos__list > li',
    '.vitrine picture', '.vitrine__kicker', '.vitrine__title', '.vitrine__tag', '.vitrine__price', '.vitrine__legal', '.vitrine__ctas',
    '.compare__col', '.conds > li', '.callout', '.rows > li', '.steps > li', '.mini-gallery > *', '.panel',
    '.faq__list > details', '.section .cta-row',
    '.cta-card h2', '.cta-card .inline-list > li', '.cta-card p', '.cta-card .cta-row',
    '.footer__grid > div', '.footer .legal'
  ];
  function iniciaReveal() {
    if (RM || !('IntersectionObserver' in window)) return;
    /* Títulos com data-reveal: palavra a palavra via animation-timeline onde há suporte; senão entram como os demais. */
    var porPalavra = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
    $$('[data-reveal]').forEach(function (el) {
      if (!porPalavra) return;
      var txt = el.textContent.trim();
      el.setAttribute('aria-label', txt);
      el.innerHTML = txt.split(/\s+/).map(function (w, i) {
        return '<span class="reveal-word" aria-hidden="true" style="--i:' + i + '">' + w + '</span>';
      }).join(' ');
      el.classList.add('reveal');
    });
    var els = [];
    APARECER.forEach(function (sel) {
      $$(sel).forEach(function (el) {
        if (els.indexOf(el) > -1 || el.closest('#hero') || (porPalavra && el.hasAttribute('data-reveal'))) return;
        els.push(el);
      });
    });
    els.forEach(function (el) {
      var irmaos = Array.prototype.filter.call(el.parentElement.children, function (c) { return els.indexOf(c) > -1; });
      el.style.setProperty('--rv-i', Math.min(irmaos.indexOf(el), 6));
      el.classList.add(el.tagName === 'PICTURE' ? 'rv-img' : 'rv');
    });
    document.documentElement.classList.add('rv-on');
    var io = new IntersectionObserver(function (es, o) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
    /* Impressão: mostra tudo. */
    window.addEventListener('beforeprint', function () { els.forEach(function (el) { el.classList.add('is-in'); }); });
  }

  /* ---------- Ticker: pausa fora da tela e botão Pausar (WCAG 2.2.2) ---------- */
  function iniciaTicker() {
    var t = $('.ticker');
    if (!t || RM) return;
    var btn = $('.ticker__pause', t);
    if (btn) btn.addEventListener('click', function () {
      var p = t.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(p));
      btn.textContent = p ? 'Retomar animação' : 'Pausar animação';
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { t.classList.toggle('is-offscreen', !es[0].isIntersecting); }).observe(t);
    }
  }

  /* ---------- Especificações: aberto no desktop, recolhido no mobile ---------- */
  function iniciaSpecs() {
    var d = $('details.specs');
    if (d && window.matchMedia('(max-width: 767.98px)').matches) d.open = false;
  }

  renderOferta();
  renderDados();
  atualizaLinks();
  iniciaCores();
  iniciaConsent();
  iniciaFixo();
  iniciaReveal();
  iniciaTicker();
  iniciaSpecs();
})();
