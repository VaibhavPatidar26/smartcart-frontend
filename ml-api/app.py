from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from smartcart_ml.routes import bp

load_dotenv()

app = Flask(__name__)
CORS(app)
app.register_blueprint(bp)

if __name__ == "__main__":
    import os

    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "8000"))
    app.run(host=host, port=port, debug=True)
