import { passwordVerfication } from '@/emailTemplate/emailVerfication';
import { Resend } from 'resend';

interface SendMailParams {
  email: string;
  name: string;
  link: string;
  idurar_app_email: string;
  subject?: string;
  type?: string;
  emailToken?: string;
}

const sendMail = async ({
  email,
  name,
  link,
  idurar_app_email,
  subject = 'Verify your email | idurar',
  type = 'emailVerfication',
  emailToken,
}: SendMailParams): Promise<any> => {
  const resend = new Resend(process.env.RESEND_API);

  const { data } = await resend.emails.send({
    from: idurar_app_email,
    to: email,
    subject,
    html: passwordVerfication({ name, link }),
  });

  return data;
};

export default sendMail;

