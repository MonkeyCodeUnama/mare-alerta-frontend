export type LandingLocale = 'pt-br' | 'en';

export interface LandingCopy {
  htmlLang: string;
  ogLocale: string;
  altLocale: LandingLocale;
  altHref: string;
  currentCode: string;
  altCode: string;
  meta: {
    title: string;
    description: string;
    schemaDescription: string;
  };
  nav: {
    ariaLabel: string;
    mobileAriaLabel: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    themeToggleLabel: string;
    langSwitchTitle: string;
    home: string;
    about: string;
    features: string;
    howItWorks: string;
    signIn: string;
    signUp: string;
    openDashboard: string;
  };
  hero: {
    imgAlt: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaSignUp: string;
    ctaDashboard: string;
    ctaFeatures: string;
  };
  panorama: {
    bayLabel: string;
    bayAlt: string;
    riskLabel: string;
    riskAlt: string;
    alertsLabel: string;
    alertsAlt: string;
    districtsLabel: string;
    districtsAlt: string;
  };
  sobre: {
    title: string;
    subtitle: string;
    cards: {
      telemetry: { title: string; desc: string; alt: string };
      prevention: { title: string; desc: string; alt: string };
      protocol: { title: string; desc: string; alt: string };
    };
    splitLeft: string;
    splitLeftAlt: string;
    splitRight: string;
    splitRightAlt: string;
  };
  rotina: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    card1: {
      mapLabel: string;
      active: string;
      jurunasStatus: string;
      verOPesoStatus: string;
      title: string;
      desc: string;
    };
    card2: {
      tideRainLabel: string;
      highTide: string;
      title: string;
      desc: string;
    };
    card3: {
      protocolSavedLabel: string;
      verified: string;
      imgAlt: string;
      evidenceAttached: string;
      confirmedTime: string;
      title: string;
      desc: string;
    };
  };
  comoFunciona: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    step1: {
      badge: string;
      active: string;
      location: string;
      alertLevel: string;
      protectedItemsLabel: string;
      item1Title: string;
      item1Sub: string;
      item2Title: string;
      item2Sub: string;
      item3Title: string;
      item3Sub: string;
      item4Title: string;
      item4Status: string;
      monitoringFooter: string;
      stepLabel: string;
      titleLine1: string;
      titleLine2: string;
      desc: string;
    };
    step2: {
      tideCurveLabel: string;
      warning: string;
      highTideTime: string;
      rainTideBadge: string;
      checklistLabel: string;
      check1: string;
      check2: string;
      check3: string;
      safeWindow: string;
      stepLabel: string;
      titleLine1: string;
      titleLine2: string;
      desc: string;
    };
    step3: {
      quickLogLabel: string;
      protocolBadge: string;
      imgAlt: string;
      levelRecorded: string;
      neighborhoodLabel: string;
      statusLabel: string;
      statusValue: string;
      savedFooter: string;
      stepLabel: string;
      titleLine1: string;
      titleLine2: string;
      desc: string;
    };
  };
  finalCta: {
    titleLine1: string;
    titleLine2: string;
    ctaGuest: string;
    ctaAuth: string;
    footnoteLine1: string;
    footnoteLine2: string;
  };
  footer: {
    ariaLabel: string;
    home: string;
    about: string;
    features: string;
    howItWorks: string;
    copyright: string;
  };
}

export const landingCopy: Record<LandingLocale, LandingCopy> = {
  'pt-br': {
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    altLocale: 'en',
    altHref: '/en/',
    currentCode: 'PT',
    altCode: 'EN',
    meta: {
      title: 'Maré Alerta — Previsão de Maré e Prevenção em Belém',
      description:
        'A água muda. Seu comércio se prepara. Previsão de maré, alertas por bairro e proteção preventiva em Belém.',
      schemaDescription:
        'Previsão de maré, monitoramento da Baía do Guajará, alertas por bairro e registro preventivo para comércios em Belém/PA.',
    },
    nav: {
      ariaLabel: 'Navegação principal',
      mobileAriaLabel: 'Navegação móvel',
      openMenuLabel: 'Abrir menu de navegação',
      closeMenuLabel: 'Fechar menu de navegação',
      themeToggleLabel: 'Alternar tema claro e escuro',
      langSwitchTitle: 'Switch to English',
      home: 'Início',
      about: 'Sobre',
      features: 'Recursos',
      howItWorks: 'Como funciona',
      signIn: 'Entrar',
      signUp: 'Criar conta',
      openDashboard: 'Abrir painel',
    },
    hero: {
      imgAlt: 'Orla de Belém voltada para a Baía do Guajará',
      titleLine1: 'A água muda.',
      titleLine2: 'Seu comércio se prepara.',
      subtitle:
        'Monitoramento contínuo da Baía do Guajará, risco por bairro e checklists práticos antes da cheia atingir o seu ponto.',
      ctaSignUp: 'Criar conta',
      ctaDashboard: 'Acessar painel',
      ctaFeatures: 'Ver recursos',
    },
    panorama: {
      bayLabel: 'Baía do Guajará',
      bayAlt: 'Embarcação navegando na Baía do Guajará junto ao guindaste da Estação das Docas em Belém',
      riskLabel: 'Risco por Bairro',
      riskAlt: 'Canal urbano cheio entre avenidas e edifícios de Belém',
      alertsLabel: 'Alertas em Tempo Real',
      alertsAlt: 'Palafitas e barcos às margens de igarapé na região ribeirinha de Belém',
      districtsLabel: 'Ver-o-Peso & Jurunas',
      districtsAlt: 'Mercado Ver-o-Peso e comércios portuários ao entardecer em Belém',
    },
    sobre: {
      title: 'Decisão antes da cheia.',
      subtitle:
        'Monitoramos a oscilação da Baía do Guajará e as áreas vulneráveis de Belém para transformar leitura de maré em proteção prática para o seu comércio.',
      cards: {
        telemetry: {
          title: 'Telemetria',
          desc: 'Leitura diária da maré e previsão de chuva na orla.',
          alt: 'Vista da orla e edifícios de Belém sob a baía',
        },
        prevention: {
          title: 'Prevenção',
          desc: 'Ações ordenadas para elevar estoques e proteger freezers.',
          alt: 'Espaço São José Liberto com espelho d’água junto ao casario histórico de Belém',
        },
        protocol: {
          title: 'Protocolo',
          desc: 'Registro fotográfico organizado de cada episódio de alagamento.',
          alt: 'Orla comercial da Estação das Docas em Belém',
        },
      },
      splitLeft: 'Movido pela natureza',
      splitLeftAlt: 'Vegetação amazônica refletida nas águas calmas do igarapé',
      splitRight: 'Guiado pela previsão',
      splitRightAlt: 'Mercado do Ver-o-Peso iluminado sob a Baía do Guajará ao anoitecer',
    },
    rotina: {
      eyebrow: 'Na rotina do seu ponto',
      titleLine1: 'Três leituras.',
      titleLine2: 'Um plano claro de ação.',
      card1: {
        mapLabel: 'Mapa de risco',
        active: 'Ativo',
        jurunasStatus: 'Atenção',
        verOPesoStatus: 'Estável',
        title: 'Risco por bairro.',
        desc: 'Alerta da sua área antes de abrir.',
      },
      card2: {
        tideRainLabel: 'Maré & chuva',
        highTide: 'Preamar',
        title: 'Curva de maré e chuva.',
        desc: 'Preamar cruzada com chuva do dia.',
      },
      card3: {
        protocolSavedLabel: 'Protocolo salvo',
        verified: 'Verificado',
        imgAlt: 'Evidência fotográfica de ocorrência em ponto comercial',
        evidenceAttached: 'Evidência anexada',
        confirmedTime: 'Local e horário confirmados',
        title: 'Registro com protocolo.',
        desc: 'Fotos e histórico em protocolo único.',
      },
    },
    comoFunciona: {
      eyebrow: 'Passo a passo',
      titleLine1: 'Como funciona na prática.',
      titleLine2: 'Do cadastro ao protocolo no celular.',
      subtitle:
        'Três momentos simples que transformam previsão de maré em rotina preventiva no seu comércio.',
      step1: {
        badge: 'Cadastro do ponto',
        active: 'Ativo',
        location: 'Jurunas · Baía do Guajará',
        alertLevel: 'Cota de alerta',
        protectedItemsLabel: 'Itens protegidos',
        item1Title: 'Freezers e câmara',
        item1Sub: 'Cota crítica +35 cm',
        item2Title: 'Estoque de grãos',
        item2Sub: 'Sobre paletes +60 cm',
        item3Title: 'Balcão e caixa',
        item3Sub: 'Tomadas altas +45 cm',
        item4Title: 'Quadro elétrico',
        item4Status: 'Protegido',
        monitoringFooter: 'Monitoramento contínuo 24h',
        stepLabel: 'Passo 1',
        titleLine1: 'Cadastre seu comércio',
        titleLine2: 'e defina o que proteger',
        desc: 'Informe seu bairro em Belém e liste equipamentos e estoques sensíveis à maré.',
      },
      step2: {
        tideCurveLabel: 'Curva da maré',
        warning: 'Aviso',
        highTideTime: 'Preamar · 16:40',
        rainTideBadge: 'Chuva + Maré',
        checklistLabel: 'Checklist preventivo',
        check1: 'Elevar paletes do estoque',
        check2: 'Checar drenagem frontal',
        check3: 'Desligar tomadas baixas',
        safeWindow: 'Janela segura até 15:30',
        stepLabel: 'Passo 2',
        titleLine1: 'Acompanhe os alertas',
        titleLine2: 'e execute o checklist',
        desc: 'Veja quando a previsão exige atenção e siga uma lista objetiva antes da água subir.',
      },
      step3: {
        quickLogLabel: 'Registro rápido',
        protocolBadge: 'Protocolo',
        imgAlt: 'Evidência fotográfica registrada em ponto comercial',
        levelRecorded: 'Nível registrado',
        neighborhoodLabel: 'Bairro',
        statusLabel: 'Status',
        statusValue: 'Estoque preservado',
        savedFooter: 'Protocolo salvo no histórico',
        stepLabel: 'Passo 3',
        titleLine1: 'Documente ocorrências',
        titleLine2: 'com protocolo organizado',
        desc: 'Envie fotos rápidas e mantenha o histórico do estabelecimento pronto para consulta.',
      },
    },
    finalCta: {
      titleLine1: 'Substitua o improviso',
      titleLine2: 'pela prevenção.',
      ctaGuest: 'Cadastrar meu ponto',
      ctaAuth: 'Acessar meu painel',
      footnoteLine1: 'Configure seu ponto em 2 minutos em Belém.',
      footnoteLine2: 'Grátis para começar — dados sob seu controle.',
    },
    footer: {
      ariaLabel: 'Rodapé',
      home: 'Início',
      about: 'Sobre',
      features: 'Recursos',
      howItWorks: 'Como funciona',
      copyright: '© 2026 Maré Alerta. Todos os direitos reservados.',
    },
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    altLocale: 'pt-br',
    altHref: '/',
    currentCode: 'EN',
    altCode: 'PT',
    meta: {
      title: 'Maré Alerta — Tide Forecasting & Flood Prevention in Belém',
      description:
        'The water shifts. Your business stays ready. Tide forecasting, neighborhood risk alerts, and preventive protection in Belém.',
      schemaDescription:
        'Tide forecasting, Guajará Bay monitoring, neighborhood risk alerts, and preventive incident logging for businesses in Belém/PA.',
    },
    nav: {
      ariaLabel: 'Main navigation',
      mobileAriaLabel: 'Mobile navigation',
      openMenuLabel: 'Open navigation menu',
      closeMenuLabel: 'Close navigation menu',
      themeToggleLabel: 'Toggle light and dark theme',
      langSwitchTitle: 'Mudar para Português',
      home: 'Home',
      about: 'About',
      features: 'Features',
      howItWorks: 'How it works',
      signIn: 'Sign in',
      signUp: 'Create account',
      openDashboard: 'Open dashboard',
    },
    hero: {
      imgAlt: 'Belém waterfront overlooking Guajará Bay',
      titleLine1: 'The water shifts.',
      titleLine2: 'Your business prepares.',
      subtitle:
        'Continuous Guajará Bay monitoring, neighborhood-level risk, and practical checklists before high water reaches your storefront.',
      ctaSignUp: 'Create account',
      ctaDashboard: 'Open dashboard',
      ctaFeatures: 'Explore features',
    },
    panorama: {
      bayLabel: 'Guajará Bay',
      bayAlt: 'Boat cruising Guajará Bay beside the Estação das Docas yellow crane in Belém',
      riskLabel: 'Risk by Neighborhood',
      riskAlt: 'Urban drainage canal surrounded by residential towers in Belém',
      alertsLabel: 'Real-Time Alerts',
      alertsAlt: 'Stilt house and riverboats along a tidal creek near Belém',
      districtsLabel: 'Ver-o-Peso & Jurunas',
      districtsAlt: 'Ver-o-Peso market and waterfront businesses lit at dusk in Belém',
    },
    sobre: {
      title: 'Action before the tide rises.',
      subtitle:
        'We monitor Guajará Bay surges and vulnerable areas across Belém to turn tidal data into practical protection for your storefront.',
      cards: {
        telemetry: {
          title: 'Telemetry',
          desc: 'Daily tidal readings and rainfall forecasts along the bay.',
          alt: 'View of Belém waterfront and buildings along the bay',
        },
        prevention: {
          title: 'Prevention',
          desc: 'Ordered actions to elevate stock and safeguard freezers.',
          alt: 'Espaço São José Liberto reflective water courtyard and historic Belém architecture',
        },
        protocol: {
          title: 'Protocol',
          desc: 'Organized photographic records of every flooding event.',
          alt: 'Estação das Docas waterfront walkway in Belém',
        },
      },
      splitLeft: 'Driven by nature',
      splitLeftAlt: 'Amazonian vegetation reflected in calm river waters',
      splitRight: 'Guided by forecast',
      splitRightAlt: 'Ver-o-Peso market illuminated along Guajará Bay at dusk',
    },
    rotina: {
      eyebrow: 'In your daily operations',
      titleLine1: 'Three signals.',
      titleLine2: 'One clear action plan.',
      card1: {
        mapLabel: 'Risk map',
        active: 'Active',
        jurunasStatus: 'Watch',
        verOPesoStatus: 'Stable',
        title: 'Neighborhood risk.',
        desc: 'Your area alert before opening.',
      },
      card2: {
        tideRainLabel: 'Tide & rain',
        highTide: 'High tide',
        title: 'Tide and rain curve.',
        desc: 'Peak tide crossed with daily rain.',
      },
      card3: {
        protocolSavedLabel: 'Saved protocol',
        verified: 'Verified',
        imgAlt: 'Photographic evidence of an incident at a commercial location',
        evidenceAttached: 'Evidence attached',
        confirmedTime: 'Location and time confirmed',
        title: 'Protocol logging.',
        desc: 'Photos and history in one record.',
      },
    },
    comoFunciona: {
      eyebrow: 'Step by step',
      titleLine1: 'How it works in practice.',
      titleLine2: 'From setup to mobile protocol.',
      subtitle:
        'Three simple stages that turn tide forecasts into a daily preventive routine for your business.',
      step1: {
        badge: 'Location setup',
        active: 'Active',
        location: 'Jurunas · Guajará Bay',
        alertLevel: 'Alert threshold',
        protectedItemsLabel: 'Protected assets',
        item1Title: 'Freezers & cold room',
        item1Sub: 'Critical level +35 cm',
        item2Title: 'Grain inventory',
        item2Sub: 'On pallets +60 cm',
        item3Title: 'Counter & register',
        item3Sub: 'Raised outlets +45 cm',
        item4Title: 'Electrical panel',
        item4Status: 'Protected',
        monitoringFooter: '24/7 continuous monitoring',
        stepLabel: 'Step 1',
        titleLine1: 'Register your business',
        titleLine2: 'and mark what to protect',
        desc: 'Select your neighborhood in Belém and list equipment and inventory sensitive to rising water.',
      },
      step2: {
        tideCurveLabel: 'Tide curve',
        warning: 'Warning',
        highTideTime: 'High tide · 16:40',
        rainTideBadge: 'Rain + Tide',
        checklistLabel: 'Preventive checklist',
        check1: 'Elevate inventory pallets',
        check2: 'Check front drainage',
        check3: 'Unplug low outlets',
        safeWindow: 'Safe window until 15:30',
        stepLabel: 'Step 2',
        titleLine1: 'Follow the alerts',
        titleLine2: 'and run your checklist',
        desc: 'See when the forecast requires attention and follow an actionable list before the water rises.',
      },
      step3: {
        quickLogLabel: 'Quick log',
        protocolBadge: 'Protocol',
        imgAlt: 'Photographic evidence recorded at a storefront',
        levelRecorded: 'Recorded level',
        neighborhoodLabel: 'District',
        statusLabel: 'Status',
        statusValue: 'Stock preserved',
        savedFooter: 'Protocol saved to history',
        stepLabel: 'Step 3',
        titleLine1: 'Document incidents',
        titleLine2: 'with a clear protocol',
        desc: 'Upload quick photos and keep your establishment history ready whenever you need it.',
      },
    },
    finalCta: {
      titleLine1: 'Replace guesswork',
      titleLine2: 'with prevention.',
      ctaGuest: 'Register my location',
      ctaAuth: 'Open my dashboard',
      footnoteLine1: 'Set up your location in 2 minutes in Belém.',
      footnoteLine2: 'Free to start — your records stay in your control.',
    },
    footer: {
      ariaLabel: 'Footer',
      home: 'Home',
      about: 'About',
      features: 'Features',
      howItWorks: 'How it works',
      copyright: '© 2026 Maré Alerta. All rights reserved.',
    },
  },
};
