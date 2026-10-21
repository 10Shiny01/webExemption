import { request } from './api.js';

// PDFs disponíveis somente para administradores.
async function baixar(caminho, periodo, nomePadrao) {
  const { arquivo, nome } = await request(caminho, { params: { periodo }, blob: true });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome ?? nomePadrao;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default {
  relatorioEstoque: (periodo) => baixar('/documento/api/system/', periodo, `relatorio-estoque-${periodo}.pdf`),
  balanco: (periodo) => baixar('/documento/api/system/balanco', periodo, `balanco-geral-${periodo}.pdf`),
};
