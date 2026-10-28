import express from 'express';
import DB from './src/config/database.js';
import produtoRoute from './src/routes/produtoR.js';
import categoriaRoute from './src/routes/categoriaR.js';
import entradaRoute from './src/routes/entradaR.js';
import saidaRoute from './src/routes/saidaR.js';
import usuarioRoute from './src/routes/usuarioR.js';
import receitaRoute from './src/routes/receitaR.js';
import ingredienteRoute from './src/routes/ingredienteR.js';
import documentoRoute from './src/routes/documentoR.js';
import balancoRoute from './src/routes/balancoR.js';
import helmet from 'helmet';
import cors from 'cors';




try {
    await DB.connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
} catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
}

const app = express();
const port = 3000;
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONT_URL })); // só o endereço do seu front
app.use(express.json({ limit: '100kb' }));


app.use(express.json());
app.use("/entrada", entradaRoute);
app.use("/saida", saidaRoute);
app.use("/produto", produtoRoute);
app.use("/categoria", categoriaRoute);
app.use("/usuario", usuarioRoute);
app.use("/receita", receitaRoute);
app.use("/ingrediente", ingredienteRoute);
app.use("/documento", documentoRoute);
app.use("/balanco", balancoRoute);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
