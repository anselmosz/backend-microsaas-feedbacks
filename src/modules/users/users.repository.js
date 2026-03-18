import { database } from "../../config/database.js";

export default {
  criarUsuario: (data, trx = null) => {
    const query = trx || database;
    return query("users").insert(data);
  },
  
  validarCredenciais: (email) => {
    return database.select('email', 'password_hash', 'user_id', 'account_id', 'role', 'login_attempts', 'locked_until', 'must_change_password').from("users").where({email: email}).first();
  },

  registrarUltimoLogin: (userId, accountId, lastLoginAt) => {
    return database("users").update({last_login_at: lastLoginAt}).where({user_id: userId, account_id: accountId});
  },

  incrementaTentativasDeLogin: (userId, accountId, tentativas) => {
    return database("users").update({login_attempts: tentativas}).where({user_id: userId, account_id: accountId});
  },

  resetarTentativasDeLogin: (userId, accountId) => {
    return database("users").update({login_attempts: 0}).where({user_id: userId, account_id: accountId});
  },
  
  bloquearAcessoPorUmTempo: (userId, accountId, lockTime) => {
    return database("users").update({locked_until: lockTime}).where({user_id: userId, account_id: accountId});
  },
  
  removerBloqueio: (userId, accountId) => {
    return database("users").update({locked_until: null}).where({user_id: userId, account_id: accountId});
  },

  redefinirSenha: (senhaAtual, senhaNova, userEmail) => {
    return database("users").update({password_hash: senhaNova, must_change_password: false}).where({password_hash: senhaAtual, email: userEmail})
  },

  listarUsuarios: (accountId) => {
    return database.select('user_id','account_id', 'name', 'email', 'role', 'user_status', 'created_at', 'updated_at', 'last_login_at').from("users").where({account_id: accountId});
  },

  buscarUsuarioPorID: (userId, accountId) => {
    return database.select('user_id','account_id', 'name', 'email', 'role', 'user_status', 'created_at', 'updated_at', 'last_login_at').from("users").where({user_id: userId, account_id: accountId});
  },

  buscarEmailDoUsuario: (email) => {
    return database.select('email').from("users").where({email: email}).first();
  },

  atualizarUsuario: (data, userId, accountId) => {
    return database("users").update(data).where({user_id: userId, account_id: accountId});
  },

  deletarUsuario: (userId, accountId) => {
    return database.delete().from("users").where({user_id: userId, account_id: accountId});
  },

  ativarUsuario: (userId, accountId) => {
    return database("users").update({user_status: "active"}).where({user_id: userId, account_id: accountId});
  },

  desativarUsuario: (userId, accountId) => {
    return database("users").update({user_status: "inactive"}).where({user_id: userId, account_id: accountId});
  },

};