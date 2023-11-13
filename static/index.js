function l(m) {
    console.log(m);
}

// fecth로 analyze_entities 호출 (POST)
async function analyze_entities() {
    let text = document.getElementById("text").value;
    let url = "http://tr33.r-e.kr:31313/analyze_entities"
    let data = {
        "text": text
    }
    const  response =await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })

    return response.json();
}
