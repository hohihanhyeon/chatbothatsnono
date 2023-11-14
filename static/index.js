import {DOMAIN, PORT, URL, logMsg} from "./commons.js";

function l(m) {
    console.log(m);
}

function text() {
    return document.getElementById("userInput");
}

function sendBtn() {
    return document.getElementById("sendBtn");
}

function checkBtn() {
    return document.getElementById("checkBtn");
}

function sendImgBtn() {
    return document.getElementById("sendImg");
}

// fecth로 analyze_entities 호출 (POST)
async function analyze_entities(text) {
    let data = {
        "text": text
    }
    const response = await _fetch("analyze_entities", data)
    return response['entities']
}

// fecth로 /chat 호출 (POST)
async function chat(text) {
    let data = {
        "text": text
    }
    const response = await _fetch("chat", data)
    return response['text']
}

// fecth로 /blur_faces 호출 (POST)
// img는 base64 인코딩된 이미지
async function blur_faces(img) {
    let data = {
        "img": img
    }
    const response = await _fetch("blur_faces", data)
    return response['blurred-img']
}

// fecth로 /blur_objs 호출 (POST)
// img는 base64 인코딩된 이미지
async function blur_objs(img) {
    let data = {
        "img": img
    }
    const response = await _fetch("blur_objs", data)
    return response['blurred-img']
}


// async function _fetch(task, data) {
//     // let url = `${URL}/${task}`
//     const response = await fetch(`/${task}`, {
//         method: "POST",
//         body: JSON.stringify(data),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//     return await response.json();
// }

async function _fetch(task, data) {
    const url = `/${task}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        return responseData
    } catch (error) {
        console.error('Error:', error);
    }
}

/*
entities = [
{
    "type": entity.type_.name,
    "content": content,
    "start": start,
    "end": end,
    "probability": probability
}, ...
]

엔티티를 각각 가져와서 start, end에 해당하는 부분을 highlight(background-color: yellow) 해준다.
 */
function highlightEntities(text, entities) {
    let result = "";
    let lastEnd = 0;

    for (let entity of entities) {
        const start = entity.start;
        const end = entity.end;

        // 엔티티 시작 전까지의 텍스트를 추가
        result += text.substring(lastEnd, start);
        // 엔티티를 감싸는 span 태그 추가
        result += `<span style="background-color: #FF0000">${text.substring(start, end)}</span>`;
        // 다음 시작 위치 갱신
        lastEnd = end;
    }
    // 마지막 엔티티 이후의 텍스트를 추가
    result += text.substring(lastEnd);
    return result;
}

function setSendBtnDisable(toggle) {
    sendBtn().disabled = toggle;
}


/*
이름 -> 홍길동(1), 홍길동(2)
전화번호 -> 010-1234-5678
이메일 -> gildong@naver.com
위치 ->

 */
let origin2trash = {}
let trashDateCount = {
    "LOCATION": 0,
    "PERSON": 0
}

function initlets() {
    origin2trash = {}
    trashDateCount = {
        "LOCATION": 0,
        "PERSON": 0,
        "ORGANIZATION": 0,
    }
}

function getTrashData(type) {
    switch (type) {
        case "LOCATION":
            return `위치(${trashDateCount.LOCATION++})`
        case "PERSON":
            return `이름(${trashDateCount.PERSON++})`
        case "ORGANIZATION":
            return `조직(${trashDateCount.ORGANIZATION++})`
    }
}

// function anonymizeEntities(text, privates, entities) {
//     // 엔티티에서 privates 리스테에 있는 타입들만 trashData로 바꾸고, 원본데이터는 origin2trash에 매핑해서 저장한다. (나중에 복구할 수 있도록)
//     // 예시: privates = ["LOCATION", "PERSON"]
//
//     let result = "";
//     let start = 0;
//     let end = 0;
//     for (let entity of entities) {
//         if (privates.includes(entity.type)) {
//             // trashdata 생성
//             let trashData = trashData(entity.type)
//             // origin2trash에 매핑
//             origin2trash[entity.content] = trashData
//
//             // 단어를 trashdata로 바꾸기
//             start = entity.start;
//             end = entity.end;
//             result += text.substring(0, start);
//             // 하이라이트 필요없음
//             result += trashData;
//             text = text.substring(end);
//         }
//     }
//     return result;
// }

function anonymizeEntities(text, privates, entities) {
    l('anonymizeEntities, text', text)
    l('anonymizeEntities, privates', privates)
    l('anonymizeEntities, entities', entities)

    let result = "";
    let lastEnd = 0;

    for (let entity of entities) {
        if (!privates.includes(entity.type)) {
            console.log("not private", entity.type)
            continue
        }

        const start = entity.start;
        const end = entity.end;

        // 엔티티 시작 전까지의 텍스트를 추가
        result += text.substring(lastEnd, start);
        // 엔티티를 감싸는 span 태그 추가
        // let origin = text.substring(start, end)
        // trashdata 생성
        let trashData = getTrashData(entity.type)
        // origin2trash에 매핑
        origin2trash[entity.content] = trashData
        result += trashData

        // 다음 시작 위치 갱신
        lastEnd = end;
    }

    // 마지막 엔티티 이후의 텍스트를 추가
    result += text.substring(lastEnd);
    l("result: ", result)
    return result;
}

function sendMsg() {
    // 보내기전에 anonymizeEntities를 호출해서 origin2trash를 업데이트한다.
    let entities = analyze_entities(text());
    let anonymizedText = anonymizeEntities(text(), privates, entities)
}


// document 로드됬을 떄
document.addEventListener("DOMContentLoaded", onLoad)

function onLoad() {
    sendBtn().addEventListener("click", onSendBtnClick)
    checkBtn().addEventListener("click", onCheckBtnClick)
    // sendImgBtn().addEventListener("click", onSendImgBtnClick)
}

async function onSendBtnClick() {
    let value = text()
    let textValue = value.value
    l(textValue)

    let entities = await analyze_entities(textValue)
    let highlightenText = highlightEntities(textValue, entities)
    text().innerHTML = highlightenText
    logMsg(highlightenText, "right")

    // 익명화
    let privates = ["PERSON"]
    l("before")
    l('value.value: ', textValue)
    l('privates: ', privates)
    l('entities: ', entities)
    let anonymizedText = anonymizeEntities(textValue, getSelectedText(), entities)
    l("anonymizedText", anonymizedText)


    // chat 호출
    let res = await chat(anonymizedText)


    logMsg(res, "left")
    l(res)

    value.value = ""
}


async function onCheckBtnClick() {
    let value = text().value
    let entities = await analyze_entities(value)
    let highlightenText = highlightEntities(value, entities)
    text().innerHTML = highlightenText

    // 익명화
    let privates = ["PERSON"]
    let anonymizedText = anonymizeEntities(value, privates, entities)
    l("anonymizedText", anonymizedText)
}

function onSendImgBtnClick() {

}

function revealText() {
    element.innerHTML = "Text has changed!";
    // background-color 초록색으로 변경
    element.style.backgroundColor = "#00FF00";
}

function getSelectedText() {
    let selectedText = [];

    // Get all checkboxes within the "textboxes" div
    let checkboxes = document.querySelectorAll('#textboxes input[type="checkbox"]:checked');

    // Iterate over the selected checkboxes and push their labels into the array
    checkboxes.forEach(function (checkbox) {
        let label = checkbox.nextElementSibling.innerText;
        selectedText.push(label);
    });

    // Log or use the selected text array as needed
    console.log(selectedText);
    return selectedText
}


function getSelectedImg() {
    let selectedImg = [];

    // Get all checkboxes within the "textboxes" div
    let checkboxes = document.querySelectorAll('#imgboxes input[type="checkbox"]:checked');

    // Iterate over the selected checkboxes and push their labels into the array
    checkboxes.forEach(function (checkbox) {
        let label = checkbox.nextElementSibling.innerText;
        selectedImg.push(label);
    });

    // Log or use the selected text array as needed
    console.log(selectedImg);
    return selectedImg
}