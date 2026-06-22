from flask import request, jsonify
from functools import wraps

from scanner.jwt_handler import verify_token
from flask import request, jsonify, g


def login_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        auth_header = request.headers.get(
            "Authorization"
        )

        if not auth_header:

            return jsonify({
                "error": "Token missing"
            }), 401

        try:

            token = auth_header.split(" ")[1]

        except IndexError:

            return jsonify({
                "error": "Invalid token format"
            }), 401

        payload = verify_token(token)

        if not payload:

            return jsonify({
                "error": "Invalid or expired token"
            }), 401

        g.user = payload

        return func(*args, **kwargs)

    return wrapper