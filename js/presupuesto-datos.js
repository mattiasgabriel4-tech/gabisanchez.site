/* Datos del presupuesto municipal de Profundidad. Montos en millones de pesos corrientes ($ M).
   Para agregar un año nuevo: sumarlo en cada bloque. Las cifras salen de escaneos: ante una duda, revisar el folio. */
window.PRESUPUESTO = {
  anios: [2023, 2024, 2025, 2026, 2027],
  inicial:   { 2024: 360.8, 2025: 867.65, 2026: 1115.05, 2027: 1306.8 },
  final:     { 2025: 1068.499 },
  recaudado: { 2023: 229.730, 2024: 616.328, 2025: 1014.241 },
  gastado:   { 2023: 217.680, 2024: 608.558, 2025: 1059.504 },
  pagado:    { 2023: 211.767, 2024: 599.370, 2025: 1044.552 },
  inflacion: { 2023: 211.4, 2024: 117.8, 2025: 31.5 },
  inflacion2026: { acumSep: 23.6, rem: 30.3 },
  prestamo: { monto: 177.349, amort2025: 25.087, interes2025: 11.489, saldo2025: 152.261 },
  recursos: {
    2024: { copart: 340,  consenso: 8.25, auto: 4.75, propios: 7.8 },
    2025: { copart: 830,  consenso: 12.5, auto: 7.5,  propios: 17.65 },
    2026: { copart: 1050, consenso: 28,   auto: 8.5,  propios: 28.55 },
    2027: { copart: 1200, consenso: 58,   auto: 11.5, propios: 37.3 }
  },
  gastos: {
    2024: { personal: 121,   consumo: 70.1, servicios: 51.1,  transf: 25.1,  credito: 40.3,  repr: 3,  intereses: 0,  amort: 0,  inversion: 50.2 },
    2025: { personal: 318,   consumo: 201,  servicios: 151,   transf: 71,    credito: 40.65, repr: 5,  intereses: 0,  amort: 0,  inversion: 81 },
    2026: { personal: 477.3, consumo: 201,  servicios: 201.7, transf: 101,   credito: 37.05, repr: 9,  intereses: 17, amort: 60, inversion: 11 },
    2027: { personal: 630,   consumo: 201,  servicios: 201,   transf: 151,   credito: 24.8,  repr: 15, intereses: 12, amort: 60, inversion: 12 }
  },
  reprTope: { 2024: 0.2, 2025: 0.4, 2026: 0.7, 2027: 1.0 },
  personal: {
    ejec: {
      2024: { planta: 48.9, temp: 44.5,  sf: 5.5,  extra: 0.1 },
      2025: { planta: 135,  temp: 120,   sf: 16,   extra: 1 },
      2026: { planta: 187,  temp: 188,   sf: 26,   extra: 9 },
      2027: { planta: 240,  temp: 260,   sf: 40,   extra: 5 }
    },
    hcd: {
      2024: { planta: 20.4, sf: 1.6 },
      2025: { planta: 44,   sf: 2 },
      2026: { planta: 63.1, sf: 4.2 },
      2027: { planta: 80,   sf: 5 }
    },
    ejecutado2025: { planta: 134.924, temp: 141.148, sf: 22.543, hcdPlanta: 46.608, hcdSf: 3.204 },
    pagosDic2025: { planta: 12.334, temp: 13.164, hcd: 4.156 }
  },
  cargos: {
    politicos: ['Intendente', 'Secretario de Gobierno', 'Secretario Tesorero', 'Secretario de Desarrollo Social', 'Secretario de Deporte y Juventud', 'Secretario de Desarrollo Local y Turismo'],
    planta: [ { cat: 21, n: 1 }, { cat: 19, n: 5 }, { cat: 18, n: 4 }, { cat: 17, n: 1 }, { cat: 16, n: 2 }, { cat: 12, n: 10 } ],
    hcd: [ { n: 'Presidente del Concejo', v: 1 }, { n: 'Concejales', v: 4 }, { n: 'Secretario del HCD', v: 1 } ]
  },
  hechos: [
    { tag: 'calc', t: 'Un préstamo explica casi todo el aumento del presupuesto 2025',
      r: 'De los +$200,9 M que se sumaron durante 2025, $177,3 M son el préstamo del Banco Macro.',
      d: 'El presupuesto 2025 nació en $867,65 M (Ordenanza 13/2024) y terminó autorizado en $1.068,5 M. La diferencia es de $200,85 M: $177,35 M corresponden a "Ptmo. Banco Macro p/ retro" y solo unos $23,5 M a mayores recursos corrientes. El inventario 2025 registra una retroexcavadora Case 580N por $177.348.571, que coincide con el préstamo (todo indica que "p/ retro" es "para retroexcavadora"). En 2025 se amortizaron $25,09 M y quedó una deuda de $152,26 M al 31/12/2025.',
      f: 'Rendición 2025: Estado de realización de recursos (folio 43), Balance financiero (folio 25), Balance general (folio 23), Inventario patrimonial (folio 16).' },
    { tag: 'calc', t: 'El préstamo se paga con la Compensación del Consenso Fiscal, y no alcanza',
      r: '2027: servicio de la deuda $72 M contra $58 M de Compensación Consenso Fiscal.',
      d: 'En 2025 la cuenta de Compensación Consenso Fiscal recibió $24,44 M y pagó $36,58 M (amortización $25,09 M + intereses $11,49 M): cerró en -$4,48 M. En los presupuestos: 2026 prevé $28 M de ingreso contra $77 M de servicio de deuda (60 + 17); 2027 prevé $58 M contra $72 M (60 + 12). La diferencia sale de otros recursos, principalmente la coparticipación.',
      f: 'Rendición 2025: Evolución de fondos especiales (folio 04). Ordenanzas 2026 y proyecto 2027.' },
    { tag: 'dato', t: 'Las obras públicas caen de $50 M a $7 M',
      r: 'Trabajos públicos: $40 M (2024), $50 M (2025), $7 M (2026) y $7 M (2027).',
      d: 'En 2025 las obras se presupuestaron en $50 M, pero la partida terminó autorizada en $8,8 M y se ejecutaron $6,74 M. Para 2026 y 2027 se vuelven a presupuestar $7 M. Ninguna ordenanza lista qué obras serían: el Art. 3 autoriza al Ejecutivo a ejecutarlas "según las prioridades que así lo determinen".',
      f: 'Ordenanzas 2024 a 2026, proyecto 2027. Rendición 2025: Balance de tesorería (folio 41) y Estado de ejecución del presupuesto de gastos.' },
    { tag: 'calc', t: 'Gastos de representación: el tope mensual y la partida anual no coinciden en 2027',
      r: 'Art. 8 permite hasta $1 M por mes ($12 M al año); la partida 2027 es de $15 M.',
      d: 'Tope mensual del Art. 8: $0,2 M (2024), $0,4 M (2025), $0,7 M (2026) y $1 M (2027). Partidas anuales: $3 M, $5 M, $9 M y $15 M. En 2025 se ejecutaron $4,8 M, justo 12 veces el tope. En 2027 la partida supera por $3 M lo que el Art. 8 permitiría gastar en el año; el documento no explica la diferencia.',
      f: 'Ordenanzas 2024 a 2026 (Art. 8), proyecto 2027, Rendición 2025 (ejecución del presupuesto de gastos).' },
    { tag: 'calc', t: 'El personal temporario ya pesa tanto como la planta permanente',
      r: '2027: temporarios $260 M contra $240 M de planta permanente (Ejecutivo).',
      d: 'Presupuesto inicial, Ejecutivo: 2024 planta $48,9 M / temporario $44,5 M; 2025 $135 M / $120 M; 2026 $187 M / $188 M; 2027 $240 M / $260 M. En 2025 lo ejecutado fue $134,9 M en planta y $141,1 M en temporarios. La ordenanza detalla los cargos de planta y políticos (29) pero no informa cuántos temporarios hay.',
      f: 'Ordenanzas 2024 a 2026, proyecto 2027, Rendición 2025.' },
    { tag: 'calc', t: 'El "ahorro" de 2027 es casi todo pago de deuda',
      r: 'El esquema ahorro-inversión muestra $72 M, pero $60 M son amortización del préstamo.',
      d: 'El Balance financiero preventivo 2027 muestra un ahorro de $72 M igual a la "inversión" de $72 M. En el Ejecutivo, el gasto de capital es $70 M: $60 M de amortización de deuda y $10 M de inversión física. El Concejo suma $2 M de bienes de capital.',
      f: 'Proyecto de Ordenanza Presupuesto 2027: Balance financiero preventivo y Clasificación económica.' },
    { tag: 'calc', t: 'Recursos propios: del 2% al 3% del presupuesto',
      r: 'Pasan de $7,8 M (2024) a $37,3 M (2027), pero siguen siendo menos del 3% del total.',
      d: 'Recursos propios previstos: $7,8 M (2,2%), $17,65 M (2,0%), $28,55 M (2,6%) y $37,3 M (2,9%). Para 2027 se proyectan +30,6% frente a 2026, contra +14,3% de la coparticipación. La venta de agua pasa de $1,5 M (2025) a $7 M (2027).',
      f: 'Ordenanzas 2024 a 2026, proyecto 2027 (Cálculo de recursos).' },
    { tag: 'dato', t: '$400 M de bienes y servicios sin detalle',
      r: 'En 2027 se presupuestan $200 M en bienes de consumo y $200 M en servicios, solo como totales.',
      d: 'Las planillas tienen los renglones por rubro (combustibles, repuestos, electricidad, honorarios, etc.) pero están en blanco: solo figura el total. Pasa igual en todos los años. Además, los Art. 6 y 9 permiten al Ejecutivo reestructurar partidas y usar créditos de transferencias mediante resolución.',
      f: 'Ordenanzas 2024 a 2026, proyecto 2027 (Clasificación por objeto).' },
    { tag: 'calc', t: 'Concejo Deliberante: 6 cargos listados y una partida de planta permanente',
      r: 'La planilla lista 6 cargos; la partida de planta permanente 2027 es de $80 M.',
      d: 'La planilla de cargos del HCD lista presidente, 4 concejales y secretario (6). La partida "Planta permanente" del HCD es de $80 M en 2027: unos $13,3 M por cargo al año, cerca de $1 M por mes con 13 sueldos. En diciembre 2025 el HCD liquidó unos $4,16 M por mes (unos $0,69 M por cargo). La planilla no lista otro personal, así que no se puede saber si hay empleados además de esos 6. Se aplica el mismo criterio que al Ejecutivo.',
      f: 'Ordenanzas (detalle de cargos individuales), Rendición 2025: Deudas pendientes de pago (folio 28).' },
    { tag: 'calc', t: 'El presupuesto inicial queda corto y se corrige durante el año',
      r: '2024: de $360,8 M a $616,3 M recaudados (+70,8%). 2025: de $867,65 M a $1.068,5 M (+23,2%).',
      d: 'El presupuesto 2026 nació solo +4,4% por encima del autorizado final de 2025, y el 2027 es +17,2% sobre el inicial 2026. La inflación fue 117,8% en 2024 y 31,5% en 2025; en 2026 acumula 23,6% hasta septiembre y se estima 30,3% para el año. Con esos números, lo presupuestado crece menos que los precios y suele corregirse durante el año (Art. 6 y resoluciones de modificación). Es una referencia: la inflación dic/dic no es el índice exacto para comparar presupuestos.',
      f: 'Ordenanzas, balances 2023, 2024 y rendición 2025. Inflación: INDEC; expectativa 2026: REM del BCRA.' }
  ]
};
