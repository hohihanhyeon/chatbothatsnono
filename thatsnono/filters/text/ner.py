from google.cloud import language_v2

def analyze_entities(text):
    """
    문장에서 객체명들을 인식한다
    :param text: 문장
    :return:
    """
    client = language_v2.LanguageServiceClient()
    document_type_in_plain_text = language_v2.Document.Type.PLAIN_TEXT

    document = {
        "content": text,
        "type_": document_type_in_plain_text,
        "language_code": "ko",
    }

    response = client.analyze_entities(
        request={"document": document, "encoding_type": language_v2.EncodingType.UTF8}
    )

    for entity in response.entities:
        print(f"Representative name for the entity: {entity.name}")

        # Get entity type, e.g. PERSON, LOCATION, ADDRESS, NUMBER, et al.
        # See https://cloud.google.com/natural-language/docs/reference/rest/v2/Entity#type.
        print(f"Entity type: {language_v2.Entity.Type(entity.type_).name}")

        # Loop over the metadata associated with entity.
        # Some entity types may have additional metadata, e.g. ADDRESS entities
        # may have metadata for the address street_name, postal_code, et al.
        for metadata_name, metadata_value in entity.metadata.items():
            print(f"{metadata_name}: {metadata_value}")

        # Loop over the mentions of this entity in the input document.
        # The API currently supports proper noun mentions.
        for mention in entity.mentions:
            print(f"Mention text: {mention.text.content}")

            # Get the mention type, e.g. PROPER for proper noun
            print(f"Mention type: {language_v2.EntityMention.Type(mention.type_).name}")

            # Get the probability score associated with the first mention of the entity in the (0, 1.0] range.
            print(f"Probability score: {mention.probability}")

    # Get the language of the text, which will be the same as
    # the language specified in the request or, if not specified,
    # the automatically-detected language.
    print(f"Language of the text: {response.language_code}")
    return response

# 메인
if __name__ == "__main__":
    import os, val
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = val.GOOGLE_CLOUD_API_KEY

    text = "안녕 나는 이정한이고 현재 대한민국 경기도 화성시 향남읍에 살고 있어. 나는 기독교이고, 내 전화번호는 010-0101-0101이야. 나의 성별은 남자야."
    r = analyze_entities(text)
    print(r)

