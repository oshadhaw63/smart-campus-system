import pika
import sys
import os
import smtplib
from email.mime.text import MIMEText

# --- CONFIGURATION ---
RABBITMQ_URL = "amqps://ftnvthix:EJ74G9eFWRfIpENoNsgTxUAmmxnmdF-3@armadillo.rmq.cloudamqp.com/ftnvthix" # <-- PASTE YOUR RABBITMQ URL HERE AGAIN
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "oshadhawijayarathne63@gmail.com"        # <--- YOUR GMAIL
SENDER_PASSWORD = "vrkg zzva daxt dkxa"      # <--- YOUR APP PASSWORD

def send_email(student_info):
    try:
        # Create the email
        msg = MIMEText(f"Hello,\n\nThis is a notification that {student_info}.\n\nRegards,\nSmart Campus System")
        msg['Subject'] = "📢 Attendance Notification"
        msg['From'] = SENDER_EMAIL
        msg['To'] = SENDER_EMAIL # For testing, send to yourself

        # Connect to Gmail
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f" [✅] Email sent successfully to {SENDER_EMAIL}")
    except Exception as e:
        print(f" [❌] Failed to send email: {e}")

def main():
    print(" [*] Worker started. Waiting for messages...")
    
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue='attendance_emails')

    def callback(ch, method, properties, body):
        message_text = body.decode()
        print(f" [x] Processing: {message_text}")
        
        # ACTUALLY SEND THE EMAIL
        send_email(message_text)
        print(" -----------------------------------")

    channel.basic_consume(queue='attendance_emails', on_message_callback=callback, auto_ack=True)
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try: sys.exit(0)
        except SystemExit: os._exit(0)