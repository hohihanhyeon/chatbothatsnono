import os

from flask import Flask, send_file, request, jsonify

import val
from thatsnono.filters.image.blur import raw_to_base64, blur
from thatsnono.filters.image.face_detection import face_locs
from thatsnono.filters.image.object_detection import detect_objs, filter_objs
from thatsnono.filters.text.ner import analyze_entities, extract_entities
from thatsnono.openai import chat

app = Flask(__name__)


@app.route('/')
def index():
    return send_file('index.html')


@app.route('/chat', methods=['POST'])
def on_chat():
    data = request.get_json()
    print(f"/chat: {data}")

    user_msg = data['text']
    msg = chat(user_msg)
    response = {"text": msg}
    return jsonify(response), 200


@app.route('/analyze_entities', methods=['POST'])
def on_analyze_entities():
    data = request.get_json()
    print(f"/analyze_entities: {data}")

    text = data['text']
    r = analyze_entities(text)
    extracted_entities = extract_entities(r.entities)
    response = {"entities": extracted_entities}
    return jsonify(response), 200


@app.route('/blur_faces', methods=['POST'])
def on_blur_faces():
    """
    img는 base64로 인코딩된 이미지
    :return:
    """
    data = request.get_json()
    img = data['img']
    format = data['format']

    img_base64 = raw_to_base64(img)
    locs = face_locs(img_base64)
    result = blur(locs, img_base64, format)
    response = {"blurred-img": result}
    return jsonify(response), 200


@app.route('/blur_objs', methods=['POST'])
def on_blur_objs():
    """
    img는 base64로 인코딩된 이미지
    :return:
    """
    data = request.get_json()
    img = data['img']
    format = data['format']
    objs = data['objs']  # 블러처리 할 객체들

    img_base64 = raw_to_base64(img)
    locs = detect_objs(img_base64, format)
    locs_to_blur = filter_objs(locs, objs)
    result = blur(locs_to_blur, img_base64, format)

    response = {"blurred-img": result}
    return jsonify(response), 200


def setup():
    # 구글 API 키 설정
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = val.GOOGLE_CLOUD_API_KEY


# 메인
if __name__ == "__main__":
    print("서버 시작")

    # 설정
    setup()

    # 서버 시작
    app.run(debug=True, host='0.0.0.0', port=val.PORT)

    print("서버 종료")
