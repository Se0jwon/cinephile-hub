import { Movie } from "@/types/movie";

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    titleKo: "쇼생크 탈출",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop",
    rating: 9.3,
    year: 1994,
    genre: ["드라마"],
    director: "프랭크 다라본트",
    cast: ["팀 로빈스", "모건 프리먼"],
    plot: "무실 살인죄로 종신형을 선고받고 쇼생크 교도소에 수감된 앤디 듀프레인의 이야기. 그는 희망을 잃지 않고 자유를 향한 긴 여정을 시작한다.",
    runtime: 142
  },
  {
    id: 2,
    title: "The Dark Knight",
    titleKo: "다크 나이트",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop",
    rating: 9.0,
    year: 2008,
    genre: ["액션", "범죄", "드라마"],
    director: "크리스토퍼 놀란",
    cast: ["크리스찬 베일", "히스 레저", "아론 에크하트"],
    plot: "배트맨은 고담시를 공포에 떨게 하는 조커와 맞서 싸운다. 정의와 혼돈 사이의 치열한 대결이 시작된다.",
    runtime: 152
  },
  {
    id: 3,
    title: "Pulp Fiction",
    titleKo: "펄프 픽션",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop",
    rating: 8.9,
    year: 1994,
    genre: ["범죄", "드라마"],
    director: "쿠엔틴 타란티노",
    cast: ["존 트라볼타", "사무엘 L. 잭슨", "우마 서먼"],
    plot: "LA의 갱스터들의 얽히고설킨 이야기를 비선형적 구조로 그려낸 범죄 드라마.",
    runtime: 154
  },
  {
    id: 4,
    title: "Forrest Gump",
    titleKo: "포레스트 검프",
    poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=600&fit=crop",
    rating: 8.8,
    year: 1994,
    genre: ["드라마", "로맨스"],
    director: "로버트 저메키스",
    cast: ["톰 행크스", "로빈 라이트", "게리 시니즈"],
    plot: "순수하고 착한 포레스트 검프의 특별한 인생 여정을 따라가는 감동적인 이야기.",
    runtime: 142
  },
  {
    id: 5,
    title: "Inception",
    titleKo: "인셉션",
    poster: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&h=600&fit=crop",
    rating: 8.8,
    year: 2010,
    genre: ["액션", "SF", "스릴러"],
    director: "크리스토퍼 놀란",
    cast: ["레오나르도 디카프리오", "조셉 고든-레빗", "엘렌 페이지"],
    plot: "꿈 속에 침투해 생각을 훔치는 특수 요원의 마지막 임무. 현실과 꿈의 경계가 무너진다.",
    runtime: 148
  },
  {
    id: 6,
    title: "The Matrix",
    titleKo: "매트릭스",
    poster: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1574267432644-f610c3c1f0f3?w=1200&h=600&fit=crop",
    rating: 8.7,
    year: 1999,
    genre: ["액션", "SF"],
    director: "워쇼스키 남매",
    cast: ["키아누 리브스", "로렌스 피시번", "캐리-앤 모스"],
    plot: "현실이라 믿었던 세계가 컴퓨터 시뮬레이션임을 알게 된 한 프로그래머의 각성.",
    runtime: 136
  }
];
