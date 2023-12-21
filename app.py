
# app = Flask(__name__)
# CORS(app)

# @app.route('/api/post_data', methods=['POST'])
# def post_data():
#     data = request.get_json()
#     items = data.get('items', [])
    
#     # Process the list of items as needed
#     print(items)

#     return jsonify(items)

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/post_data', methods=['POST'])
def post_data():
    data = request.get_json()
    items = data.get('items', [])

    # Process the list of items as needed
    print(items)

    # Pass a message to the HTML template
    return jsonify(items)

if __name__ == '__main__':
    app.run(debug=True)


