// ==========================================
// CARGAS · CONFIGURACIÓN REAL DEL KIT
// ==========================================
//
// KIT:
// - 4 discos de 1,25 kg
// - 4 discos de 1,50 kg
// - 4 discos de 2,00 kg
//
// Una mancuerna:
// - Puede usar hasta 2 discos de cada tipo
//   por lado.
// - Los dos lados deben ser idénticos.
//
// Dos mancuernas:
// - Las dos deben tener exactamente la misma
//   configuración.
// - Por tanto, como hay 4 discos de cada tipo,
//   cada mancuerna puede usar como máximo
//   1 disco de cada tipo por lado.
//
// Barra larga:
// - Utiliza la misma tabla de configuración que
//   las dos mancuernas.
// - Se considera que los dos extremos tienen
//   la misma carga.
// - El peso de la barra se considera 0 kg.
//
// ==========================================

const WEIGHTS = {
  DISCOS: [1.25, 1.5, 2],

  CANTIDAD_POR_DISCO: {
    1.25: 4,
    1.5: 4,
    2: 4,
  },

  TIPOS: {
    UNA_MANCUERNA: "una_mancuerna",
    DOS_MANCUERNAS: "dos_mancuernas",
    BARRA_LARGA: "barra_larga",
  },

  // ==========================================
  // UNA MANCUERNA
  // ==========================================
  //
  // Podemos utilizar hasta 2 discos de cada
  // tipo EN CADA LADO.
  //
  // Como tenemos 4 discos de cada tipo:
  //
  // 2 discos × 2 lados = 4 discos disponibles.
  //
  // Ejemplo 7 kg:
  //
  // lado izquierdo: 1,50 + 2
  // lado derecho:   1,50 + 2
  //
  // Total = 7 kg
  //
  configuracionesUnaMancuerna() {
    const resultado = [];

    for (let d125 = 0; d125 <= 2; d125++) {
      for (let d150 = 0; d150 <= 2; d150++) {
        for (let d200 = 0; d200 <= 2; d200++) {
          if (d125 + d150 + d200 === 0) {
            continue;
          }

          const pesoPorLado =
            d125 * 1.25 +
            d150 * 1.5 +
            d200 * 2;

          const pesoTotal = pesoPorLado * 2;

          resultado.push({
            tipo: this.TIPOS.UNA_MANCUERNA,

            // Peso total de la mancuerna.
            peso: pesoTotal,

            // Peso de un solo lado.
            pesoPorLado,

            // Discos en cada lado.
            discosPorLado: {
              1.25: d125,
              1.5: d150,
              2: d200,
            },

            // Discos utilizados en toda la mancuerna.
            discosTotales: {
              1.25: d125 * 2,
              1.5: d150 * 2,
              2: d200 * 2,
            },
          });
        }
      }
    }

    return this._ordenarPorPeso(resultado);
  },

  // ==========================================
  // DOS MANCUERNAS
  // ==========================================
  //
  // Las dos mancuernas deben ser idénticas.
  //
  // Tenemos 4 discos de cada tipo en total.
  //
  // Por tanto:
  //
  // 1 disco por lado × 2 lados × 2 mancuernas
  // = 4 discos de cada tipo.
  //
  // Esto limita cada mancuerna a:
  //
  // 2,5 / 3 / 4 / 5,5 / 6,5 / 7 / 9,5 kg
  //
  configuracionesDosMancuernas() {
    const resultado = [];

    for (let d125 = 0; d125 <= 1; d125++) {
      for (let d150 = 0; d150 <= 1; d150++) {
        for (let d200 = 0; d200 <= 1; d200++) {
          if (d125 + d150 + d200 === 0) {
            continue;
          }

          const pesoPorLado =
            d125 * 1.25 +
            d150 * 1.5 +
            d200 * 2;

          const pesoPorMancuerna = pesoPorLado * 2;
          const pesoTotal = pesoPorMancuerna * 2;

          resultado.push({
            tipo: this.TIPOS.DOS_MANCUERNAS,

            // Peso de UNA mancuerna.
            peso: pesoPorMancuerna,

            pesoPorLado,

            pesoPorMancuerna,

            // Peso total de las dos.
            pesoTotal,

            // Discos en cada lado de cada mancuerna.
            discosPorLado: {
              1.25: d125,
              1.5: d150,
              2: d200,
            },

            // Discos utilizados en UNA mancuerna.
            discosTotales: {
              1.25: d125 * 2,
              1.5: d150 * 2,
              2: d200 * 2,
            },

            // Discos utilizados en TODO el kit.
            discosTotalesKit: {
              1.25: d125 * 4,
              1.5: d150 * 4,
              2: d200 * 4,
            },
          });
        }
      }
    }

    return this._ordenarPorPeso(resultado);
  },

  // ==========================================
  // BARRA LARGA
  // ==========================================
  //
  // Para simplificar y mantener exactamente
  // la misma lógica que las dos mancuernas,
  // la barra utiliza la misma configuración
  // de discos que una pareja de mancuernas.
  //
  // El peso de la barra se ignora.
  //
  // Por tanto:
  //
  // 2,5 / 3 / 4 / 5,5 / 6,5 / 7 / 9,5 kg
  // por extremo.
  //
  // Peso total de discos:
  //
  // 5 / 6 / 8 / 11 / 13 / 14 / 19 kg
  //
  configuracionesBarraLarga() {
    return this.configuracionesDosMancuernas().map((config) => ({
      ...config,

      tipo: this.TIPOS.BARRA_LARGA,

      modalidad: "dos_extremos",

      // Peso por extremo.
      pesoPorExtremo: config.peso,

      // Peso total de discos de la barra.
      pesoTotal: config.pesoTotal,

      // La barra no añade peso.
      pesoBarra: 0,
    }));
  },

  // ==========================================
  // TODAS LAS CONFIGURACIONES DISPONIBLES
  // ==========================================

  obtenerConfiguraciones(tipo) {
    switch (tipo) {
      case this.TIPOS.UNA_MANCUERNA:
        return this.configuracionesUnaMancuerna();

      case this.TIPOS.DOS_MANCUERNAS:
        return this.configuracionesDosMancuernas();

      case this.TIPOS.BARRA_LARGA:
        return this.configuracionesBarraLarga();

      default:
        return [];
    }
  },

  // ==========================================
  // SIGUIENTE PESO
  // ==========================================

  siguientePeso(pesoActual, tipo) {
    const configuraciones = this.obtenerConfiguraciones(tipo);
    const peso = Number(pesoActual);

    return (
      configuraciones.find((config) => config.peso > peso) ||
      null
    );
  },

  // ==========================================
  // BUSCAR CONFIGURACIÓN EXACTA
  // ==========================================

  buscar(peso, tipo) {
    const configuraciones = this.obtenerConfiguraciones(tipo);
    const objetivo = Number(peso);

    return (
      configuraciones.find(
        (config) =>
          Math.abs(Number(config.peso) - objetivo) < 0.001,
      ) || null
    );
  },

  // ==========================================
  // ORDENAR
  // ==========================================

  _ordenarPorPeso(configuraciones) {
    return [...configuraciones].sort(
      (a, b) => Number(a.peso) - Number(b.peso),
    );
  },
};
