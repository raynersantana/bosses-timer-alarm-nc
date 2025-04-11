import { setTimeout } from 'node:timers';
import { DiscordRequest } from './utils.js';
import { carregarEventos, eventosPorCanal } from './eventos.js';
import { DateTime } from 'luxon';

function extrairEventos(texto) {
  const linhas = texto.split('\n');
  const eventos = [];

  for (const linha of linhas) {
    const partes = linha.split(' - ');
    if (partes.length !== 3) continue;

    const [nome, data, hora] = partes.map(p => p.trim());

    // Validações básicas
    if (!nome || !data || !hora) continue;

    eventos.push({ nome, data, hora });
  }

  return eventos;
}

function agendarEventos(channelId, eventos) {
  const agora = DateTime.now().setZone('America/Sao_Paulo');

  eventos.forEach(evento => {
    const [dia, mes] = evento.data.split('/');
    const [hora, minuto] = evento.hora.split(':');

    const dataEvento = DateTime.fromObject({
      year: agora.year,
      month: Number(mes),
      day: Number(dia),
      hour: Number(hora),
      minute: Number(minuto),
    }, { zone: 'America/Sao_Paulo' });

    const diffMs = dataEvento.toMillis() - agora.toMillis();
    const avisoMs = diffMs - 15 * 60 * 1000;

    if (avisoMs > 0) {
      setTimeout(() => {
        DiscordRequest(`/channels/${channelId}/messages`, {
          method: 'POST',
          body: {
            content: `@everyone Boss **${evento.nome}** começa em 15 minutos!`,
          },
        });

        // Remover evento da lista do canal
        if (eventosPorCanal[channelId]) {
          eventosPorCanal[channelId] = eventosPorCanal[channelId].filter(e => {
            return !(e.nome === evento.nome && e.data === evento.data && e.hora === evento.hora);
          });
        }

      }, avisoMs);
    }
  });
}


export { extrairEventos, agendarEventos };
