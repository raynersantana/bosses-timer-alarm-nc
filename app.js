import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { extrairEventos, agendarEventos } from './utils_bot.js';
import { salvarEventos, carregarEventos, limparEventos } from './eventos.js';

// App config
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const INTERACAO_USUARIO = {}; // { userId: true }

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { id, type, data, member } = req.body;
  const userId = member?.user?.id;

  // Verifica se é só um PING do Discord
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'test') {
      console.log("test");

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }

    if (name === 'limpar') {
      const userId = member?.user?.id;
    
      limparEventos(userId);
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🧹 Sua lista de bosses foi limpa!`,
        },
      });
    }

    if (name === 'configurar_bosses_nc') {

      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: 'form_bosses',
          title: 'Configurar Bosses',
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'mensagem_bosses',
                  style: 2,
                  label: 'Cole aqui a mensagem dos bosses',
                  placeholder: 'Ex: Stomid às 18h00...\nMelville às 18h50...',
                  required: true,
                }
              ]
            }
          ]
        }
      });      
    }

    if (name === 'consultar_bosses') {
      const eventos = carregarEventos(userId);
    
      if (!eventos || eventos.length === 0) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Nenhum horário de boss encontrado.',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
    
      const lista = eventos
        .map(e => `${e.nome} - ${e.data} - ${e.hora}`)
        .join('\n');
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🗓️ Bosses salvos:\n${lista}`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  if (type === InteractionType.MODAL_SUBMIT && data.custom_id === 'form_bosses') {
    const campoTexto = data.components?.[0]?.components?.[0]?.value;
  
    console.log("Texto colado: " + campoTexto);

    if (!campoTexto) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Nenhum texto encontrado no formulário.',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
  
    const eventos = extrairEventos(campoTexto);
    if (eventos.length === 0) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Nenhum boss encontrado na mensagem.',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
  
    salvarEventos(userId, eventos);
    agendarEventos(userId, eventos);
  
    const lista = eventos.map(e => `${e.nome} - ${e.data} - ${e.hora}`).join('\n');
  
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🗓️ Bosses detectados e agendados:\n${lista}`,
      },
    });
  }

  // Quando o usuário manda mensagem após o comando
  if (type === InteractionType.MESSAGE_COMPONENT || type === InteractionType.MODAL_SUBMIT || type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
    return res.send({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
  }

  // Se mandou uma mensagem normal após o comando
  if (type === InteractionType.MESSAGE_CREATE && INTERACAO_USUARIO[userId]) {
    const texto = data.content;
    if (!texto) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '❌ Nenhum texto encontrado.' },
      });
    }

    const eventos = extrairEventos(texto);
    if (eventos.length === 0) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '❌ Nenhum boss encontrado.' },
      });
    }

    salvarEventos(userId, eventos);
    INTERACAO_USUARIO[userId] = false;

    const lista = eventos.map(e => `${e.nome} - ${e.data} - ${e.hora}`).join('\n');
    
    console.log("Iniciar agendamento de eventos!");
    agendarEventos(userId, eventos);

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🗓️ Bosses detectados e agendados:\n${lista}`,
      },
    });
  }

  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('✅ Bot HTTP escutando na porta', PORT);
});
