import dotenv from 'dotenv';

dotenv.config();

// Períodos aceitos em ?periodo= e quantos dias cada um analisa.
export const PERIODOS = { semanal: 7, mensal: 30 };

// Produtos que vencem em até N dias entram como "próximos da validade".
export const DIAS_ALERTA_VALIDADE = Number(process.env.DIAS_ALERTA_VALIDADE) || 30;
