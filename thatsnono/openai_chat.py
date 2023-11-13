from openai import OpenAI

def chat(text):
    client = OpenAI()

    response = client.chat.completions.create(
      model="gpt-3.5-turbo",
      messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": text},
      ]
    )

    return response.choices[0].message.content

# main
if __name__ == "__main__":
    import os, val
    os.environ['OPENAI_API_KEY'] = val.OPENAI_API_KEY

    text = "안녕하세요"
    print(chat(text))
