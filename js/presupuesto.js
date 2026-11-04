(function () {
  var D = window.PRESUPUESTO;
  if (!D) return;
  function fm(v) {
    return "$ " + v.toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " M";
  }
  function barras(id, arr) {
    var el = document.getElementById(id);
    if (!el) return;
    var max = Math.max.apply(null, arr.map(function (x) { return x.v; }));
    el.innerHTML = arr.map(function (x) {
      return '<div class="pres-fila"><div class="pres-fila-top"><span>' + x.n +
        "</span><strong>" + fm(x.v) + '</strong></div><div class="pres-barra"><span style="width:' +
        (x.v / max * 100) + '%"></span></div></div>';
    }).join("");
  }
  barras("graf-ingresos", D.ingresos2027);
  barras("graf-gastos", D.gastos2027);
  var t = document.getElementById("tabla-anios");
  if (t) {
    var h = "<tr><th>Concepto</th>" + D.anios.map(function (a) { return "<th>" + a + "</th>"; }).join("") + "</tr>";
    var f = D.filas.map(function (r) {
      return "<tr><td>" + r.n + "</td>" + D.anios.map(function (a) {
        return r.v[a] != null ? "<td>" + fm(r.v[a]) + "</td>" : '<td><span class="pend">pendiente</span></td>';
      }).join("") + "</tr>";
    }).join("");
    t.innerHTML = h + f;
  }
})();
