using System.Net;
using System.Net.Mail;

namespace TodoApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }
        public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            var smtpHost = _config["Email:SmtpHost"];
            var smtpPort = _config.GetValue<int>("Email:SmtpPort", 587);
            var smtpUser = _config["Email:SmtpUser"];
            var smtpPass = _config["Email:SmtpPass"];
            var fromEmail = _config["Email:FromAddress"] ?? "noreply@todoApp.local";

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
            {
                _logger.LogError("SMTP configuration is missing. Cannot send email to {Email}", toEmail);
                return;
            }

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var message = new MailMessage(fromEmail, toEmail)
            {
                Subject = "Password Reset Request",
                Body = $"Click the following link to reset your password \n\n{resetLink}\n\n This link will expire in 1 hour.",
                IsBodyHtml = false
            };

            await client.SendMailAsync(message);
            _logger.LogInformation("Password reset email sent to {Email}", toEmail);
        }
    }
}