# @flowhub/email

Provider-agnostic email registry — Resend, SendGrid, SMTP, Mailgun, SES, or any provider that can implement `send()`.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/email @flowhub/errors
```

## API

### `interface EmailProvider`

```ts
interface EmailProvider {
  name: string;
  send(to: string, subject: string, body: string): Promise<void>;
}
```

### `class EmailRegistry`

| Method | Description |
|---|---|
| `register(provider)` | Add a provider under `provider.name` |
| `get(name)` | Look up a provider; throws `ProviderNotFoundError` if unregistered |
| `send(name, to, subject, body)` | Dispatch to the named provider's `send()` |

## Usage

### Implementing a Resend provider

```ts
import { Resend } from "resend";
import { EmailRegistry } from "@flowhub/email";

const resend = new Resend(process.env.RESEND_API_KEY);
const email = new EmailRegistry();

email.register({
  name: "resend",
  async send(to, subject, body) {
    await resend.emails.send({ from: "noreply@yourapp.com", to, subject, html: body });
  },
});

await email.send("resend", "user@example.com", "Your code", `Code: ${code}`);
```

### Delivering an OTP by email instead of SMS

```ts
import { OtpManager } from "@flowhub/otp";

const otp = new OtpManager({ ttlMs: 5 * 60_000 });
const code = otp.generate("user@example.com");
await email.send("resend", "user@example.com", "Your verification code", `Your code is ${code}`);
```

### Falling back from SendGrid to SMTP

```ts
email.register({ name: "sendgrid", send: sendViaSendgrid });
email.register({ name: "smtp", send: sendViaSmtp });

try {
  await email.send("sendgrid", to, subject, body);
} catch {
  await email.send("smtp", to, subject, body);
}
```

## Related packages

- [`@flowhub/errors`](../errors/README.md) — `ProviderNotFoundError`
- [`@flowhub/otp`](../otp/README.md) — commonly paired for OTP delivery
- [`@flowhub/retry`](../retry/README.md) — wrap `send()` with retry/backoff
