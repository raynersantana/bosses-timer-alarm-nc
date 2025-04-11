const eventosPorCanal = {};

/**
 * Salva eventos para um usuário específico
 */
function salvarEventos(channelId, eventos) {
  if (!eventosPorCanal[channelId]) {
    eventosPorCanal[channelId] = [];
  }

  eventosPorCanal[channelId].push(...eventos);
}

/**
 * Carrega os eventos salvos de um usuário
 */
function carregarEventos(channelId) {
  return eventosPorCanal[channelId] || [];
}

/**
 * Limpa todos os eventos salvos de um usuário
 */
function limparEventos(channelId) {
  delete eventosPorCanal[channelId];
}

export { salvarEventos, carregarEventos, limparEventos, eventosPorCanal };