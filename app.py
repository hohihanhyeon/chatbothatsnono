import val
import os


def setup():
    # 구글 API 키 설정
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = val.GOOGLE_CLOUD_API_KEY

# 메인
if __name__ == "__main__":
    print("서버 시작")

    # 설정
    setup()


    print("서버 종료")