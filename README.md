"# Manideep.Portfolio" 

## Email notifications (contact form)

Add a `.env` file in the project root:

```env
# SMTP config
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_app_password
SMTP_SECURE=false

# Mail headers
MAIL_FROM="Portfolio <you@example.com>"
MAIL_TO=you@example.com

# Server
PORT=3001
```

On contact submission, the message is stored in MongoDB and an email is sent to `MAIL_TO`.

## Google Forms forwarding

Set these variables in `.env` to forward contact submissions to a Google Form:

```env
GFORM_ID=1FAIpQLSdFMm_bvyUtn9p6RvD5gY8CkH_awK0qaqm0H4ZGRMcGM6ux0Q
GFORM_ENTRY_NAME=entry.2005620554
GFORM_ENTRY_EMAIL=entry.1045781291
GFORM_ENTRY_MESSAGE=entry.1065046570
```

How to get them:
- Open your Google Form → three dots → Get pre-filled link.
- Fill sample values for Name, Email, Message → Get link → copy.
- In that URL, note the `entry.xxxxxxxx` parameter names for each field. Those go into `GFORM_ENTRY_*`.
- For `GFORM_ID`, click Send → link icon → copy the share link. If the link is
  `https://forms.gle/abc123`, open the form editor and click Preview (eye icon),
  then view source: look for `https://docs.google.com/forms/d/e/<ID>/formResponse` and copy the `<ID>`.