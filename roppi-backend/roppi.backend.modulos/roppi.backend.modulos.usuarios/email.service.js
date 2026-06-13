const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Envía un correo de activación de cuenta.
     * @param {string} correoDestino - Correo del usuario.
     * @param {string} token - Token de activación JWT.
     * @param {string} nombre - Nombre del usuario.
     */
    async enviarCorreoActivacion(correoDestino, token, nombre) {
        try {

            const backendUrl = process.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';
            const urlActivacion = `${backendUrl}/api/usuarios/activar/${token}`;

            const mensajeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Bienvenido a Roppita, ${nombre}!</h2>
          <p>Gracias por registrarte. Para poder iniciar sesión, necesitamos que verifiques tu cuenta.</p>
          <p>Por favor, haz clic en el siguiente botón para activar tu cuenta:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlActivacion}" style="background-color: #0E7490; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Activar mi cuenta
            </a>
          </div>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #6b7280;">${urlActivacion}</p>
          <br>
          <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
        </div>
      `;

            const opcionesCorreo = {
                from: `"Equipo Roppi" <${process.env.SMTP_USER}>`,
                to: correoDestino,
                subject: 'Activa tu cuenta de Roppi',
                html: mensajeHtml,
            };

            const info = await this.transporter.sendMail(opcionesCorreo);
            console.log('Correo de activación enviado:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error;
        }
    }

    /**
     * Envía un correo de reseteo de contrasena.
     * @param {string} correoDestino - Correo del usuario.
     * @param {string} token - Token de activación JWT.
     * @param {string} nombre - Nombre del usuario.
     */
    async enviarCorreoRecuperacion(correoDestino, token, nombre) {
        try {
            const frontendUrl = process.env.PUBLIC_FRONTEND_URL || 'http://localhost:5173';
            const urlRecuperacion = `${frontendUrl}/auth/reset-password?token=${token}`;

            const mensajeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recuperación de contraseña</h2>
        <p>Hola, ${nombre}. Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${urlRecuperacion}" style="background-color: #0E7490; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Restablecer contraseña
            </a>
        </div>
        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #6b7280;">${urlRecuperacion}</p>
        <br>
        <p>Este enlace expirará en <strong>1 hora</strong>.</p>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje. Tu cuenta sigue segura.</p>
        </div>
    `;

            const opcionesCorreo = {
                from: `"Equipo Roppi" <${process.env.SMTP_USER}>`,
                to: correoDestino,
                subject: 'Restablece tu contraseña de Roppi',
                html: mensajeHtml,
            };

            const info = await this.transporter.sendMail(opcionesCorreo);
            console.log('Correo de recuperación enviado:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error;
        }
    }

}

module.exports = new EmailService();
