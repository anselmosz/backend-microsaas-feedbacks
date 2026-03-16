import { database } from "../../config/database.js"

export default {
  criarEmpresa: (data, trx = null) => {
    const query = trx || database;
    return query("accounts").insert(data);
  },

  validarCredenciais: (email) => {
    return database.select('email', 'password_hash', 'user_id', 'account_id', 'role').from("users").where({email: email}).first();
  },
};