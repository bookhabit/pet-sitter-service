import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');
import emailConfig from 'src/config/emailConfig';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor(
    @Inject(emailConfig.KEY) private config: ConfigType<typeof emailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: this.config.service,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass,
      },
    });
  }

  async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    console.log('sendMemberJoinEmail', email, signupVerifyToken);
    const baseUrl = this.config.baseUrl;

    const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;

    const mailOptions: EmailOptions = {
      to: email,
      subject: '가입 인증 이메일',
      html: `가입 확인 버튼을 누르면 가입 완료됩니다. <br/>
            <form action="${url}" method="POST">
            <button>가입 확인</button></form>`,
    };

    console.log('mailOptions', mailOptions);

    return this.transporter
      .sendMail(mailOptions)
      .then((result) => {
        console.log('result', result);
        return result;
      })
      .catch((error) => {
        console.error('error', error);
        throw error;
      });
  }
}
