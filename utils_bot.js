import { setTimeout } from 'node:timers';
import { DiscordRequest } from './utils.js';
import { carregarEventos, eventosPorUsuario } from './eventos.js';

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


function agendarEventos(userId, eventos) {
  const canalId = process.env.CHANNEL_ID;
  const agora = new Date();
  console.log("data de hoje: " + agora);

  eventos.forEach(evento => {
    console.log("Objeto eventos: " + JSON.stringify(evento))
    const [dia, mes] = evento.data.split('/');
    const [hora, minuto] = evento.hora.split(':');
    const dataEvento = new Date(agora.getFullYear(), mes - 1, dia, hora, minuto);

    const diffMs = dataEvento - agora;
    const avisoMs = diffMs - 15 * 60 * 1000; // 15 minutos antes
    console.log("diffMs: " + diffMs);
    console.log("Timeout setado para alertar: " + avisoMs);

    if (avisoMs > 0) {
      setTimeout(() => {
        DiscordRequest(`/channels/${canalId}/messages`, {
          method: 'POST',
          body: {
            content: `@everyone Boss **${evento.nome}** começa em 15 minutos!`,
          },
        });

        // Remove o evento da lista
        if (eventosPorUsuario[userId]) {
          eventosPorUsuario[userId] = eventosPorUsuario[userId].filter(e => {
            return !(e.nome === evento.nome && e.data === evento.data && e.hora === evento.hora);
          });
        }

      }, avisoMs);
    }else {
      console.log("Ainda não está na hora. " + dataEvento);
    }
  });
}

export { extrairEventos, agendarEventos };
