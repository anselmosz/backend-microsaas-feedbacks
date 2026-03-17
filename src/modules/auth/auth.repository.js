import { database } from "../../config/database.js"

export default {
  criarEmpresa: (data, trx = null) => {
    const query = trx || database;
    return query("accounts").insert(data);
  },
};