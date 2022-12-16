from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS, cross_origin
from os import mkdir, path
from os.path import exists
import base64
import subprocess

app = Flask(__name__)
cors = CORS(app)


@app.route("/", methods=["POST"])
@cross_origin("*")
def get_image_b64():
    """
    Get a base64 image from the body of the POST request, save it as an image to the local computer, run an ImageMagick effect on
    it, and then return the base64 representation of the converted image.
    """

    b64, cmd = request.json["b64Image"].split("base64,")[1], request.json["cmd"]

    # Write out base64 to local directory
    if not exists("./images"):
        mkdir("./images")

    # Write out base64 image as PNG
    file_path = path.join("./images", "savedCanvas.png")
    with open(file_path, "wb") as f:
        f.write(base64.b64decode(b64))

    # Edit image with provided ImageMagick command and configurations
    converted_path = path.join("./images", "convertedCanvas.png")
    command = f"magick {file_path} "

    if "channel" in request.json:
        command += f'{request.json["channel"]} '

    command += f"{cmd} "

    if "cfg" in request.json:
        command += f'{request.json["cfg"]} '

    if "channel" in request.json:
        command += "+channel "

    command += converted_path

    subprocess.call(command, shell=True)

    with open(converted_path, "rb") as f:
        return jsonify({"img": base64.b64encode(f.read()).decode("ascii")})


@app.route("/health")
def check_health():
    return "Healthy!"
