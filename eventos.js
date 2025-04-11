const eventosPorUsuario = {};

/**
 * Salva eventos para um usuário específico
 */
function salvarEventos(userId, eventos) {
    if (!eventosPorUsuario[userId]) {
      eventosPorUsuario[userId] = [];
    }
  
    eventosPorUsuario[userId].push(...eventos);
  }  

/**
 * Carrega os eventos salvos de um usuário
 */
function carregarEventos(userId) {
  return eventosPorUsuario[userId] || [];
}

/**
 * Limpa todos os eventos salvos de um usuário
 */
function limparEventos(userId) {
  delete eventosPorUsuario[userId];
}

export { salvarEventos, carregarEventos, limparEventos, eventosPorUsuario };