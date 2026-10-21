import { request } from './api.js';

// periodo: 'semanal' | 'mensal'. A chamada aciona a IA e pode demorar.
export default {
  gerar: (periodo) => request('/balanco/api/system/', { params: { periodo } }),
};
