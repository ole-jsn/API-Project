import json
import boto3
import os
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB-Client und Tabelle aus Umgebungsvariablen
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE', 'Hier Tabellenname')
table = dynamodb.Table(table_name)

# Pfade aus Umgebungsvariablen
path_status = os.environ.get('API_PATH_STATUS', '/hier Path')
path_value = os.environ.get('API_PATH_VALUE', '/hier Path')
path_all = os.environ.get('API_PATH_ALL', '/hier Path')

# Primärschlüssel aus Umgebungsvariablen
primary_key = os.environ.get('DYNAMODB_PRIMARY_KEY', 'Hier Partition Key')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    http_method = event.get('httpMethod')
    path = event.get('path')
    body = json.loads(event['body']) if event.get('body') else None
    query_params = event.get('queryStringParameters')

    try:
        # GET Request für Status
        if path == path_status and http_method == 'GET':
            return create_response(200, {'message': 'API is up and running!'})

        # Requests für einzelne Werte
        elif path == path_value:

            # GET
            if http_method == 'GET':
                key_value = parse_query_param(query_params, primary_key)
                if key_value is None:
                    return create_response(400, {'error': f'{primary_key} is required.'})
                return get_value(key_value)

            # POST
            elif http_method == 'POST':
                if not body or primary_key not in body:
                    return create_response(400, {'error': f'{primary_key} and other required fields are missing.'})
                body[primary_key] = int(body[primary_key]) if isinstance(body[primary_key], str) and body[primary_key].isdigit() else body[primary_key]
                return add_value(body)
            
            # DELETE
            elif http_method == 'DELETE': 
                key_value = parse_query_param(query_params, primary_key)
                if key_value is None:
                    return create_response(400, {'error': f'{primary_key} is required.'})
                return delete_value(key_value)

        # Requests für alle Werte
        elif path == path_all:

            # GET
            if http_method == 'GET':
                return get_all()
            
            # DELETE
            elif http_method == 'DELETE':
                return delete_all()

        return create_response(404, {'error': 'Invalid path or HTTP method.'})

    except Exception as e:
        logger.error(f"Error: {e}")
        return create_response(500, {'error': str(e)})

def create_response(status_code, body, content_type='application/json', is_base64_encoded=False):
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': content_type,
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, default=decimal_to_native)
    }
    if is_base64_encoded:
        response['isBase64Encoded'] = True
    return response

def parse_query_param(query_params, key, to_int=False):

    if not query_params or key not in query_params:
        return None
    value = query_params[key]
    if to_int:
        try:
            return int(value)
        except ValueError:
            return None
    return value 

def decimal_to_native(obj):
    if isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    raise TypeError

def get_value(key_value):
    try:
        response = table.get_item(Key={primary_key: key_value})
        if 'Item' in response:
            return create_response(200, response['Item'])
        else:
            return create_response(404, {'error': f'Item with {primary_key} {key_value} not found.'})
    except Exception as e:
        logger.error(f"Error in get_value: {e}")
        return create_response(500, {'error': str(e)})

def add_value(value):
    try:
        table.put_item(Item=value)
        return create_response(201, {'message': f'Item added successfully.', 'item': value})
    except Exception as e:
        logger.error(f"Error in add_value: {e}")
        return create_response(500, {'error': str(e)})

def delete_value(key_value):
    try:
        response = table.delete_item(
            Key={primary_key: key_value},
            ReturnValues='ALL_OLD'
        )
        if 'Attributes' in response:
            return create_response(200, {'message': f'Item with {primary_key} {key_value} deleted successfully.'})
        else:
            return create_response(404, {'error': f'Item with {primary_key} {key_value} not found.'})
    except Exception as e:
        logger.error(f"Error in delete_value: {e}")
        return create_response(500, {'error': str(e)})

def get_all():
    try:
        response = table.scan()
        all_items = response.get('Items', [])
        return create_response(200, {'items': all_items})
    except Exception as e:
        logger.error(f"Error in get_all: {e}")
        return create_response(500, {'error': str(e)})

def delete_all():
    try:
        scan_kwargs = {}
        while True:
            response = table.scan(**scan_kwargs)
            with table.batch_writer() as batch:
                for item in response.get('Items', []):
                    batch.delete_item(Key={primary_key: item[primary_key]})
            if 'LastEvaluatedKey' not in response:
                break
            scan_kwargs['ExclusiveStartKey'] = response['LastEvaluatedKey']
        return create_response(200, {'message': 'All items deleted successfully.'})
    except Exception as e:
        logger.error(f"Error in delete_all: {e}")
        return create_response(500, {'error': str(e)})
