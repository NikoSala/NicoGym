// ==========================================
// CARGAS · CONFIGURACIÓN REAL DEL KIT
// ==========================================
//
// KIT:
// - 4 discos de 1,25 kg
// - 4 discos de 1,50 kg
// - 4 discos de 2,00 kg
//
// Cada mancuerna:
// - Los dos lados deben ser idénticos.
//
// Dos mancuernas:
// - Las dos deben tener la misma configuración.
// - Por tanto, se utilizan 4 discos de cada tipo como máximo.
//
// Barra larga:
// 1) Puede utilizar las dos mancuernas montadas.
// 2) Puede llevar discos directamente en sus extremos.
//
// El peso de las barras se considera 0 kg.
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

  /**
   * Genera configuraciones para UNA mancuerna.
   *
   * Cada cantidad representa discos POR LADO.
   *
   * Como tenemos 4 discos de cada tipo:
   * máximo 2 discos por lado.
   *
   * Ejemplo:
   *
   * 1 disco de 1,25 por lado:
   *
   * 1,25 ── MANCUERNA ── 1,25
   *
   * Peso total = 2,50 kg
   */
  configuracionesUnaMancuerna() {
    const resultado = [];

    for (let d125 = 0; d125 <= 2; d125++) {
      for (let d150 = 0; d150 <= 2; d150++) {
        for (let d200 = 0; d200 <= 2; d200++) {
          if (d125 + d150 + d200 === 0) {
            continue;
          }

          const pesoPorLado = d125 * 1.25 + d150 * 1.5 + d200 * 2;

          const pesoTotal = pesoPorLado * 2;

          resultado.push({
            tipo: this.TIPOS.UNA_MANCUERNA,

            peso: pesoTotal,

            pesoPorLado,

            discosPorLado: {
              1.25: d125,
              1.5: d150,
              2: d200,
            },

            discosTotales: {
              1.25: d125 * 2,
              1.5: d150 * 2,
              2: d200 * 2,
            },
          });
        }
      }
    }

    return this._ordenarUnicos(resultado);
  },

  /**
   * Dos mancuernas trabajando simultáneamente.
   *
   * IMPORTANTE:
   *
   * El peso mostrado es POR MANCUERNA.
   *
   * Ejemplo:
   *
   * 5,50 kg por mancuerna
   * 5,50 kg por mancuerna
   *
   * Total movido = 11 kg
   *
   * Como tenemos 4 discos de cada tipo,
   * podemos montar exactamente la misma
   * configuración en ambas mancuernas.
   */
  configuracionesDosMancuernas() {
    return this.configuracionesUnaMancuerna()
      .map((config) => ({
        ...config,

        tipo: this.TIPOS.DOS_MANCUERNAS,

        pesoPorMancuerna: config.peso,

        pesoTotal: config.peso * 2,

        discosTotalesKit: {
          1.25: config.discosTotales[1.25] * 2,
          1.5: config.discosTotales[1.5] * 2,
          2: config.discosTotales[2] * 2,
        },
      }))
      .filter((config) => {
        return (
          config.discosTotalesKit[1.25] <= 4 &&
          config.discosTotalesKit[1.5] <= 4 &&
          config.discosTotalesKit[2] <= 4
        );
      });
  },

  /**
   * Barra larga utilizando las DOS mancuernas.
   *
   * Ejemplo:
   *
   * [mancuerna] ===== BARRA ===== [mancuerna]
   *
   * El peso indicado es el PESO TOTAL.
   */
  configuracionesBarraLargaConMancuernas() {
    return this.configuracionesDosMancuernas().map((config) => ({
      ...config,

      tipo: this.TIPOS.BARRA_LARGA,

      modalidad: "dos_mancuernas_unidas",

      peso: config.pesoTotal,
    }));
  },

  /**
   * Barra larga con discos directamente
   * en sus extremos.
   *
   * Ejemplo:
   *
   * 1,25 ───── BARRA LARGA ───── 1,25
   *
   * Total = 2,50 kg
   *
   * La configuración debe ser simétrica.
   */
  configuracionesBarraLargaDiscosDirectos() {
    const resultado = [];

    for (let d125 = 0; d125 <= 2; d125++) {
      for (let d150 = 0; d150 <= 2; d150++) {
        for (let d200 = 0; d200 <= 2; d200++) {
          if (d125 + d150 + d200 === 0) {
            continue;
          }

          const pesoPorExtremo = d125 * 1.25 + d150 * 1.5 + d200 * 2;

          const pesoTotal = pesoPorExtremo * 2;

          resultado.push({
            tipo: this.TIPOS.BARRA_LARGA,

            modalidad: "discos_directos",

            peso: pesoTotal,

            pesoPorExtremo,

            discosPorExtremo: {
              1.25: d125,
              1.5: d150,
              2: d200,
            },

            discosTotales: {
              1.25: d125 * 2,
              1.5: d150 * 2,
              2: d200 * 2,
            },
          });
        }
      }
    }

    return this._ordenarUnicos(resultado);
  },

  /**
   * Todas las configuraciones disponibles
   * para un tipo de carga.
   */
  obtenerConfiguraciones(tipo) {
    switch (tipo) {
      case this.TIPOS.UNA_MANCUERNA:
        return this.configuracionesUnaMancuerna();

      case this.TIPOS.DOS_MANCUERNAS:
        return this.configuracionesDosMancuernas();

      case this.TIPOS.BARRA_LARGA:
        return this._ordenarUnicos([
          ...this.configuracionesBarraLargaConMancuernas(),
          ...this.configuracionesBarraLargaDiscosDirectos(),
        ]);

      default:
        return [];
    }
  },

  /**
   * Siguiente peso físicamente disponible.
   */
  siguientePeso(pesoActual, tipo) {
    const configuraciones = this.obtenerConfiguraciones(tipo);

    const peso = Number(pesoActual);

    return configuraciones.find((config) => config.peso > peso) || null;
  },

  /**
   * Peso inmediatamente inferior.
   */
  pesoAnterior(pesoActual, tipo) {
    const configuraciones = this.obtenerConfiguraciones(tipo);

    const peso = Number(pesoActual);

    const anteriores = configuraciones.filter((config) => config.peso < peso);

    return anteriores.length ? anteriores[anteriores.length - 1] : null;
  },

  /**
   * Configuración exacta.
   */
  buscar(peso, tipo) {
    const configuraciones = this.obtenerConfiguraciones(tipo);

    const objetivo = Number(peso);

    return (
      configuraciones.find(
        (config) => Math.abs(config.peso - objetivo) < 0.001,
      ) || null
    );
  },

  /**
   * Elimina configuraciones con el mismo peso.
   *
   * Esto es especialmente importante para la barra larga,
   * porque puede existir el mismo peso mediante:
   *
   * - dos mancuernas unidas
   * - discos directamente en los extremos
   *
   * Conservamos ambas configuraciones porque físicamente
   * son diferentes, pero evitamos duplicados exactos.
   */
  _ordenarUnicos(configuraciones) {
    const mapa = new Map();

    configuraciones.forEach((config) => {
      const clave = JSON.stringify(config);

      if (!mapa.has(clave)) {
        mapa.set(clave, config);
      }
    });

    return [...mapa.values()].sort((a, b) => a.peso - b.peso);
  },
};
