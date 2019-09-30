import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file

export class Bili1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "81d35063-be71-4df5-afa5-400a5af0d909",
      "哔哩哔哩 | 番剧",
      "/bilibili/bangumi/media/",
      "['番剧媒体 id, 番剧主页 URL 中获取']",
      store,
    );
  }
}
export class Bili2Service extends RssHubService {
  constructor(store: Store) {
    super(
      "06b43a4d-ef45-4e11-8e94-4dedd351d856",
      "哔哩哔哩 | UP 主投稿",
      "/bilibili/user/video/",
      "['用户 id, 可在 UP 主主页中找到']",
      store,
    );
  }
}
export class Bili3Service extends RssHubService {
  constructor(store: Store) {
    super(
      "5c6dbbcb-a40c-4fb1-b83a-0ebe82db5ea6",
      "哔哩哔哩 | UP 主专栏",
      "/bilibili/user/article/",
      "['用户 id, 可在 UP 主主页中找到']",
      store,
    );
  }
}
export class Bili4Service extends RssHubService {
  constructor(store: Store) {
    super(
      "ebacf835-c376-46a3-8f1b-fdeea2e6b08f",
      "哔哩哔哩 | UP 主动态",
      "/bilibili/user/dynamic/",
      "['用户 id, 可在 UP 主主页中找到']",
      store,
    );
  }
}
export class Bili5Service extends RssHubService {
  constructor(store: Store) {
    super(
      "97308586-73fb-45d9-92b4-ff0ea09d80d9",
      "哔哩哔哩 | UP 主频道",
      "/bilibili/user/channel/",
      "以「/」分隔的以下两项：['用户 id, 可在 UP 主主页中找到', '频道 id, 可在频道的 URL 中找到']",
      store,
    );
  }
}
export class Bili6Service extends RssHubService {
  constructor(store: Store) {
    super(
      "c0f34591-1189-4e5a-932b-0f5b60a108b1",
      "哔哩哔哩 | UP 主默认收藏夹",
      "/bilibili/user/fav/",
      "['用户 id, 可在 UP 主主页中找到']",
      store,
    );
  }
}
export class Bili7Service extends RssHubService {
  constructor(store: Store) {
    super(
      "f635f9ab-fb16-4ffc-a411-aebeafdc95b6",
      "哔哩哔哩 | UP 主非默认收藏夹",
      "/bilibili/fav/",
      "以「/」分隔的以下两项：['用户 id, 可在 UP 主主页中找到', '收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能']",
      store,
    );
  }
}
export class Bili8Service extends RssHubService {
  constructor(store: Store) {
    super(
      "d46dacaf-a729-4cfd-a699-a99cd178f8b7",
      "哔哩哔哩 | UP 主投币视频",
      "/bilibili/user/coin/",
      "['用户 id, 可在 UP 主主页中找到']",
      store,
    );
  }
}
export class Bili9Service extends RssHubService {
  constructor(store: Store) {
    super(
      "0367ea95-fc8b-4607-a0b9-69ce242a0cf2",
      "哔哩哔哩 | UP 主粉丝",
      "/bilibili/user/followers/",
      "['用户 id, 可在 UP 主主页中找到']",
      store,
    );
  }
}
export class Bili10Service extends RssHubService {
  constructor(store: Store) {
    super(
      "23793f5a-cd16-4393-a7e7-58aab2fd5daf",
      "哔哩哔哩 | UP 主关注用户",
      "/bilibili/user/followings/",
      "['用户 id, 可在 UP 主主页中找到']",
      store,
    );
  }
}
export class Bili11Service extends RssHubService {
  constructor(store: Store) {
    super(
      "2e5f3567-116c-485e-9378-3b8b8aab8e7e",
      "哔哩哔哩 | 分区视频",
      "/bilibili/partion/",
      "['分区 id']",
      store,
    );
  }
}

export class Bili18Service extends RssHubService {
  constructor(store: Store) {
    super(
      "36a5978a-aa7a-48c5-b071-3df74ae7b527",
      "哔哩哔哩 | 分区视频排行榜",
      "/bilibili/partion/ranking/",
      "['分区 id']",
      store,
    );
  }
}

export class Bili12Service extends RssHubService {
  constructor(store: Store) {
    super(
      "27cc5b46-ad2c-4108-973f-58d6714d582e",
      "哔哩哔哩 | 视频选集列表",
      "/bilibili/video/page/",
      "['可在视频页 URL 中找到']",
      store,
    );
  }
}

export class Bili13Service extends RssHubService {
  constructor(store: Store) {
    super(
      "ece51a8b-d1ba-4a37-9ee2-f783b8b2218b",
      "哔哩哔哩 | 视频评论",
      "/bilibili/video/reply/",
      "['可在视频页 URL 中找到']",
      store,
    );
  }
}

export class Bili19Service extends RssHubService {
  constructor(store: Store) {
    super(
      "910fb5ad-3010-4648-95cf-8e69111e512a",
      "哔哩哔哩 | 视频弹幕",
      "/bilibili/video/danmaku/",
      "['视频AV号,可在视频页 URL 中找到','分P号,不填默认为1']",
      store,
    );
  }
}

export class Bili14Service extends RssHubService {
  constructor(store: Store) {
    super(
      "32a7fc1c-8e04-4687-8fca-a1aec36d6d32",
      "哔哩哔哩 | link 公告",
      "/bilibili/link/news/",
      "['公告分类, 包括 直播:live 小视频:vc 相簿:wh']",
      store,
    );
  }
}

export class Bili20Service extends RssHubService {
  constructor(store: Store) {
    super(
      "87e90ad2-cca6-469a-a57a-e823c0068ac6",
      "哔哩哔哩 | 视频搜索",
      "/bilibili/vsearch/",
      "留空",
      store,
    );
  }
}

export class Bili21Service extends RssHubService {
  constructor(store: Store) {
    super(
      "c858ea9f-0234-432d-a0a0-d706dddc0b58",
      "哔哩哔哩 | 主站话题列表",
      "/bilibili/blackboard",
      "留空",
      store,
    );
  }
}

export class Bili22Service extends RssHubService {
  constructor(store: Store) {
    super(
      "1b6695d9-aa7d-49c5-a38a-224890100eef",
      "哔哩哔哩 | 会员购新品上架",
      "/bilibili/mall/new",
      "留空",
      store,
    );
  }
}

export class Bili15Service extends RssHubService {
  constructor(store: Store) {
    super(
      "2e1ed3df-71ae-40d6-8f57-c3903efcd278",
      "哔哩哔哩 | 会员购作品",
      "/bilibili/mall/ip/",
      "['作品 id, 可在作品列表页 URL 中找到']",
      store,
    );
  }
}

export class Bili16Service extends RssHubService {
  constructor(store: Store) {
    super(
      "b45c1732-dda9-4e68-950f-cb103b6a561d",
      "哔哩哔哩 | 话题(频道/标签)",
      "/bilibili/topic/",
      "['话题名(又称频道名或标签) 例如 2233 或 COSPLAY']",
      store,
    );
  }
}

export class Bili17Service extends RssHubService {
  constructor(store: Store) {
    super(
      "776169d1-443e-4891-b11b-0dad0177b9bb",
      "哔哩哔哩 | 歌单",
      "/bilibili/audio/",
      "['歌单 id, 可在歌单页 URL 中找到']",
      store,
    );
  }
}
