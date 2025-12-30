/**
 * Utilidades para cálculo de Kardex
 * Incluye funciones para calcular saldos y costos promedio ponderados
 */

/**
 * Calcula los saldos acumulativos y costo promedio ponderado
 * @param {Array} movimientos - Array de movimientos ordenados por fecha
 * @returns {Array} Movimientos con saldos calculados
 */
const calcularSaldos = (movimientos) => {
  if (!movimientos || movimientos.length === 0) {
    return [];
  }

  let saldoAnterior = 0;
  let valorAnterior = 0;
  let costoPonderado = 0;

  return movimientos.map((mov, idx) => {
    // Cantidades
    const cantidadEntrada = parseFloat(mov.entrada_cantidad) || 0;
    const cantidadSalida = parseFloat(mov.salida_cantidad) || 0;

    // Costos unitarios
    const costoEntrada = parseFloat(mov.entrada_costo) || 0;
    const costoSalida = parseFloat(mov.salida_costo) || 0;

    // Valores
    const valorEntrada = cantidadEntrada * costoEntrada;
    const valorSalida = cantidadSalida * costoSalida;

    // Calcular nuevo saldo y costo promedio
    let nuevoSaldo = saldoAnterior + cantidadEntrada - cantidadSalida;
    let nuevoValor = valorAnterior + valorEntrada - valorSalida;
    let nuevoCostoPonderado = 0;

    // Si hay entrada, actualizar costo ponderado
    if (cantidadEntrada > 0) {
      nuevoCostoPonderado = (valorAnterior + valorEntrada) / (saldoAnterior + cantidadEntrada);
      costoPonderado = nuevoCostoPonderado;
    } else if (nuevoSaldo > 0) {
      // Mantener el costo ponderado anterior
      nuevoCostoPonderado = costoPonderado;
    } else {
      // Si el saldo llega a 0, resetear costo
      nuevoCostoPonderado = 0;
      costoPonderado = 0;
    }

    // Actualizar para la siguiente iteración
    saldoAnterior = nuevoSaldo;
    valorAnterior = nuevoValor;

    return {
      ...mov,
      entrada_cantidad: cantidadEntrada,
      entrada_costo: costoEntrada,
      entrada_valor: valorEntrada,
      salida_cantidad: cantidadSalida,
      salida_costo: costoSalida,
      salida_valor: valorSalida,
      saldo_cantidad: nuevoSaldo < 0 ? 0 : nuevoSaldo,
      saldo_costo: nuevoCostoPonderado,
      saldo_valor: nuevoValor < 0 ? 0 : nuevoValor
    };
  });
};

/**
 * Calcula totales del kardex
 * @param {Array} movimientos - Array de movimientos con saldos
 * @returns {Object} Objeto con totales
 */
const calcularTotales = (movimientos) => {
  if (!movimientos || movimientos.length === 0) {
    return {
      entrada_cantidad: 0,
      entrada_valor: 0,
      salida_cantidad: 0,
      salida_valor: 0,
      saldo_cantidad: 0,
      saldo_valor: 0
    };
  }

  const totales = movimientos.reduce(
    (acc, mov) => ({
      entrada_cantidad: acc.entrada_cantidad + (mov.entrada_cantidad || 0),
      entrada_valor: acc.entrada_valor + (mov.entrada_valor || 0),
      salida_cantidad: acc.salida_cantidad + (mov.salida_cantidad || 0),
      salida_valor: acc.salida_valor + (mov.salida_valor || 0),
    }),
    {
      entrada_cantidad: 0,
      entrada_valor: 0,
      salida_cantidad: 0,
      salida_valor: 0
    }
  );

  // Saldo final es el último movimiento
  const ultimoMovimiento = movimientos[movimientos.length - 1];
  totales.saldo_cantidad = ultimoMovimiento.saldo_cantidad || 0;
  totales.saldo_valor = ultimoMovimiento.saldo_valor || 0;

  return totales;
};

/**
 * Formatea un número con decimales
 * @param {number} valor - Valor a formatear
 * @param {number} decimales - Número de decimales
 * @returns {number} Valor formateado
 */
const formatearValor = (valor, decimales = 2) => {
  const num = parseFloat(valor) || 0;
  return parseFloat(num.toFixed(decimales));
};

module.exports = {
  calcularSaldos,
  calcularTotales,
  formatearValor
};
