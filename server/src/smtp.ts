import SMTP2GOApi from 'smtp2go-nodejs';
import { ENV } from './env';

class SmtpService {
	private api;

	constructor() {
		this.api = SMTP2GOApi(ENV.SMTP2GO_API_KEY);
	}

	async sendMail({ to, from, subject, html, cc, attachments }: {
		to: { email: string, name?: string }[],
		from: { email: string, name?: string },
		subject: string,
		html: string,
		cc?: { email: string, name?: string }[],
		attachments?: string[]
	}) {
		let mailService = this.api.mail()
			.from(from)
			.subject(subject)
			.html(html);

		to.forEach(recipient => mailService = mailService.to(recipient));
		if (cc) cc.forEach(recipient => mailService = mailService.cc(recipient));
		if (attachments) attachments.forEach(file => mailService = mailService.attach(file));

		return this.api.client().consume(mailService);
	}
}

export const smtpService = new SmtpService(); 