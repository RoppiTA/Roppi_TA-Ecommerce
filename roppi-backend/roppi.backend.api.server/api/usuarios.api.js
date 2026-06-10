const express = require('express');

class UsuariosAPI {
  constructor() {
    this.router = express.Router();
    this.userServerUrl = `http://${process.env.HOST_USER_SERVER || 'localhost'}:${process.env.PORT_USER_SERVER || 3003}`;
    this._configurarRutas();
  }

  _configurarRutas() {

  }
}

module.exports = UsuariosAPI;