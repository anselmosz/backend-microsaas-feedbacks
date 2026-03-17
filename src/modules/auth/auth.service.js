import bcrypt from 'bcrypt';
import authRepository from "./auth.repository.js"
import usersRepository from "../users/users.repository.js";
import { gerarToken } from "../../services/token.service.js";
import { AppError } from "../../utils/AppError.js"

export default {
  criarConta: async(companyData, userData) => {
    const validarEmail = await usersRepository.buscarEmailDoUsuario(userData.email);
    
    if (validarEmail) throw new AppError("Já existe usuário com este email", 400);
    
    const company_payload = {
      name: companyData.name,
      plan: companyData.plan
    }

    if (!companyData.name || !companyData.plan || !userData.name || !userData.email || !userData.senha) throw new AppError("Dados obrigatórios faltando", 400);
    
    const [empresa] = await authRepository.criarEmpresa(company_payload);
    
    const SALT_ROUNDS = 10; // número de rounds para o bcrypt - pode ser alterado conforme a necessidade
    
    // gera o hash da senha utilizando bcrypt e o número de rounds definido
    const senhaHash = await bcrypt.hash(userData.senha, SALT_ROUNDS);

    const user_payload = {
      account_id: empresa,
      name: userData.name,
      email: userData.email,
      password_hash: senhaHash,
      role: "admin"
    }

    const [usuario] = await usersRepository.criarUsuario(user_payload);

    return {
      empresa: {
        account_id: empresa,
        ...company_payload
      },
      usuario: {
        user_id: usuario, 
        ...user_payload
      }
    }
  },

  login: async(data) => {
    if (!data.email || !data.senha) throw new AppError("Informe email e senha para realizar login", 400);
    
    const usuario = await usersRepository.validarCredenciais(data.email);
    if (!usuario) throw new AppError("E-mail ou senha incorretos", 403);
    
    if (usuario.locked_until < Date.now) {
      await usersRepository.removerBloqueio(usuario.user_id, usuario.account_id);
    }
    
    const senhaValida = await bcrypt.compare(data.senha, usuario.password_hash);

    if (usuario.user_status == "inactive") throw new AppError("Usuário inativo", 403);

    if (usuario.locked_until && new Date() < new Date(usuario.locked_until)) throw new AppError("Usuário temporariamente bloqueado. Tente novamente mais tarde.", 401);

    if(!senhaValida) {
      const tentativas = usuario.login_attempts +1;
      await usersRepository.incrementaTentativasDeLogin(usuario.user_id, usuario.account_id, tentativas);

      if (tentativas >= 3) {
        const lockDate = new Date(); 
        
        lockDate.setMinutes(lockDate.getMinutes() + 2);
        
        await usersRepository.bloquearAcessoPorUmTempo(usuario.user_id, usuario.account_id, lockDate);
        throw new AppError("Usuário bloqueado por múltiplas tentativas inválidas.", 403);
      }
      
      throw new AppError("E-mail ou senha incorretos", 403);
    }

    await usersRepository.resetarTentativasDeLogin(usuario.user_id, usuario.account_id);

    delete usuario.password_hash;

    const lastLogin = new Date();

    lastLogin.setDate(lastLogin.getDate());

    const payload = {
      userId: usuario.user_id,
      accountId: usuario.account_id,
      role: usuario.role
    };
    
    const token = gerarToken(payload);
    
    await usersRepository.registrarUltimoLogin(usuario.user_id, usuario.account_id, lastLogin);

    return token;
  }
}