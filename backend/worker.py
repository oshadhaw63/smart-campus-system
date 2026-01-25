import pika
import sys
import os

RABBITMQ_URL = "amqps://ftnvthix:EJ74G9eFWRfIpENoNsgTxUAmmxnmdF-3@armadillo.rmq.cloudamqp.com/ftnvthix" 

def main():
    print(" [*] Worker started. Waiting for messages...")
    
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue='attendance_emails')

    # This function runs whenever a message arrives
    def callback(ch, method, properties, body):
        print(f" [x] RECEIVED TASK: {body.decode()}")
        print(" [>] Simulate Sending Email... DONE!")
        print(" -----------------------------------")

    channel.basic_consume(queue='attendance_emails', on_message_callback=callback, auto_ack=True)

    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)