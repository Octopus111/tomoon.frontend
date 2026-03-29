from __future__ import annotations

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path


def _require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"Missing required environment variable: {name}")
    return value


def _load_email_template() -> str:
    root = Path(__file__).resolve().parents[2]
    template_path = root / "landingpage" / "early_access_email.html"
    if not template_path.exists():
        raise FileNotFoundError(f"Email template not found: {template_path}")
    return template_path.read_text(encoding="utf-8")


def send_early_access_email(to_email: str) -> None:
    smtp_host = _require_env("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = _require_env("SMTP_USERNAME")
    smtp_password = _require_env("SMTP_PASSWORD")
    smtp_from_email = _require_env("SMTP_FROM_EMAIL")
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "ToMoon").strip() or "ToMoon"
    smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").strip().lower() in {"1", "true", "yes", "on"}

    html_content = _load_email_template()

    message = MIMEMultipart("alternative")
    message["Subject"] = "Welcome to ToMoon Early Access"
    message["From"] = f"{smtp_from_name} <{smtp_from_email}>"
    message["To"] = to_email
    message.attach(MIMEText(html_content, "html", "utf-8"))

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.ehlo()
        if smtp_use_tls:
            server.starttls()
            server.ehlo()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_from_email, [to_email], message.as_string())
