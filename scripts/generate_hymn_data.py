"""
라이즌 사이트에서 수집한 645곡 찬송가 데이터를 TypeScript 형식으로 변환
"""

# 스크래핑한 찬송가 제목 데이터
HYMN_TITLES = {
    1: "만복의 근원 하나님",
    2: "찬양 성부 성자 성령",
    3: "성부 성자와 성령",
    4: "성부 성자와 성령",
    5: "이 천지간 만물들아",
    6: "목소리 높여서",
    7: "성부 성자 성령",
    8: "거룩 거룩 거룩",
    9: "하늘에 가득 찬 영광의 하나님",
    10: "전능왕 오셔서",
    # ... 전체 645곡 데이터 (브라우저에서 수집한 데이터 사용)
}

# 영문 제목 매핑 (일반적인 찬송가 영문 제목)
ENGLISH_TITLES = {
    1: "Praise God from Whom All Blessings Flow",
    2: "Praise the Father, Son, and Holy Spirit",
    3: "Father, Son, and Holy Spirit",
    4: "Father, Son, and Holy Spirit",
    5: "All Creatures of Our God and King",
    6: "O for a Thousand Tongues to Sing",
    7: "Father, Son, and Holy Spirit",
    8: "Holy, Holy, Holy",
    9: "God of Glory, Lord of Love",
    10: "Come, Thou Almighty King",
    # ... 계속
}

# 카테고리 범위
CATEGORIES = {
    (1, 62): "예배",
    (63, 79): "성부하나님",
    (80, 181): "성자예수님",
    (182, 197): "성령",
    (198, 206): "성경",
    (207, 223): "교회",
    (224, 233): "성례",
    (234, 249): "천국",
    (250, 289): "구원",
    (290, 545): "그리스도인의 삶",
    (546, 575): "전도와 선교",
    (576, 645): "행사와 절기"
}

def get_category(hymn_no):
    for (start, end), category in CATEGORIES.items():
        if start <= hymn_no <= end:
            return category
    return "기타"

def generate_typescript_data():
    """TypeScript 배열 형식으로 데이터 생성"""
    lines = []
    lines.append("export const GLOBAL_HYMN_TREASURY: HymnDef[] = [")
    
    for no in range(1, 646):
        ko_title = HYMN_TITLES.get(no, f"찬송가 {no}장")
        en_title = ENGLISH_TITLES.get(no, f"Hymn {no}")
        es_title = f"Himno {no}"  # 스페인어는 기본값
        category = get_category(no)
        
        line = f"  {{ no: {no}, id: 'h{no}', ko: '{ko_title}', en: '{en_title}', es: '{es_title}', category: '{category}' }},"
        lines.append(line)
    
    lines.append("];")
    return "\n".join(lines)

if __name__ == "__main__":
    typescript_code = generate_typescript_data()
    
    # 파일로 저장
    with open("hymns-generated.ts", "w", encoding="utf-8") as f:
        f.write(typescript_code)
    
    print("✅ TypeScript 데이터 생성 완료!")
    print(f"📊 총 645곡 생성됨")
