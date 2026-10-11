import jwt from 'jsonwebtoken';

// Verifica se a requisição tem um token JWT válido no header Authorization.
// Uso: authMiddleware.verificarToken em qualquer rota que deve ser protegida.
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ erro: 'Formato de token inválido. Use: Bearer <token>' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload; // disponibiliza { id, perfil } nas próximas funções
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
}

// Verifica se o usuário autenticado tem perfil 'adm'.
// Deve ser usado DEPOIS do verificarToken na cadeia de middlewares.
function somenteAdm(req, res, next) {
    if (req.usuario?.perfil !== 'adm') {
        return res.status(403).json({ erro: 'Acesso restrito a administradores' });
    }
    next();
}

export default { verificarToken, somenteAdm };
