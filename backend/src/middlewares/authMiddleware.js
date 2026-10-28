import jwt from 'jsonwebtoken';

const tokensRevogados = new Set();
export function revogarToken(token) {
    tokensRevogados.add(token);
}

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ erro: 'Formato de token inválido. Use: Bearer <token>' });
    }
    if (tokensRevogados.has(token)) {
    return res.status(401).json({ erro: 'Sessão encerrada' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload; // disponibiliza { id, perfil } nas próximas funções
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
}

function somenteAdm(req, res, next) {
    if (req.usuario?.perfil !== 'adm') {
        return res.status(403).json({ erro: 'Acesso restrito a administradores' });
    }
    next();
}

export default { verificarToken, somenteAdm };
