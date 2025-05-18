from flask import Flask, request, jsonify
from googletrans import Translator
from textblob import TextBlob
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialiser le traducteur Google
translator = Translator()

@app.route("/analyze", methods=["POST"])
def analyze_sentiment():
    data = request.json
    comment = data.get("text", "")

    if not comment:
        return jsonify({"error": "Texte manquant"}), 400

    # Traduire le texte en anglais
    translated = translator.translate(comment, src='fr', dest='en')
    comment_english = translated.text

    # Analyser le sentiment du texte traduit
    blob = TextBlob(comment_english)
    polarity = blob.sentiment.polarity

    if polarity > 0.1:
        sentiment = "positive"
    elif polarity <= -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    return jsonify({
        "sentiment": sentiment,
        "polarity": polarity
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
