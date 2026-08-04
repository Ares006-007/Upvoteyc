import os
import json
import uuid
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

load_dotenv()

FEEDBACK_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "feedback.json")
DEFAULT_TARGET_EMAIL = "shaikajhaj@gmail.com"


def _format_stars(rating: Optional[int]) -> str:
    if not rating or rating < 1:
        return "Not Rated"
    filled = "★" * min(rating, 5)
    empty = "☆" * max(0, 5 - rating)
    return f"{filled}{empty} ({rating}/5)"


def _build_html_email(data: Dict[str, Any], target_email: str) -> str:
    category = data.get("category", "General Feedback")
    rating_val = data.get("rating", 5)
    stars = _format_stars(rating_val)
    name = data.get("name", "Anonymous User") or "Anonymous User"
    email = data.get("email", "Not provided") or "Not provided"
    message = data.get("message", "").replace("\n", "<br>")
    page_url = data.get("page_url", "OpenVC Web Application") or "OpenVC Web Application"
    timestamp = data.get("created_at", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
    
    # Category badge colors
    badge_bg = "#dceeb1"
    badge_color = "#1f1d3d"
    if "bug" in category.lower():
        badge_bg = "#f3c9b6"
    elif "feature" in category.lower():
        badge_bg = "#c5b0f4"
    elif "signal" in category.lower() or "diligence" in category.lower():
        badge_bg = "#c8e6cd"

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenVC Feedback</title>
</head>
<body style="margin:0; padding:24px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color:#f4f4f0; color:#111111;">
  <div style="max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #e2e2dc; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background:#0a0a0c; padding:24px 32px; border-bottom:3px solid #ff3d8b;">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">OpenVC <span style="color:#ff3d8b; font-weight:400; font-size:16px;">| Feedback Intelligence</span></span>
        <span style="background:{badge_bg}; color:{badge_color}; font-size:12px; font-weight:600; padding:4px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">
          {category}
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding:32px;">
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 8px 0; font-size:20px; font-weight:700; color:#111111;">New Feedback Submission</h2>
        <p style="margin:0; color:#666666; font-size:14px;">Delivered directly to <strong>{target_email}</strong> from OpenVC platform.</p>
      </div>

      <!-- Rating & Meta Table -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px; background:#fafaf8; border-radius:8px; overflow:hidden; border:1px solid #ebebea;">
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-weight:600; font-size:13px; color:#555555; width:35%;">Rating:</td>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-size:15px; color:#ff9f00; font-weight:700;">{stars}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-weight:600; font-size:13px; color:#555555;">Submitted By:</td>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-size:14px; color:#111111;"><strong>{name}</strong></td>
        </tr>
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-weight:600; font-size:13px; color:#555555;">Sender Email:</td>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-size:14px; color:#111111;">
            <a href="mailto:{email}" style="color:#0055ff; text-decoration:none;">{email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-weight:600; font-size:13px; color:#555555;">Category:</td>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-size:14px; color:#111111;">{category}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-weight:600; font-size:13px; color:#555555;">Page Source:</td>
          <td style="padding:12px 16px; border-bottom:1px solid #ebebea; font-size:13px; color:#666666;">{page_url}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px; font-weight:600; font-size:13px; color:#555555;">Submitted At:</td>
          <td style="padding:12px 16px; font-size:13px; color:#666666;">{timestamp}</td>
        </tr>
      </table>

      <!-- Message Content -->
      <div style="margin-bottom:28px;">
        <div style="font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; color:#444444; margin-bottom:8px;">Feedback Message:</div>
        <div style="background:#ffffff; border:1px solid #e0e0dc; border-left:4px solid #000000; padding:18px 20px; border-radius:6px; font-size:15px; line-height:1.6; color:#222222;">
          {message}
        </div>
      </div>

      <!-- Quick Reply Action -->
      {f'''<div style="text-align:center; margin-top:24px;">
        <a href="mailto:{email}?subject=Re:%20OpenVC%20Feedback%20[{category}]" 
           style="display:inline-block; background:#000000; color:#ffffff; font-weight:600; font-size:14px; padding:12px 28px; border-radius:6px; text-decoration:none;">
          Reply Directly to {name}
        </a>
      </div>''' if email and email != "Not provided" and "@" in email else ""}

    </div>

    <!-- Footer -->
    <div style="background:#fafaf8; border-top:1px solid #ebebea; padding:16px 32px; font-size:12px; color:#888888; text-align:center;">
      Automated dispatch from <strong>OpenVC Venture Intelligence</strong> • Routing to {target_email}
    </div>

  </div>
</body>
</html>
"""


def _send_smtp_email(target_email: str, subject: str, html_content: str, reply_to: Optional[str] = None) -> bool:
    """Attempts to send email via SMTP if credentials are configured."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "") or os.getenv("SMTP_PASS", "")
    smtp_from = os.getenv("SMTP_FROM", f"OpenVC Feedback <{smtp_user or 'noreply@openvc.app'}>")
    use_ssl = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1")

    if not smtp_user or not smtp_password:
        print("[FeedbackService] SMTP credentials not provided in .env (SMTP_USER, SMTP_PASSWORD).")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_from
        msg["To"] = target_email
        if reply_to and "@" in reply_to:
            msg["Reply-To"] = reply_to

        msg.attach(MIMEText(html_content, "html"))

        if use_ssl or smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, [target_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, [target_email], msg.as_string())
                
        print(f"[FeedbackService] Successfully dispatched email via SMTP to {target_email}")
        return True
    except Exception as e:
        print(f"[FeedbackService] SMTP dispatch error: {e}")
        return False


def _send_resend_email(target_email: str, subject: str, html_content: str, reply_to: Optional[str] = None) -> bool:
    """Attempts to send email via Resend API if RESEND_API_KEY is configured."""
    resend_key = os.getenv("RESEND_API_KEY", "")
    if not resend_key:
        return False

    try:
        payload = {
            "from": os.getenv("RESEND_FROM", "OpenVC Feedback <onboarding@resend.dev>"),
            "to": [target_email],
            "subject": subject,
            "html": html_content,
        }
        if reply_to and "@" in reply_to:
            payload["reply_to"] = reply_to

        res = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=10,
        )
        if res.status_code in (200, 201):
            print(f"[FeedbackService] Successfully dispatched email via Resend to {target_email}")
            return True
        else:
            print(f"[FeedbackService] Resend API error ({res.status_code}): {res.text}")
            return False
    except Exception as e:
        print(f"[FeedbackService] Resend dispatch exception: {e}")
        return False


def _send_web3forms_email(target_email: str, subject: str, data: Dict[str, Any]) -> bool:
    """Attempts to send via Web3Forms if WEB3FORMS_ACCESS_KEY is configured."""
    access_key = os.getenv("WEB3FORMS_ACCESS_KEY", "").strip()
    if not access_key:
        return False
    try:
        url = "https://api.web3forms.com/submit"
        payload = {
            "access_key": access_key,
            "subject": subject,
            "from_name": "OpenVC Intelligence",
            "to_email": target_email,
            "Category": data.get("category", "Feedback"),
            "Rating": _format_stars(data.get("rating", 5)),
            "Submitted By": data.get("name") or "Anonymous User",
            "Sender Email": data.get("email") or "Not provided",
            "Message": data.get("message", ""),
            "Page": data.get("page_url", "OpenVC Platform"),
        }
        res = requests.post(url, json=payload, timeout=10)
        if res.status_code == 200 and res.json().get("success"):
            print(f"[FeedbackService] Web3Forms email sent to {target_email}")
            return True
        return False
    except Exception as e:
        print(f"[FeedbackService] Web3Forms error: {e}")
        return False


def _send_formsubmit_email(target_email: str, subject: str, data: Dict[str, Any]) -> tuple[bool, bool, str]:
    """
    Sends email directly to target_email via FormSubmit.co.
    Returns: (success: bool, activation_pending: bool, message: str)
    """
    try:
        url = f"https://formsubmit.co/ajax/{target_email}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://openvc.app",
            "Origin": "https://openvc.app",
            "Accept": "application/json"
        }
        
        category = data.get("category", "General Feedback")
        rating_val = data.get("rating", 5)
        stars = _format_stars(rating_val)
        name = data.get("name") or "Anonymous User"
        sender_email = data.get("email") or "Not provided"
        message = data.get("message", "")
        page_url = data.get("page_url", "OpenVC Platform") or "OpenVC Platform"
        timestamp = data.get("created_at", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
        
        payload = {
            "_subject": subject,
            "_template": "box",
            "_captcha": "false",
            "Category": category,
            "Rating": stars,
            "Submitted By": name,
            "Sender Email": sender_email,
            "Message": message,
            "Source URL": page_url,
            "Time (UTC)": timestamp,
        }
        if sender_email and "@" in sender_email:
            payload["_replyto"] = sender_email

        res = requests.post(url, headers=headers, json=payload, timeout=12)
        if res.status_code == 200:
            res_data = res.json()
            is_success_str = str(res_data.get("success", "true")).lower()
            resp_msg = str(res_data.get("message", "")).lower()
            
            # FormSubmit sends a 1-time activation link on first submission to a new email
            if "activate" in resp_msg or "confirm" in resp_msg or is_success_str == "false":
                print(f"[FeedbackService] FormSubmit needs 1-time activation for {target_email}: {resp_msg}")
                return False, True, "FormSubmit 1-time confirmation email sent to inbox/spam."
            
            print(f"[FeedbackService] FormSubmit successfully dispatched to {target_email}")
            return True, False, "Dispatched via FormSubmit."
        else:
            print(f"[FeedbackService] FormSubmit non-200 ({res.status_code}): {res.text}")
            return False, False, f"FormSubmit error status {res.status_code}"
    except Exception as e:
        print(f"[FeedbackService] FormSubmit exception: {e}")
        return False, False, str(e)


def _send_slack_alert(data: Dict[str, Any], target_email: str) -> bool:
    """Dispatches Slack notification if SLACK_WEBHOOK is set."""
    webhook_url = os.getenv("SLACK_WEBHOOK", "")
    if not webhook_url or webhook_url.startswith("your-"):
        return False

    try:
        category = data.get("category", "Feedback")
        name = data.get("name") or "Anonymous"
        email = data.get("email") or "No email"
        rating = data.get("rating", 5)
        stars = _format_stars(rating)
        message = data.get("message", "")

        slack_payload = {
            "text": f"💬 *New OpenVC Feedback Received* ({category})",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"💬 New OpenVC Feedback: {category}",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*From:* {name} (`{email}`)"},
                        {"type": "mrkdwn", "text": f"*Rating:* {stars}"},
                        {"type": "mrkdwn", "text": f"*Category:* {category}"},
                        {"type": "mrkdwn", "text": f"*Forwarded To:* `{target_email}`"}
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"> {message}"
                    }
                }
            ]
        }
        res = requests.post(webhook_url, json=slack_payload, timeout=8)
        return res.status_code == 200
    except Exception as e:
        print(f"[FeedbackService] Slack notification error: {e}")
        return False


def _save_feedback_locally(data: Dict[str, Any]):
    """Persists feedback to local JSON store as a safe fallback."""
    items = []
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                items = json.load(f)
        except Exception:
            items = []
    
    items.insert(0, data)
    # Keep max 500 items locally
    items = items[:500]
    
    try:
        with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2)
    except Exception as e:
        print(f"[FeedbackService] Could not save feedback to file: {e}")


def _save_feedback_to_supabase(data: Dict[str, Any]):
    """Attempts to save feedback record to Supabase if configured."""
    try:
        from core.supabase_client import supabase_admin, supabase_public
        client = supabase_admin or supabase_public
        if client is not None:
            client.table("feedbacks").insert({
                "id": data["id"],
                "name": data.get("name"),
                "email": data.get("email"),
                "category": data.get("category"),
                "rating": data.get("rating"),
                "message": data.get("message"),
                "page_url": data.get("page_url"),
                "created_at": data.get("created_at"),
                "target_email": data.get("target_email")
            }).execute()
    except Exception as e:
        # Table might not exist yet, that's fine since we also persist to local JSON
        pass


def submit_feedback(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entrypoint for processing user feedback submissions.
    Ensures delivery to shaikajhaj@gmail.com, local/cloud storage, and Slack mirroring.
    """
    target_email = os.getenv("FEEDBACK_TARGET_EMAIL", DEFAULT_TARGET_EMAIL).strip() or DEFAULT_TARGET_EMAIL
    
    feedback_id = f"fb-{uuid.uuid4().hex[:10]}"
    timestamp = datetime.now(timezone.utc).isoformat()
    
    record = {
        "id": feedback_id,
        "name": data.get("name", "").strip(),
        "email": data.get("email", "").strip(),
        "category": data.get("category", "General Feedback").strip(),
        "rating": int(data.get("rating", 5)),
        "message": data.get("message", "").strip(),
        "page_url": data.get("page_url", "").strip(),
        "metadata": data.get("metadata", {}),
        "target_email": target_email,
        "created_at": timestamp
    }

    # 1. Save locally and in Supabase
    _save_feedback_locally(record)
    _save_feedback_to_supabase(record)

    # 2. Build email content
    name_display = record["name"] or record["email"] or "Anonymous"
    subject = f"[OpenVC Feedback] {record['category']} from {name_display} ({record['rating']}★)"
    html_content = _build_html_email(record, target_email)
    reply_to = record["email"] if record["email"] and "@" in record["email"] else None

    # 3. Try email dispatch channels in priority order
    email_sent = False
    activation_pending = False
    method_used = "none"
    delivery_note = ""
    
    # Priority 1: Resend API (if configured)
    if _send_resend_email(target_email, subject, html_content, reply_to):
        email_sent = True
        method_used = "resend"
    # Priority 2: Custom SMTP (if configured)
    elif _send_smtp_email(target_email, subject, html_content, reply_to):
        email_sent = True
        method_used = "smtp"
    # Priority 3: Web3Forms (if configured)
    elif _send_web3forms_email(target_email, subject, record):
        email_sent = True
        method_used = "web3forms"
    # Priority 4: FormSubmit zero-config direct email delivery
    else:
        fs_ok, fs_activation, fs_msg = _send_formsubmit_email(target_email, subject, record)
        if fs_ok:
            email_sent = True
            method_used = "formsubmit"
        elif fs_activation:
            activation_pending = True
            method_used = "formsubmit_activation_pending"
            delivery_note = "FormSubmit sent a 1-time activation email to your inbox/spam. Click 'Activate Form' once to enable automatic forwarding."

    # 4. Mirror to Slack channel
    slack_sent = _send_slack_alert(record, target_email)

    return {
        "success": True,
        "id": feedback_id,
        "email_sent": email_sent,
        "activation_pending": activation_pending,
        "method_used": method_used,
        "delivery_note": delivery_note,
        "slack_sent": slack_sent,
        "target_email": target_email,
        "message": f"Feedback received successfully and routed to {target_email}!"
    }


def get_all_feedbacks():
    """Returns all stored feedbacks."""
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []
