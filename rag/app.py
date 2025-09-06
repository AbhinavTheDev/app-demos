from flask import Flask, render_template, request, jsonify
from rag import RAGChatLogic

app = Flask(__name__)
logicEngine = RAGChatLogic()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/resource", methods=["POST"])
def resource():
    data = request.json["message"]
    response = logicEngine.get_resource_status(data)
    return jsonify({"status": response})


@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message", "")
        if not user_input:
            return jsonify({"response": "Empty message received"}), 400

        logicEngine.process_question(user_input)
        response = logicEngine.get_chat_response()
        return jsonify({"response": response})
    except Exception as e:
        app.logger.error(f"Error in chat route: {str(e)}")
        return jsonify({"response": "An error occurred processing your request"}), 500


if __name__ == "__main__":
    app.run(debug=True)
