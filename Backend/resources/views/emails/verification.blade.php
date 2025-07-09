<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kings Invest - Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
            color: #1a1a1a;
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            color: #d4af37;
        }
        
        .welcome-text {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        
        .message {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .verification-code {
            background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
            color: #1a1a1a;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 3px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            box-shadow: 0 8px 16px rgba(212, 175, 55, 0.3);
        }
        
        .expiry-notice {
            background: #f8f9fa;
            border-left: 4px solid #d4af37;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            font-size: 14px;
            color: #666;
        }
        
        .security-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        
        .security-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .security-text {
            font-size: 14px;
            color: #856404;
            font-weight: 500;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 10px;
        }
        
        .team-signature {
            font-size: 14px;
            color: #495057;
            font-weight: 500;
            margin-bottom: 15px;
        }
        
        .automated-notice {
            font-size: 11px;
            color: #adb5bd;
            font-style: italic;
        }
        
        .ignore-notice {
            font-size: 11px;
            color: #adb5bd;
            margin-top: 10px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 10px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .verification-code {
                font-size: 24px;
                letter-spacing: 2px;
            }
            
            .logo {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">KINGS INVEST</div>
            <div class="welcome-text">Welcome to Kings Invest!</div>
        </div>
        
        <div class="content">
            <div class="message">
                Thank you for creating your account. To complete your registration and start investing, please use the security code below:
            </div>
            
            <div class="verification-code">
                {{ $verificationCode }}
            </div>
            
            <div class="expiry-notice">
                ⏰ This code will expire in 24 hours
            </div>
            
            <div class="security-notice">
                <div class="security-icon">🔒</div>
                <div class="security-text">
                    <strong>Security Notice:</strong> Never share this code with anyone. Kings Invest will never ask for this code via phone or email.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="team-signature">Best regards,<br>The Kings Invest Team</div>
            <div class="automated-notice">This is an automated message. Please do not reply to this email.</div>
            <div class="ignore-notice">If you didn't create an account, please ignore this email.</div>
        </div>
    </div>
</body>
</html>
