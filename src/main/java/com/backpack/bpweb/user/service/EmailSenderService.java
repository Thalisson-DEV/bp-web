package com.backpack.bpweb.user.service;

import com.backpack.bpweb.user.entity.Usuarios;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class EmailSenderService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Async
    public void sendNewPasswordEmail(Usuarios usuarios, String newPassword) {
        try {
            String emailUsuario = usuarios.getEmail();
            String senhaUsuario = newPassword;

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(senderEmail);
            helper.setTo(emailUsuario);
            helper.setSubject("Nova senha gerada - backpack");

            String htmlBody = buildNewPasswordEmailBody(emailUsuario, senhaUsuario);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);

        } catch (Exception e) {
            e.getStackTrace();
        }
    }

    private String buildNewPasswordEmailBody(String nomeUsuario, String novaSenha) {
        String template = """
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 30px; color: #333; }
          .container { background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0px 0px 5px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
          h2 { color: #e6b800; text-align: center; }
          .banner { text-align: center; margin: 20px 0; }
          .content { font-size: 15px; margin-top: 15px; line-height: 1.6; text-align: center; }
          .highlight { font-weight: bold; color: #0056b3; }
          .password-box { display: inline-block; margin-top: 15px; padding: 12px 20px; background-color: #0056b3; color: #ffffff; font-weight: bold; border-radius: 6px; font-size: 16px; letter-spacing: 1px; }
          .warning { margin-top: 20px; font-size: 13px; color: #777; }
          .signature { margin-top: 40px; font-size: 14px; color: #555; text-align: center; }
        </style>
        <div class="container">
          <h2>Sua Nova Senha de Acesso</h2>
          <div class="banner">
            <img src="https://i.imgur.com/fHvD7zX.png" alt="Logo" style="width: 30%; max-width: 200px;">
          </div>
          <div class="content">
            <p>Olá, <span class="highlight">{NOME_USUARIO}</span>.</p>
            <p>Conforme solicitado, geramos uma nova senha de acesso para você:</p>
            <div class="password-box">{NOVA_SENHA}</div>
            <p class="warning">Recomendamos que altere sua senha assim que possível para garantir maior segurança.</p>
            <div class="signature">
              <p>Atenciosamente,</p>
              <p><strong>Equipe CES - SIPEL</strong></p>
            </div>
          </div>
        </div>
        """;

        return template
                .replace("{NOME_USUARIO}", nomeUsuario)
                .replace("{NOVA_SENHA}", novaSenha);
    }

}
