from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        errors = response.data
        if isinstance(errors, dict):
            non_field = errors.pop('non_field_errors', None)
            if errors:
                return Response({
                    'error': True,
                    'message': non_field[0] if non_field else 'Validation error.',
                    'status_code': response.status_code,
                    **errors  
                }, status=response.status_code)
        return Response({
            'error': True,
            'message': str(errors) if not isinstance(errors, str) else errors,
            'status_code': response.status_code,
        }, status=response.status_code)
    return response
