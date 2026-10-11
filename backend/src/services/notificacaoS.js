import webPush from 'web-push';
import produtoModel from '../models/produtoM.js';
import usuarioModel from '../models/usuarioM.js';
import env from 'dotenv';
import { gerarAlertas } from './alertaS.js';
webPush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

function salvarInscricao(idUsuario, subscription) {
    if (!inscricoes.has(idUsuario)) {
        inscricoes.set(idUsuario, []);
    }

    const lista = inscricoes.get(idUsuario);

    if (
        !lista.some(
            item =>
                item.endpoint === subscription.endpoint
        )
    ) {
        lista.push(subscription);
    }
}




async function enviarNotificacao(usuario, titulo, mensagem) {

  const produtos = await produtoModel.getProdutos();
  const usuarios = await usuarioModel.getUsuarios();
   titulo = 'Alerta de Estoque';

for (i=0; i<produtos.length; i++){
    if (produtos[i].quantidade <= produtos[i].quantidade_minimo) {
     mensagem = `O produto ${produtos[i].nome} atingiu a quantidade mínima.`;
    
for (j=0; j<usuarios.length; j++){
  if (usuarios[j].subscription) {
    usuario = usuarios[j];
    const subscription = JSON.parse(usuario.subscription);
    const payload = JSON.stringify({ title: titulo, message: mensagem });
    await webPush.sendNotification(subscription, payload);
  }
}
    }
  }
}
    export default { salvarInscricao,enviarNotificacao };