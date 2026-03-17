import authService from "./auth.service.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export default {
  criarConta: asyncHandler(async (req, res) => {
    const resultado = await authService.criarConta(req.body.company, req.body.user);

    return res.status(201).json({message: "Conta criada com sucesso", data: resultado});
  }),

  login: asyncHandler (async (req, res) => {
    const token = await authService.login(req.body);

    return res.status(201).json({message: "Token criado com sucesso", token: token});
  }),
}