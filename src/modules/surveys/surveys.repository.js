import { database } from "../../config/database.js";

export default {
  criarPesquisa: (data, trx = null) => {
    const query = trx || database;
    return query("surveys").insert(data);
  },

  listarPesquisas: (accountId) => {
    return database.select().from("surveys").where({account_id: accountId});
  },

  buscarPesquisaPorId: (accountId, surveyId) => {
    return database.select().from("surveys").where({account_id: accountId, survey_id: surveyId});
  },

  ativarPesquisa: (accountId, surveyId) => {
    return database("surveys").update({is_active: true}).where({account_id: accountId, survey_id: surveyId});
  },

  desativarPesquisa: (accountId, surveyId) => {
    return database("surveys").update({is_active: false}).where({account_id: accountId, survey_id: surveyId});
  },
}