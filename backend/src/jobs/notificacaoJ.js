import crono from 'node-cron';
import notificacaoService from '../services/notificacaoS.js';
  crono.schedule('5 0 * * *', async () => {
      await notificacaoService.iniciarNotificacoes();
  });
