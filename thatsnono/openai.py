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

    return response['choices'][0]['message']['content']
