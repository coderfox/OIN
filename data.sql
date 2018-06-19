--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: permission; Type: TYPE; Schema: public; Owner: coderfox
--

CREATE TYPE public.permission AS ENUM (
    'admin'
);


ALTER TYPE public.permission OWNER TO coderfox;

--
-- Name: diesel_manage_updated_at(regclass); Type: FUNCTION; Schema: public; Owner: coderfox
--

CREATE FUNCTION public.diesel_manage_updated_at(_tbl regclass) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
                    FOR EACH ROW EXECUTE PROCEDURE diesel_set_updated_at()', _tbl);
END;
$$;


ALTER FUNCTION public.diesel_manage_updated_at(_tbl regclass) OWNER TO coderfox;

--
-- Name: diesel_set_updated_at(); Type: FUNCTION; Schema: public; Owner: coderfox
--

CREATE FUNCTION public.diesel_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (
        NEW IS DISTINCT FROM OLD AND
        NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at
    ) THEN
        NEW.updated_at := current_timestamp;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.diesel_set_updated_at() OWNER TO coderfox;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: __diesel_schema_migrations; Type: TABLE; Schema: public; Owner: coderfox
--

CREATE TABLE public.__diesel_schema_migrations (
    version character varying(50) NOT NULL,
    run_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.__diesel_schema_migrations OWNER TO coderfox;

--
-- Name: message; Type: TABLE; Schema: public; Owner: coderfox
--

CREATE TABLE public.message (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    readed boolean NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subscription_id uuid NOT NULL,
    href character varying
);


ALTER TABLE public.message OWNER TO coderfox;

--
-- Name: service; Type: TABLE; Schema: public; Owner: coderfox
--

CREATE TABLE public.service (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    token uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    description character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service OWNER TO coderfox;

--
-- Name: session; Type: TABLE; Schema: public; Owner: coderfox
--

CREATE TABLE public.session (
    token uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    user_id uuid NOT NULL,
    permissions public.permission[] DEFAULT ARRAY[]::public.permission[] NOT NULL
);


ALTER TABLE public.session OWNER TO coderfox;

--
-- Name: subscription; Type: TABLE; Schema: public; Owner: coderfox
--

CREATE TABLE public.subscription (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    config text NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_id uuid NOT NULL,
    service_id uuid NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.subscription OWNER TO coderfox;

--
-- Name: subscription_event; Type: TABLE; Schema: public; Owner: coderfox
--

CREATE TABLE public.subscription_event (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status boolean NOT NULL,
    message character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subscription_id uuid NOT NULL
);


ALTER TABLE public.subscription_event OWNER TO coderfox;

--
-- Name: user; Type: TABLE; Schema: public; Owner: coderfox
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(50) NOT NULL,
    password character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_token uuid,
    nickname character varying NOT NULL,
    permissions public.permission[] DEFAULT ARRAY[]::public.permission[] NOT NULL
);


ALTER TABLE public."user" OWNER TO coderfox;

--
-- Data for Name: __diesel_schema_migrations; Type: TABLE DATA; Schema: public; Owner: coderfox
--

INSERT INTO public.__diesel_schema_migrations (version, run_on) VALUES ('00000000000000', '2018-06-18 06:05:38.715857');
INSERT INTO public.__diesel_schema_migrations (version, run_on) VALUES ('20180618024545', '2018-06-18 06:05:38.726875');
INSERT INTO public.__diesel_schema_migrations (version, run_on) VALUES ('20180618025756', '2018-06-18 06:05:38.730896');
INSERT INTO public.__diesel_schema_migrations (version, run_on) VALUES ('20180618052737', '2018-06-18 06:05:38.740532');


--
-- Data for Name: message; Type: TABLE DATA; Schema: public; Owner: coderfox
--

INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('8bcde04a-5cac-44bb-9eb8-74115c0c7689', true, '[小傅Fox的日常]这样也好', '拖延了许久才执笔写下标题，也许是因日程繁忙，可我心里明白，那不过是我不愿去面对这样一个沉重话题的借口。自期末收整东西以来，自上次写下一份广告文案以来，又是许久没有打开这个本子。不明白自己在干什么，明明有一种强烈的愿望去写，但是总是没有落笔。
本文写于2014.8.30 晚自习
 我和她一个班了。她要走了。
曾经有过的许多许多故事，今后都不会再有了。曾经有过的痛苦也好，幸福也罢，都不会再有了。
我不清楚自己现在是怎样一种精神状态。我曾经写过，“心已死，梦永存。”可我又在怀疑，心究竟有没有死。曾经发生的那些，悲剧的与欢笑的，已给我打下深深的烙印。自那以后，就再也不敢去主动，但这样也好，毕竟不会再伤害别人。
那一年就是太神经病了，她说得对。对于那个年龄，有一个专门的词语，“中二”。中学二年级，以为自己对这个世界的思考都是对的，以为自己了不起，以为自己是中心……但是，我们生而平凡。这一年，伤害了很多人，这也许就是自己的黑历史吧。现在想起以往，总有一种愧疚，不论受害者是否记得，我记得。因此，现在总是不敢在大众面前发言，网上也好，现实也好。有些不敢面对大家，害怕说错了话。但这样也好，也许会因此变得成熟。
本来可以和好的，但小光做了所谓的“民意调查”。其实我清楚，核心的原因不在于这次事件，而是在于，那时的我，还是神经病一个。我无法理解，她为什么要交代出一切；我不清楚，小光和她说了什么。也许是诱导式提问，也许是套话，也许只是为了保全自己。但她自那以后，又开始讨厌我了。但这样也好，毕竟过去的那些泛紫色的回忆，不会再有了。
现在她走了，也许她知道，此刻我写的随笔。也许我们都明白，冷漠不会长久存在。「我们将在没有黑暗的地方相会。」此刻，你「正在紫色的雨中，静悄悄的离去。」', '拖延了许久才执笔写下标题，也许是因日程繁忙，可我心里明白，那不过是我不愿去面对这样一个沉重话题的借口。自期末收整东西以来，自上次写下一份广告文案以来，又是许久没有打开这个本子。不明白自己在干什么，明明有一种强烈的愿望去写，但是总是没有落笔。
本文写于2014.8.30 晚自习
 我和她一个班了。她要走了。
曾经有过的许多许多故事，今后都不会再有了。曾经有过的痛苦也好，幸福也罢，都不会再有了。
我不清楚自己现在是怎样一种精神状态。我曾经写过，“心已死，梦永存。”可我又在怀疑，心究竟有没有死。曾经发生的那些，悲剧的与欢笑的，已给我打下深深的烙印。自那以后，就再也不敢去主动，但这样也好，毕竟不会再伤害别人。
那一年就是太神经病了，她说得对。对于那个年龄，有一个专门的词语，“中二”。中学二年级，以为自己对这个世界的思考都是对的，以为自己了不起，以为自己是中心……但是，我们生而平凡。这一年，伤害了很多人，这也许就是自己的黑历史吧。现在想起以往，总有一种愧疚，不论受害者是否记得，我记得。因此，现在总是不敢在大众面前发言，网上也好，现实也好。有些不敢面对大家，害怕说错了话。但这样也好，也许会因此变得成熟。
本来可以和好的，但小光做了所谓的“民意调查”。其实我清楚，核心的原因不在于这次事件，而是在于，那时的我，还是神经病一个。我无法理解，她为什么要交代出一切；我不清楚，小光和她说了什么。也许是诱导式提问，也许是套话，也许只是为了保全自己。但她自那以后，又开始讨厌我了。但这样也好，毕竟过去的那些泛紫色的回忆，不会再有了。
现在她走了，也许她知道，此刻我写的随笔。也许我们都明白，冷漠不会长久存在。「我们将在没有黑暗的地方相会。」此刻，你「正在紫色的雨中，静悄悄的离去。」<p><a href="https://xfox.me/post/2014-09-13-%E8%BF%99%E6%A0%B7%E4%B9%9F%E5%A5%BD-65/">查看原文</a></p>', '2018-05-30 07:06:14.756743+08', '2018-05-30 16:18:43.550332+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('f5a4c7be-17a7-4121-b33a-d1c5d90fb4ec', true, ' 快递 yunda-1600887249033 有新动态', '[河南郑州公司]进行揽件扫描', '[河南郑州公司]进行揽件扫描', '2018-05-30 07:06:09.422219+08', '2018-05-30 16:18:43.705959+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('cdda07df-b179-4746-bba8-290253b9360b', true, '[小傅Fox的日常]我要变成萌妹子！：序', '我讨厌男性，但我本身是男性。
从小就幻想过自己是个妹子，谋划过购买女装，想象过自己作为一个妹子的样子。曾经像妹子一样卖萌。
小学六年级，在亚马逊上谋划过利用货到付款购买女装，最后没成功。
初二的时候，读过两本有关性别变化的网络小说，是第一次接触网络小说。
初三的时候，在微博上认识了一位男同，直到这时我才开始了解到性少数群体和他们在生活中的境况。也同时看到了几位异装者的微博账号。
高一时下手购买了第一套女装，穿出去过，着实满足了一下自己长久以来的愿望。同时我还查阅了 TG、TS、AG、CD 等等知识，虽然我算是 CD，但对网络上一些或者说绝大部分 CD 的言论不爽。当时把自己归类为 AG 和 CD，但是也不尽然。
小学读《奥秘》，看到里面说人有来世，也期许过自己来世成为妹子。听说过变性手术，但发现不完美。也幻想过克隆技术和大脑移植做出女版的自己。意淫过被外星人劫持从而变性。看到过药娘们的嗑药体验，也动心过，但发现药的种种副作用之后也很失望。
有时人的心理会超出力量。
本着满足幻想（笑）的想法，姑且写一个故事，纯属瞎编。幻想固然能带来一时的快乐，但抬头以后就又是光天化日之下的现实了。
谨以此故事献给天下所有的性少数者。I wish you future.', '我讨厌男性，但我本身是男性。
从小就幻想过自己是个妹子，谋划过购买女装，想象过自己作为一个妹子的样子。曾经像妹子一样卖萌。
小学六年级，在亚马逊上谋划过利用货到付款购买女装，最后没成功。
初二的时候，读过两本有关性别变化的网络小说，是第一次接触网络小说。
初三的时候，在微博上认识了一位男同，直到这时我才开始了解到性少数群体和他们在生活中的境况。也同时看到了几位异装者的微博账号。
高一时下手购买了第一套女装，穿出去过，着实满足了一下自己长久以来的愿望。同时我还查阅了 TG、TS、AG、CD 等等知识，虽然我算是 CD，但对网络上一些或者说绝大部分 CD 的言论不爽。当时把自己归类为 AG 和 CD，但是也不尽然。
小学读《奥秘》，看到里面说人有来世，也期许过自己来世成为妹子。听说过变性手术，但发现不完美。也幻想过克隆技术和大脑移植做出女版的自己。意淫过被外星人劫持从而变性。看到过药娘们的嗑药体验，也动心过，但发现药的种种副作用之后也很失望。
有时人的心理会超出力量。
本着满足幻想（笑）的想法，姑且写一个故事，纯属瞎编。幻想固然能带来一时的快乐，但抬头以后就又是光天化日之下的现实了。
谨以此故事献给天下所有的性少数者。I wish you future.<p><a href="https://xfox.me/post/2016-04-21-%E6%88%91%E8%A6%81%E5%8F%98%E6%88%90%E8%90%8C%E5%A6%B9%E5%AD%90%E5%BA%8F-5/">查看原文</a></p>', '2018-05-30 07:06:14.838416+08', '2018-05-30 16:18:38.867874+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('dbd0c1b5-32e1-4151-994f-fd5464591b10', true, '[小傅Fox的日常]无知、无力、无措', '本文写于5月28日。
终于考完期末了，补一下之前写的东西。
还不知道结果，希望能好一点吧。
我讨厌物理学史和数学必修三。
 上周，和你的闺蜜谈人生——一些关于你的事情。
起因是这样的，Q找到我，先是问我打不打算追你。我说，不。她又告诉我，有一个男生连续两天给你买早饭，她很愤慨。我只是“哦”了一声。
她一走我就后悔了——她会不会认为我对你是不是真爱啦，我对你是不是真爱啊，我选择不追你对不对啊。我想了一整天，努力证明“排他性是爱情的要素”，还归纳出一个爱情的模型——当然是错的。
我想到，我近日几次借给L手机，她不向我借的时候我甚至有些期待。我觉得这种念头是罪恶的，我应当保持我对你和L不同类型的感情的纯洁性。我怀疑我是否真的喜欢你，思考我是否应当用洗脑的方式维持我的喜欢。
我怀疑我选择不追求你的正确性。我想和你在一起，又害怕伤害了你，因为让你卷入自己不感兴趣的事件是不好的。我有过去的经历，它告诉我追求你必定会让你不愉快。
我甚至脑洞大到怀疑Q的问题是不是对我的测试。
于是，我在晚上和Q谈了人生。
Q说，我应该为你做些什么。我说，我怕这会影响你。她又说，做一些小事，你不会发觉的。
我心里一惊。是的，为你做一些小事——比帮你买早餐更小——并不会让你困扰。我有些过分简化爱情和扩大行为了。
爱情是什么呢？我认为，它是一种建立在友情基础之上的更深入的感情，它需要双方对彼此的承担。我有些畏手畏脚，这反而是错误的。
我应该去接触、帮助你。
但在实际去做的时候还是很茫然。
就比如说你有一天因为学校停水洗不了苹果，我就那么看着，什么都没做。当时我手里有两个选择——用男厕所的存水洗，但是有些脏，或者用自己寝室的存水洗，但是可能来不及。于是我想，两个方案都不好，我不如不做。
一阵之后我就后悔了。我本应向你陈述两个方案，也许你会答应其中一个，哪怕没有答应，也体现了我想帮助你的内心。
我真的不了解这种情形和其他情形下你怎么想。
我需要学习。', '本文写于5月28日。
终于考完期末了，补一下之前写的东西。
还不知道结果，希望能好一点吧。
我讨厌物理学史和数学必修三。
 上周，和你的闺蜜谈人生——一些关于你的事情。
起因是这样的，Q找到我，先是问我打不打算追你。我说，不。她又告诉我，有一个男生连续两天给你买早饭，她很愤慨。我只是“哦”了一声。
她一走我就后悔了——她会不会认为我对你是不是真爱啦，我对你是不是真爱啊，我选择不追你对不对啊。我想了一整天，努力证明“排他性是爱情的要素”，还归纳出一个爱情的模型——当然是错的。
我想到，我近日几次借给L手机，她不向我借的时候我甚至有些期待。我觉得这种念头是罪恶的，我应当保持我对你和L不同类型的感情的纯洁性。我怀疑我是否真的喜欢你，思考我是否应当用洗脑的方式维持我的喜欢。
我怀疑我选择不追求你的正确性。我想和你在一起，又害怕伤害了你，因为让你卷入自己不感兴趣的事件是不好的。我有过去的经历，它告诉我追求你必定会让你不愉快。
我甚至脑洞大到怀疑Q的问题是不是对我的测试。
于是，我在晚上和Q谈了人生。
Q说，我应该为你做些什么。我说，我怕这会影响你。她又说，做一些小事，你不会发觉的。
我心里一惊。是的，为你做一些小事——比帮你买早餐更小——并不会让你困扰。我有些过分简化爱情和扩大行为了。
爱情是什么呢？我认为，它是一种建立在友情基础之上的更深入的感情，它需要双方对彼此的承担。我有些畏手畏脚，这反而是错误的。
我应该去接触、帮助你。
但在实际去做的时候还是很茫然。
就比如说你有一天因为学校停水洗不了苹果，我就那么看着，什么都没做。当时我手里有两个选择——用男厕所的存水洗，但是有些脏，或者用自己寝室的存水洗，但是可能来不及。于是我想，两个方案都不好，我不如不做。
一阵之后我就后悔了。我本应向你陈述两个方案，也许你会答应其中一个，哪怕没有答应，也体现了我想帮助你的内心。
我真的不了解这种情形和其他情形下你怎么想。
我需要学习。<p><a href="https://xfox.me/post/2015-07-16-%E6%97%A0%E7%9F%A5%E6%97%A0%E5%8A%9B%E6%97%A0%E6%8E%AA-21/">查看原文</a></p>', '2018-05-30 07:06:14.824369+08', '2018-05-30 16:18:38.935154+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('009beace-9bf4-4329-9676-ad4e9f1adc5b', true, '[小傅Fox的日常]中国将下架应用市场非实名应用', '根据网络安全法第二十四条，对第三方开发者最友好的应用市场酷安日前宣布，其将下架全部非认证开发者提交的应用，包括此前其编辑从 Google Play 上精选的应用。酷安方面还建议注册开发者绑定手机号完成实名认证，并指出，腾讯等企业也将在酷安完成开发者认证，并且所有国内的应用市场都将采取相似的举措。
分析指出，此举可能缘于有关部门将「提供信息发布」解读为包括发布应用。这将进一步压缩独立开发者的生存空间。此前，新闻出版广播电视总局曾要求手机游戏开发者通过复杂苛刻的程序申请出版许可。', '根据网络安全法第二十四条，对第三方开发者最友好的应用市场酷安日前宣布，其将下架全部非认证开发者提交的应用，包括此前其编辑从 Google Play 上精选的应用。酷安方面还建议注册开发者绑定手机号完成实名认证，并指出，腾讯等企业也将在酷安完成开发者认证，并且所有国内的应用市场都将采取相似的举措。
分析指出，此举可能缘于有关部门将「提供信息发布」解读为包括发布应用。这将进一步压缩独立开发者的生存空间。此前，新闻出版广播电视总局曾要求手机游戏开发者通过复杂苛刻的程序申请出版许可。<p><a href="https://xfox.me/post/2017-05-20-%E4%B8%AD%E5%9B%BD%E5%B0%86%E4%B8%8B%E6%9E%B6%E5%BA%94%E7%94%A8%E5%B8%82%E5%9C%BA%E9%9D%9E%E5%AE%9E%E5%90%8D%E5%BA%94%E7%94%A8/">查看原文</a></p>', '2018-05-30 07:06:14.858058+08', '2018-05-30 16:18:38.776644+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('08aee4bd-dd38-46a4-b0bf-ebd0a6ea8cd0', true, '[小傅Fox的日常]从“我”一词谈人的社会追求', '本文作于2014年10月15日第三节晚自习。此处有改动。
本文是为语文课演讲而作的，但是也是谈一下自己长期以来关于哲学的思考。
 之前几位男同学说的都是自己，我来开一个脑洞。众所周知，哲学上有三个经典问题，“我是谁”，“我从哪里来”，“我到哪里去”。我今天所讨论的就是“我到哪里去”，当然这里只是一点自己的看法了。
所谓“到哪里去”，指的就是人的生命追求。我们必须知道向何而生，才能知道如何去生。亚里士多德认为，我们是向幸福而生；也有人认为，我们是向死而生；而我认为，我们是为了被社会肯定而生的，但是也有另外一种更高的境界，就是不在乎是否被社会肯定，为了自己内心的愉悦而生。
什么是“被社会肯定”呢？我们平时谈的“考上好大学”“找到好工作”就是，因为这里的“好”是指向社会的认可的。国家动荡的年代，“听党话，跟党走”就是“好”；和平发展的年代，高薪稳定、投入少回报多就是“好”；风云变幻的年代，图谋改革、变轨迎新就是“好”。这里的“好”是得到了社会主流价值观或圈层主流价值观的赞许的，是得到周围人的普遍认可和羡慕的。这种生活目标的核心是自觉或不自觉地迎合普遍的心理。
那么什么又是“不在乎”呢？它某种程度上就是叛逆，我们要有自己的生活方式和自己的态度，不需要在乎周围人的目光，所谓“率性”大概就是这样。陶渊明的“户庭无尘杂，虚室有余闲”，刘禹锡的“斯是陋室，惟吾德馨”；刘禹锡不在乎“高”“深”，而是在乎“仙”“龙”；陶渊明不在乎“五斗米”，而是在乎“折腰”，本来可以在官场有所作为而放弃为官去追求自身修养；这都生动地体现了“不在乎”。', '本文作于2014年10月15日第三节晚自习。此处有改动。
本文是为语文课演讲而作的，但是也是谈一下自己长期以来关于哲学的思考。
 之前几位男同学说的都是自己，我来开一个脑洞。众所周知，哲学上有三个经典问题，“我是谁”，“我从哪里来”，“我到哪里去”。我今天所讨论的就是“我到哪里去”，当然这里只是一点自己的看法了。
所谓“到哪里去”，指的就是人的生命追求。我们必须知道向何而生，才能知道如何去生。亚里士多德认为，我们是向幸福而生；也有人认为，我们是向死而生；而我认为，我们是为了被社会肯定而生的，但是也有另外一种更高的境界，就是不在乎是否被社会肯定，为了自己内心的愉悦而生。
什么是“被社会肯定”呢？我们平时谈的“考上好大学”“找到好工作”就是，因为这里的“好”是指向社会的认可的。国家动荡的年代，“听党话，跟党走”就是“好”；和平发展的年代，高薪稳定、投入少回报多就是“好”；风云变幻的年代，图谋改革、变轨迎新就是“好”。这里的“好”是得到了社会主流价值观或圈层主流价值观的赞许的，是得到周围人的普遍认可和羡慕的。这种生活目标的核心是自觉或不自觉地迎合普遍的心理。
那么什么又是“不在乎”呢？它某种程度上就是叛逆，我们要有自己的生活方式和自己的态度，不需要在乎周围人的目光，所谓“率性”大概就是这样。陶渊明的“户庭无尘杂，虚室有余闲”，刘禹锡的“斯是陋室，惟吾德馨”；刘禹锡不在乎“高”“深”，而是在乎“仙”“龙”；陶渊明不在乎“五斗米”，而是在乎“折腰”，本来可以在官场有所作为而放弃为官去追求自身修养；这都生动地体现了“不在乎”。<p><a href="https://xfox.me/post/2015-02-10-%E4%BB%8E%E6%88%91%E4%B8%80%E8%AF%8D%E8%B0%88%E4%BA%BA%E7%9A%84%E7%A4%BE%E4%BC%9A%E8%BF%BD%E6%B1%82-46/">查看原文</a></p>', '2018-05-30 07:06:14.793475+08', '2018-05-30 16:18:43.475938+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('b224192c-3702-4fa6-8195-3ee486626b9c', true, '[小傅Fox的日常]严复的名句', '<p><a href="https://xfox.me/post/2016-03-28--6/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2016-03-28--6/">查看原文</a></p>', '2018-05-30 07:06:14.842884+08', '2018-05-30 16:18:38.860027+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('328bc738-18ea-4b5d-8a5a-b46d04e71234', true, '[小傅Fox的日常]日常瞎拍', '<p><a href="https://xfox.me/post/2015-02-13--39/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2015-02-13--39/">查看原文</a></p>', '2018-05-30 07:06:14.8028+08', '2018-05-30 16:18:39.031009+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d614eea8-b879-4535-8f41-4d75c240d8c5', true, '[小傅Fox的日常]我的2016', '发现自己和曾经的同伴渐行渐远，走向堕落和平凡的生活。
看你们说自己要去剑桥、东大、清华，看着自己高中的成绩单，不禁反问自己，你当初的才华与梦想在哪里。
我也曾是 top student。
我也曾坚定地认为理想的大学不在话下。
而我现在在荒谬的过去与现在的联系中自慰。
我正在懊悔于过去那个自卑的自己、颓唐的自己。
我现在正走向和你们不同的道路。
或许，是时候努力了呢。
或许，现在也不太晚呢。
我将去争取我所能获取的一切，我将去学习我所能了解的一切，我将去燃烧我所能燃烧的一切。
我将不再从虚无中寻找慰藉。
我将不再走向堕落。
我将尽力去保持自己心中的阳光。
人生很长，而我的年华刚刚开始。', '发现自己和曾经的同伴渐行渐远，走向堕落和平凡的生活。
看你们说自己要去剑桥、东大、清华，看着自己高中的成绩单，不禁反问自己，你当初的才华与梦想在哪里。
我也曾是 top student。
我也曾坚定地认为理想的大学不在话下。
而我现在在荒谬的过去与现在的联系中自慰。
我正在懊悔于过去那个自卑的自己、颓唐的自己。
我现在正走向和你们不同的道路。
或许，是时候努力了呢。
或许，现在也不太晚呢。
我将去争取我所能获取的一切，我将去学习我所能了解的一切，我将去燃烧我所能燃烧的一切。
我将不再从虚无中寻找慰藉。
我将不再走向堕落。
我将尽力去保持自己心中的阳光。
人生很长，而我的年华刚刚开始。<p><a href="https://xfox.me/post/2016-12-30-%E6%88%91%E7%9A%842016-3/">查看原文</a></p>', '2018-05-30 07:06:14.845485+08', '2018-05-30 16:18:38.824753+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('27be2623-eca3-4ee9-864b-75b035baeb90', true, '[小傅Fox的日常]眺望', ' 本文写于2014年12月30日-2015年1月5日
 我站在窗口，眺望窗外。
一年前，也是冬日，我也曾眺望。
是为了冷静自己啊，是为了反思过去啊，是为了迎接未来。
我看见过闹市区车流如梭，人群涌过街道。
我也曾看见，灯光在独自闪烁。
我也曾看不见。
我站在窗口，身后是嘈杂的教室。
我渴望宁静，又厌恶宁静。
我看见一个自己，在和同学嬉笑着。
我看见一个自己，在座位上独自坐着。
我看见一个自己，在窗口静静思考。
我盼望欢笑的时光，又厌恶欢笑的自己。
我和人群一样，都是丑陋的。
 努力成为一个高冷的人~
 ', ' 本文写于2014年12月30日-2015年1月5日
 我站在窗口，眺望窗外。
一年前，也是冬日，我也曾眺望。
是为了冷静自己啊，是为了反思过去啊，是为了迎接未来。
我看见过闹市区车流如梭，人群涌过街道。
我也曾看见，灯光在独自闪烁。
我也曾看不见。
我站在窗口，身后是嘈杂的教室。
我渴望宁静，又厌恶宁静。
我看见一个自己，在和同学嬉笑着。
我看见一个自己，在座位上独自坐着。
我看见一个自己，在窗口静静思考。
我盼望欢笑的时光，又厌恶欢笑的自己。
我和人群一样，都是丑陋的。
 努力成为一个高冷的人~
 <p><a href="https://xfox.me/post/2015-01-30-%E7%9C%BA%E6%9C%9B-49/">查看原文</a></p>', '2018-05-30 07:06:14.7755+08', '2018-05-30 16:18:43.539761+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('7c687254-b027-479b-b83a-cec67265748c', true, '[小傅Fox的日常]几篇短文', '下三篇很短，写于4月16日和27日。
 1.歌
穿着白色连衣长裙的少女赤足坐在海上孤独的岩石上。
风吹起她的长发，她用双手轻顺头发，唱起了歌：
大海的波浪，随我去梦想啊……
她一直唱着，不知疲倦地唱着。
2.线条
在一个空间里，随机的放上几个点光源。
给它们随意的速度和颜色。
一放手，便溅意出炫丽的光影。
3.海鸥
在阴云密布的天空下，
在波涛汹涌的大海上，
有一只海鸥在飞翔着。
它被陆地上的笛声吸引，飞翔丛林，
但每每在海的边缘，它被闪电击中。
它只能拖着焦黑的羽毛盘旋着。', '下三篇很短，写于4月16日和27日。
 1.歌
穿着白色连衣长裙的少女赤足坐在海上孤独的岩石上。
风吹起她的长发，她用双手轻顺头发，唱起了歌：
大海的波浪，随我去梦想啊……
她一直唱着，不知疲倦地唱着。
2.线条
在一个空间里，随机的放上几个点光源。
给它们随意的速度和颜色。
一放手，便溅意出炫丽的光影。
3.海鸥
在阴云密布的天空下，
在波涛汹涌的大海上，
有一只海鸥在飞翔着。
它被陆地上的笛声吸引，飞翔丛林，
但每每在海的边缘，它被闪电击中。
它只能拖着焦黑的羽毛盘旋着。<p><a href="https://xfox.me/post/2015-04-30-%E5%87%A0%E7%AF%87%E7%9F%AD%E6%96%87-26/">查看原文</a></p>', '2018-05-30 07:06:14.813912+08', '2018-05-30 16:18:38.981562+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('b583d0ac-90b8-49de-b880-65c7300f0926', true, '[小傅Fox的日常]写在高考之前', '以前看着考生，现在我就是考生。
曾经对抗争招生计划不均等的人嗤之以鼻，而现在能够理解。
很多以前无法想象的事情，现在都亲自经历过了，也才明白其中的泪与欢笑。
愿一切的一切，都如你我的梦那样。', '以前看着考生，现在我就是考生。
曾经对抗争招生计划不均等的人嗤之以鼻，而现在能够理解。
很多以前无法想象的事情，现在都亲自经历过了，也才明白其中的泪与欢笑。
愿一切的一切，都如你我的梦那样。<p><a href="https://xfox.me/post/2017-06-06-%E5%86%99%E5%9C%A8%E9%AB%98%E8%80%83%E4%B9%8B%E5%89%8D/">查看原文</a></p>', '2018-05-30 07:06:14.858851+08', '2018-05-30 16:18:38.78082+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('6cb59613-ab7e-4530-bb1f-0fc848f7a75b', true, '[小傅Fox的日常]归往何方', '本文是今年4月21日写下的，补录。
 少年继续在这座城市的街道上前行着。
他是谁，从何而来，又要归往何方。
城市中闪烁的灯光不能阻止他的脚步，摇摆的人群不能阻止他的脚步。他是这座繁华都市中的独行者，他来自远方，也要归往远方。
他穿行着，穿过无数个繁杂的十字路口。
他穿行着，穿过无数个交错的立交桥下。
他穿行着，穿过无数个喧哗的居民区。
他是那样地与人群格格不入，但这座城市宛如一片海洋，他只得淹没其中。没有人注意到他，他与其他陌生的、擦肩而过的行人没有什么两样。
他走出了这座城市，又走入了那座城市。
他走出了这个谜团，又走入了那个谜团。
一切朦胧，无处清晰。
何处去寻何处归。', '本文是今年4月21日写下的，补录。
 少年继续在这座城市的街道上前行着。
他是谁，从何而来，又要归往何方。
城市中闪烁的灯光不能阻止他的脚步，摇摆的人群不能阻止他的脚步。他是这座繁华都市中的独行者，他来自远方，也要归往远方。
他穿行着，穿过无数个繁杂的十字路口。
他穿行着，穿过无数个交错的立交桥下。
他穿行着，穿过无数个喧哗的居民区。
他是那样地与人群格格不入，但这座城市宛如一片海洋，他只得淹没其中。没有人注意到他，他与其他陌生的、擦肩而过的行人没有什么两样。
他走出了这座城市，又走入了那座城市。
他走出了这个谜团，又走入了那个谜团。
一切朦胧，无处清晰。
何处去寻何处归。<p><a href="https://xfox.me/post/2014-12-14-%E5%BD%92%E5%BE%80%E4%BD%95%E6%96%B9-55/">查看原文</a></p>', '2018-05-30 07:06:14.775107+08', '2018-05-30 16:18:43.50772+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('a4be3e20-b145-4cb9-bd9d-32ea50a5bf91', true, ' 快递 yunda-1600887249033 有新动态', '[河南郑州公司]进行下级地点扫描，将发往：辽宁沈阳网点包', '[河南郑州公司]进行下级地点扫描，将发往：辽宁沈阳网点包', '2018-05-30 07:06:09.423281+08', '2018-05-30 16:18:43.684558+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('117a59a6-3100-4f60-83c4-50a08a60ec61', true, '[小傅Fox的日常]The Design of a New REST API Framework in Node.js', '<h2 id="abstract">Abstract</h2>

<p>I am working on <a href="https://github.com/SANDRAProject">Sandra</a> as a backend engineer, constructing a full-restified API. I found Koa is quite a satisfying solution, but not enough. As known to all, REST specification utilizes a set of HTTP features to accomplish schematic features. A good case in point is that if the client requests with <code>Accept: application/json</code>, then the server is expected to return a JSON content. However, in Koa, such features should be implemented on my own, and no other frameworks, even the Hapi, provides a simple enough API to fulfill the requirement. So I have decided to develop my own REST API framework, <em>Ulla</em>, both resolving such problem and utilizing the decorator features in TypeScript.</p>

<p></p>', '<h2 id="abstract">Abstract</h2>

<p>I am working on <a href="https://github.com/SANDRAProject">Sandra</a> as a backend engineer, constructing a full-restified API. I found Koa is quite a satisfying solution, but not enough. As known to all, REST specification utilizes a set of HTTP features to accomplish schematic features. A good case in point is that if the client requests with <code>Accept: application/json</code>, then the server is expected to return a JSON content. However, in Koa, such features should be implemented on my own, and no other frameworks, even the Hapi, provides a simple enough API to fulfill the requirement. So I have decided to develop my own REST API framework, <em>Ulla</em>, both resolving such problem and utilizing the decorator features in TypeScript.</p>

<p></p><p><a href="https://xfox.me/post/2017-08-05-the-design-of-a-new-rest-api-framework-in-node-js/">查看原文</a></p>', '2018-05-30 07:06:14.853949+08', '2018-05-30 16:18:38.730236+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('cda419d7-ef6f-4ad1-973c-74c18f28467a', true, '[小傅Fox的日常]博客迁移说明', '大概因为 LoftER 没法绑定独立域名以及用户体验越来越烂等等原因，博客迁移至 https://xfox.pw 。
基于 RSS 的订阅模式真爽（逃', '大概因为 LoftER 没法绑定独立域名以及用户体验越来越烂等等原因，博客迁移至 https://xfox.pw 。
基于 RSS 的订阅模式真爽（逃<p><a href="https://xfox.me/post/2017-01-26-%E5%8D%9A%E5%AE%A2%E8%BF%81%E7%A7%BB%E8%AF%B4%E6%98%8E-1/">查看原文</a></p>', '2018-05-30 07:06:14.839177+08', '2018-05-30 16:18:38.904112+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('7e05d7e5-baf6-44a9-9abb-f2da9b403f4a', true, '[小傅Fox的日常]感谢知乎', '知乎上有很多非常棒的亲身经历的回答.
 【如何看待「山东招远麦当劳女子被殴致死」事件？】人鱼池：2003年，我上初中。由于一些事情，耽误了最好的“活动”时期，我进不了当地的任何一所比较好的学校，最后没办法，只能去升学率最低并且治安最不好一所“痞子”…… http://zhi.hu/4JFi （分享自知乎网）
 一般,在我无所事事的时候,我会去看知乎,选择一个话题,然后去看那些人的那些事.有亲身的,也有转述的.
感谢这些人的用心回答,让我明白了,
 性侵犯在中国比较普遍和不为人知
 看待问题理性和激情同样重要
 要换位思考体谅他人
 &hellip;&hellip;
  作为一个UGC社区,知乎成功了.它成功吸引了大量的人来创造优质内容.娱乐性和严肃性并存.
可惜我进入知乎太晚.在知乎,我收获了人生道理,同样也有学科知识.
感谢知乎,我了解了更多的哲学,人生观,等等&hellip;&hellip;', '知乎上有很多非常棒的亲身经历的回答.
 【如何看待「山东招远麦当劳女子被殴致死」事件？】人鱼池：2003年，我上初中。由于一些事情，耽误了最好的“活动”时期，我进不了当地的任何一所比较好的学校，最后没办法，只能去升学率最低并且治安最不好一所“痞子”…… http://zhi.hu/4JFi （分享自知乎网）
 一般,在我无所事事的时候,我会去看知乎,选择一个话题,然后去看那些人的那些事.有亲身的,也有转述的.
感谢这些人的用心回答,让我明白了,
 性侵犯在中国比较普遍和不为人知
 看待问题理性和激情同样重要
 要换位思考体谅他人
 &hellip;&hellip;
  作为一个UGC社区,知乎成功了.它成功吸引了大量的人来创造优质内容.娱乐性和严肃性并存.
可惜我进入知乎太晚.在知乎,我收获了人生道理,同样也有学科知识.
感谢知乎,我了解了更多的哲学,人生观,等等&hellip;&hellip;<p><a href="https://xfox.me/post/2014-06-04-%E6%84%9F%E8%B0%A2%E7%9F%A5%E4%B9%8E-74/">查看原文</a></p>', '2018-05-30 07:06:14.750543+08', '2018-05-30 16:18:43.603316+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('aeb0a9b7-da23-490f-ac7f-69b155211e87', true, '[小傅Fox的日常]你如阳光', '本文写于2014年12月14日。
刚才编辑的时候不小心对Chrome按了Cmd+Q……
写下的时间也比较长了……
 每一次见到你，都会想到阳光。一个阳光一样的女孩。
纯洁的面孔，你的名字，*****，也正契合着这些特点。
阳光多美。那初升的红日，充满了活力与气息；
正午的太阳，温暖大地；
而落日，亦以别样的姿态，染红了天空。
无论是红色的还是白色的，无论是刺眼的亦或温和的，都是这世界上最振奋人心的部分。
它是活力。
它是激情。
它是触动万物之心的钥匙。
它拥有的是美。
你如阳光，让我生命燃起新的光芒。
你如阳光，使我坚信，光明就在远方。
你如阳光，使我又向往满山遍野花开时。
你如阳光，照亮了我内心有过的黑暗。
你如阳光。', '本文写于2014年12月14日。
刚才编辑的时候不小心对Chrome按了Cmd+Q……
写下的时间也比较长了……
 每一次见到你，都会想到阳光。一个阳光一样的女孩。
纯洁的面孔，你的名字，*****，也正契合着这些特点。
阳光多美。那初升的红日，充满了活力与气息；
正午的太阳，温暖大地；
而落日，亦以别样的姿态，染红了天空。
无论是红色的还是白色的，无论是刺眼的亦或温和的，都是这世界上最振奋人心的部分。
它是活力。
它是激情。
它是触动万物之心的钥匙。
它拥有的是美。
你如阳光，让我生命燃起新的光芒。
你如阳光，使我坚信，光明就在远方。
你如阳光，使我又向往满山遍野花开时。
你如阳光，照亮了我内心有过的黑暗。
你如阳光。<p><a href="https://xfox.me/post/2015-01-30-%E4%BD%A0%E5%A6%82%E9%98%B3%E5%85%89-50/">查看原文</a></p>', '2018-05-30 07:06:14.798488+08', '2018-05-30 16:18:39.051179+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('b1a2fc4e-e3e9-44d8-ab4c-6e6fd77a70aa', true, '[小傅Fox的日常]电子科技社团挖掘机建造赛', '本活动由新航道独家赞助。
本活动旨在传播Minecraft并发挥同学们的创新精神。
本次活动已经圆满结束，关于提交存档的测评结果及存档下载请访问这里~
要求
 像挖掘机
 不包含区块强制加载器
 允许mod，使用mod的玩家请附加mod的安装说明和相应文件，mod依赖的Minecraft版本必须在1.6.4~1.8之间
 游戏版本，PC版不高于1.8，手机版不高于0.10.0，不允许其他终端
  评分标准
 对于60%的数据，其外观必须类似挖掘机
 对于80%的数据，美观性将被考虑
 对于100%的数据，其必须可以移动
 对于150%的数据，其应具有个人特色
 对于300%的数据，其应当具有特别的创新特点
  提交时间
第一次提交：2014年12月6日
第二次提交：2015年1月3日12:00前
提交方式
将存档文件夹以zip格式，UTF8编码，文件名不包含中文字符，发送到752812111@qq.com。
你也可以上交包含存档文件夹的存储器到1402赵翔宇处。
电子科技社团
2014年12月05日', '本活动由新航道独家赞助。
本活动旨在传播Minecraft并发挥同学们的创新精神。
本次活动已经圆满结束，关于提交存档的测评结果及存档下载请访问这里~
要求
 像挖掘机
 不包含区块强制加载器
 允许mod，使用mod的玩家请附加mod的安装说明和相应文件，mod依赖的Minecraft版本必须在1.6.4~1.8之间
 游戏版本，PC版不高于1.8，手机版不高于0.10.0，不允许其他终端
  评分标准
 对于60%的数据，其外观必须类似挖掘机
 对于80%的数据，美观性将被考虑
 对于100%的数据，其必须可以移动
 对于150%的数据，其应具有个人特色
 对于300%的数据，其应当具有特别的创新特点
  提交时间
第一次提交：2014年12月6日
第二次提交：2015年1月3日12:00前
提交方式
将存档文件夹以zip格式，UTF8编码，文件名不包含中文字符，发送到752812111@qq.com。
你也可以上交包含存档文件夹的存储器到1402赵翔宇处。
电子科技社团
2014年12月05日<p><a href="https://xfox.me/post/2014-11-28-%E7%94%B5%E5%AD%90%E7%A7%91%E6%8A%80%E7%A4%BE%E5%9B%A2%E6%8C%96%E6%8E%98%E6%9C%BA%E5%BB%BA%E9%80%A0%E8%B5%9B-57/">查看原文</a></p>', '2018-05-30 07:06:14.757432+08', '2018-05-30 16:18:43.542766+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('a2383961-6f07-42ba-a0ff-ee80628b525e', true, '[小傅Fox的日常]审美也许有变化？', '本文部分基于4月28日随笔《阳光里的温婉》。
 0.阳光里的温婉
一直想知道有阳光气息的你穿上校服蓝色衬衫是什么样子。
今天看见，很意外。
充满了一种温婉的气息。
和原来的气质完全不一样了。
觉得有些奇怪，但是觉得也是有别样的美的。
1.审美？
本以为审美是不会变的。
初一的时候认为，帆布鞋是最好看的，运动鞋就是渣渣。
初二的时候认为，蘑菇头是最好看的发型。
初三发现，其实运动鞋也挺好看，发型要看人。
高一上认为，New Balance丑爆。
高一下发现，色调饱和度低一点的NB还可以。
也许审美是随着自己喜欢的人变得，随着自己喜欢的人的穿着变。
2.气质
喜欢上SG是因为她阳光的气息，但是实际上，温婉可爱的气质对她也不错。
也许是就是喜欢上了她这个人。', '本文部分基于4月28日随笔《阳光里的温婉》。
 0.阳光里的温婉
一直想知道有阳光气息的你穿上校服蓝色衬衫是什么样子。
今天看见，很意外。
充满了一种温婉的气息。
和原来的气质完全不一样了。
觉得有些奇怪，但是觉得也是有别样的美的。
1.审美？
本以为审美是不会变的。
初一的时候认为，帆布鞋是最好看的，运动鞋就是渣渣。
初二的时候认为，蘑菇头是最好看的发型。
初三发现，其实运动鞋也挺好看，发型要看人。
高一上认为，New Balance丑爆。
高一下发现，色调饱和度低一点的NB还可以。
也许审美是随着自己喜欢的人变得，随着自己喜欢的人的穿着变。
2.气质
喜欢上SG是因为她阳光的气息，但是实际上，温婉可爱的气质对她也不错。
也许是就是喜欢上了她这个人。<p><a href="https://xfox.me/post/2015-04-30-%E5%AE%A1%E7%BE%8E%E4%B9%9F%E8%AE%B8%E6%9C%89%E5%8F%98%E5%8C%96-27/">查看原文</a></p>', '2018-05-30 07:06:14.806447+08', '2018-05-30 16:18:39.019661+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('16bf1e41-5b55-4820-b50b-8ecd34d67ee1', true, '[小傅Fox的日常]日记', ' 这是6月3日的日记。
RIP to the next day.
 0.何为爱情
——《姐姐的墓园》读后感
这本书不是一本“好”小说，在情节安排上有过度集中的问题，除了不幸没有别的；缺乏一定的真实性，过分强调了爱情不幸了流言伤人；其中的部分语言也不真实，有夸大矛盾和堆砌辞藻的问题，同时对对话中暗含的思想的外在体现表现又不够。
但这不重要，我在这里写我联想到的。
小说中的上官明亮，强暴了姐姐，又为了姐姐的谎言等待了一生。他是可恨的，同时也是可悲的。他盼望爱情，对于一位女性有好感，这无可非议；但是他由于其错误的爱情观，采取了错误的方法来追求女性。
他认为爱情是靠追求得到的，这不对。爱情是双方的彼此关心。要取得爱情，就必须增进互相了解，为另一方承担责任。
1.论高跟鞋
合唱服装，女生是裙子配高跟鞋。
反感。倒不是说丑，而是反对传统的对于两性的观点。似乎在人们的印象里，女性的符号就是裙子和高跟鞋。
这不对。这导致了一个现象：不仅仅是决策者，甚至是女性本身都认为，女性出席正式性场合的服装就是裙子配高跟鞋。
上个世纪，有人说，高跟鞋成为时尚是女权的表现。
不对。这是男性物化女性的体现。
第一，有人说高跟鞋可以让女性更美。那么是什么方面的美呢？是腿长和身高的比值，据信这一比例为0.618时人看起来最美。那么似乎这一规律是对全人类适用的，为什么偏偏女性和高跟鞋扯上了关系呢？
又有人说，高跟鞋可以增加身高。但事实上，并非女性有增加身高的需求，人类也并不一定要增加身高。
高跟鞋其本质是男性支配女性的工具，是男权的体现。由于男性对于女性腿部、足部的幻想和欲望，处于支配地位的男性发明了高跟鞋，并竭力宣传其对于女性美的提升，然而这种美感是建立在男性审美基础上的，这不是一种去性别化的审美。
女性并不享受穿着高跟鞋的过程。穿着久站，由于其对脚部支持点的集中和倾斜的支撑面，穿着者的脚步负担很重，甚至可能导致脚部骨骼变形。穿着行动，同样由于以上两点，人体对重心的控制并不如平底鞋一样精准，因此速度不快而且容易跌倒。
综上，高跟鞋不应当成为女性符号。
2.论女神
女神在合唱排练的时候穿着高跟鞋站久了会痛。
好想帮她。
也许可以用语言去关心她，可是我和她不熟。
不知道该怎么办。
 评论区： 小傅Fox： thx [2015-07-18 17:21:52]
博客没有名称： 。放开点少年，不过分追求她不会觉得你讨厌的 不熟可以慢慢聊天 还有两年呢 [2015-07-18 17:12:38]
 ', ' 这是6月3日的日记。
RIP to the next day.
 0.何为爱情
——《姐姐的墓园》读后感
这本书不是一本“好”小说，在情节安排上有过度集中的问题，除了不幸没有别的；缺乏一定的真实性，过分强调了爱情不幸了流言伤人；其中的部分语言也不真实，有夸大矛盾和堆砌辞藻的问题，同时对对话中暗含的思想的外在体现表现又不够。
但这不重要，我在这里写我联想到的。
小说中的上官明亮，强暴了姐姐，又为了姐姐的谎言等待了一生。他是可恨的，同时也是可悲的。他盼望爱情，对于一位女性有好感，这无可非议；但是他由于其错误的爱情观，采取了错误的方法来追求女性。
他认为爱情是靠追求得到的，这不对。爱情是双方的彼此关心。要取得爱情，就必须增进互相了解，为另一方承担责任。
1.论高跟鞋
合唱服装，女生是裙子配高跟鞋。
反感。倒不是说丑，而是反对传统的对于两性的观点。似乎在人们的印象里，女性的符号就是裙子和高跟鞋。
这不对。这导致了一个现象：不仅仅是决策者，甚至是女性本身都认为，女性出席正式性场合的服装就是裙子配高跟鞋。
上个世纪，有人说，高跟鞋成为时尚是女权的表现。
不对。这是男性物化女性的体现。
第一，有人说高跟鞋可以让女性更美。那么是什么方面的美呢？是腿长和身高的比值，据信这一比例为0.618时人看起来最美。那么似乎这一规律是对全人类适用的，为什么偏偏女性和高跟鞋扯上了关系呢？
又有人说，高跟鞋可以增加身高。但事实上，并非女性有增加身高的需求，人类也并不一定要增加身高。
高跟鞋其本质是男性支配女性的工具，是男权的体现。由于男性对于女性腿部、足部的幻想和欲望，处于支配地位的男性发明了高跟鞋，并竭力宣传其对于女性美的提升，然而这种美感是建立在男性审美基础上的，这不是一种去性别化的审美。
女性并不享受穿着高跟鞋的过程。穿着久站，由于其对脚部支持点的集中和倾斜的支撑面，穿着者的脚步负担很重，甚至可能导致脚部骨骼变形。穿着行动，同样由于以上两点，人体对重心的控制并不如平底鞋一样精准，因此速度不快而且容易跌倒。
综上，高跟鞋不应当成为女性符号。
2.论女神
女神在合唱排练的时候穿着高跟鞋站久了会痛。
好想帮她。
也许可以用语言去关心她，可是我和她不熟。
不知道该怎么办。
 评论区： 小傅Fox： thx [2015-07-18 17:21:52]
博客没有名称： 。放开点少年，不过分追求她不会觉得你讨厌的 不熟可以慢慢聊天 还有两年呢 [2015-07-18 17:12:38]
 <p><a href="https://xfox.me/post/2015-07-18-%E6%97%A5%E8%AE%B0-19/">查看原文</a></p>', '2018-05-30 07:06:14.819298+08', '2018-05-30 16:18:38.987948+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('10ae3a09-3a63-442a-aa12-4694252073d7', true, '[小傅Fox的日常]柴静的《看见》', '今天下午看了柴静的《看见》，改变了我由于《穹顶之下》对于柴静的偏见。
有一些东西，比如说自由的概念、法制的概念，我还是需要学习的。
我读书的时候，几次不寒而栗。我又想说：
 我们必须承认，这确确实实地发生在中国的土地上。
也许父母都是城市中产阶级的我们很少接触到这些故事。
 这些故事离我们很远，也很近。
这让我对中国失去信心，又收获信心。
也许，一代人不够，两代人不够，但我相信，在几代人的努力下，我国会成为一个伟大的国家。', '今天下午看了柴静的《看见》，改变了我由于《穹顶之下》对于柴静的偏见。
有一些东西，比如说自由的概念、法制的概念，我还是需要学习的。
我读书的时候，几次不寒而栗。我又想说：
 我们必须承认，这确确实实地发生在中国的土地上。
也许父母都是城市中产阶级的我们很少接触到这些故事。
 这些故事离我们很远，也很近。
这让我对中国失去信心，又收获信心。
也许，一代人不够，两代人不够，但我相信，在几代人的努力下，我国会成为一个伟大的国家。<p><a href="https://xfox.me/post/2015-04-24-%E6%9F%B4%E9%9D%99%E7%9A%84%E7%9C%8B%E8%A7%81-29/">查看原文</a></p>', '2018-05-30 07:06:14.813081+08', '2018-05-30 16:18:39.000452+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('17fcf485-cced-4c1a-980c-7e5c55371256', false, '[小傅Fox的日常]1 那天的歌声和娇小的少女一直印在我的脑海里', ' 终于开始填坑了~
本章在一个月之前就写完了，因为准备参加比赛的项目一直没有录入。
前文：无
后文：等待填坑
 开学前一个阳光明媚的午后，我低头玩着手机，走在街上。周围传来鹦鹉的叫声和小贩的叫卖，有些许凉爽的微风吹到脸上。
这是一年中最美好的季节，有蓝天、白云、雨露。我怀着开心的、充满阳光的心态向前走去，忽然听到了一个少女轻柔的哼唱声——
 如今一个人听歌总是会觉得寂寞，幻听你……
 我抬头循声看去，一个同样低头玩着手机的女孩向我走来——再有一秒，我绝对会撞上她。
然后，她倒坐在地上，而我晃了几下，最终站稳了。
我不假思索地向她伸手，想把她拉起：“你没事吧？”
多么真诚的举动，可她自己站了起来，对我骂道：“走路不看人啊？”
——说得好像你就看了路一样。
我发现她还很漂亮，留着过耳的短发，上半身紧身紫色T恤，下身深蓝牛仔热裤，一双黑白粘扣的帆布鞋，不仅长相可人而且穿着搭配也很棒。
在我盯着她看的同时，她拍了拍土，继续向前走去。
我们擦身而过的一瞬间，似乎有淡淡的梨花香飘来。
我们小区没有梨花吧，季节也不对吧？
声音和香味渐行渐远，我转身望向她的背影。一阵风吹过，拂动了她的栗色头发和小区里正绿的柳枝，杨树叶发出沙沙的声音。
多美的一个夏天午后。
 评论区： 博客没有名称： 看到漂亮的女孩子出场我好激动啊 [2015-05-16 15:23:55]
 ', ' 终于开始填坑了~
本章在一个月之前就写完了，因为准备参加比赛的项目一直没有录入。
前文：无
后文：等待填坑
 开学前一个阳光明媚的午后，我低头玩着手机，走在街上。周围传来鹦鹉的叫声和小贩的叫卖，有些许凉爽的微风吹到脸上。
这是一年中最美好的季节，有蓝天、白云、雨露。我怀着开心的、充满阳光的心态向前走去，忽然听到了一个少女轻柔的哼唱声——
 如今一个人听歌总是会觉得寂寞，幻听你……
 我抬头循声看去，一个同样低头玩着手机的女孩向我走来——再有一秒，我绝对会撞上她。
然后，她倒坐在地上，而我晃了几下，最终站稳了。
我不假思索地向她伸手，想把她拉起：“你没事吧？”
多么真诚的举动，可她自己站了起来，对我骂道：“走路不看人啊？”
——说得好像你就看了路一样。
我发现她还很漂亮，留着过耳的短发，上半身紧身紫色T恤，下身深蓝牛仔热裤，一双黑白粘扣的帆布鞋，不仅长相可人而且穿着搭配也很棒。
在我盯着她看的同时，她拍了拍土，继续向前走去。
我们擦身而过的一瞬间，似乎有淡淡的梨花香飘来。
我们小区没有梨花吧，季节也不对吧？
声音和香味渐行渐远，我转身望向她的背影。一阵风吹过，拂动了她的栗色头发和小区里正绿的柳枝，杨树叶发出沙沙的声音。
多美的一个夏天午后。
 评论区： 博客没有名称： 看到漂亮的女孩子出场我好激动啊 [2015-05-16 15:23:55]
 <p><a href="https://xfox.me/post/2015-05-16-1-%E9%82%A3%E5%A4%A9%E7%9A%84%E6%AD%8C%E5%A3%B0%E5%92%8C%E5%A8%87%E5%B0%8F%E7%9A%84%E5%B0%91%E5%A5%B3%E4%B8%80%E7%9B%B4%E5%8D%B0%E5%9C%A8%E6%88%91%E7%9A%84%E8%84%91%E6%B5%B7%E9%87%8C-25/">查看原文</a></p>', '2018-05-30 07:06:14.821235+08', '2018-05-30 16:18:38.956023+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('841142d0-b774-45cd-8641-f84ca84be257', true, '[小傅Fox的日常]冬日', '12月9日写。
 我循着先前的脚印
一步步地走在广场浅浅的雪地中
赤红的太阳
斜射出枯黄的光
透过树的败枝
在白色上映出黄蓝的影
向前看去
远处有一位少女
亦步亦趋地愉悦地走着
北风吹斜了她的头发
她向上拉拉墨绿的围巾
又继续前行着', '12月9日写。
 我循着先前的脚印
一步步地走在广场浅浅的雪地中
赤红的太阳
斜射出枯黄的光
透过树的败枝
在白色上映出黄蓝的影
向前看去
远处有一位少女
亦步亦趋地愉悦地走着
北风吹斜了她的头发
她向上拉拉墨绿的围巾
又继续前行着<p><a href="https://xfox.me/post/2016-02-05-%E5%86%AC%E6%97%A5-9/">查看原文</a></p>', '2018-05-30 07:06:14.845697+08', '2018-05-30 16:18:38.846551+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('08b1439a-ceb6-4cbd-a484-203135724d3f', true, '[小傅Fox的日常]Sunshine Girl', '用英文瞎写一些东西练练手。水平不高，凑活着看吧。
Written on June 4th. RIP.
Typo fixed on Jan. 29th, 2016.
 Though loved by me, sunshine girl is, in one word, a mysterious person whose behavior pattern is complex and unpredictable. I still need some acknowledgement of her, thus I can know her interests better and try to get in touch with her.
Partly, she is an introverted girl, but this doesn&rsquo;t mean she is shy or she rarely talks with others.', '用英文瞎写一些东西练练手。水平不高，凑活着看吧。
Written on June 4th. RIP.
Typo fixed on Jan. 29th, 2016.
 Though loved by me, sunshine girl is, in one word, a mysterious person whose behavior pattern is complex and unpredictable. I still need some acknowledgement of her, thus I can know her interests better and try to get in touch with her.
Partly, she is an introverted girl, but this doesn&rsquo;t mean she is shy or she rarely talks with others.<p><a href="https://xfox.me/post/2015-07-18-sunshine-girl-18/">查看原文</a></p>', '2018-05-30 07:06:14.820396+08', '2018-05-30 16:18:38.959378+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('4cdec6ca-53f0-46b9-9cd8-00ac2de7a16b', true, '[小傅Fox的日常]高三随感', ' 补发
 真想现在就高考，随便去个东大什么的算了。
一周一天假期和两天是质的区别！
这个学期再也没有可以期待的内容了，当生活归于一成不变的死水，又该如何保持对未来的希冀？
有点后悔当初没有继续学信竞或是坚持出国，但我知道这种想法只是对现实的逃避，这两条道路并不能指引我走向更光明的未来。
SJTU 那么遥远，BUAA 不在我想去的城市，TJU 的 CS 又不太如意。当未来的每一个可能性都远得看不见，继续前行的动力便已不复存在。
只能得过且过地关心每一个微小的一天，期待着生活或许存在的不同。
我不想上高三。
 评论区： 瑞哥无限嚣张： 加油，别放弃 [2016-12-30 21:18:02]
MrWxt： 对不起，我没有找对时间… [2016-12-30 19:56:00]
 ', ' 补发
 真想现在就高考，随便去个东大什么的算了。
一周一天假期和两天是质的区别！
这个学期再也没有可以期待的内容了，当生活归于一成不变的死水，又该如何保持对未来的希冀？
有点后悔当初没有继续学信竞或是坚持出国，但我知道这种想法只是对现实的逃避，这两条道路并不能指引我走向更光明的未来。
SJTU 那么遥远，BUAA 不在我想去的城市，TJU 的 CS 又不太如意。当未来的每一个可能性都远得看不见，继续前行的动力便已不复存在。
只能得过且过地关心每一个微小的一天，期待着生活或许存在的不同。
我不想上高三。
 评论区： 瑞哥无限嚣张： 加油，别放弃 [2016-12-30 21:18:02]
MrWxt： 对不起，我没有找对时间… [2016-12-30 19:56:00]
 <p><a href="https://xfox.me/post/2016-12-30-%E9%AB%98%E4%B8%89%E9%9A%8F%E6%84%9F-2/">查看原文</a></p>', '2018-05-30 07:06:14.843316+08', '2018-05-30 16:18:38.847005+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('9b6cf6fb-6712-4a78-b369-3f2af47a35c2', true, ' 快递 yunda-1600887249033 有新动态', '[河南郑州分拨中心]在分拨中心进行称重扫描', '[河南郑州分拨中心]在分拨中心进行称重扫描', '2018-05-30 07:06:09.421946+08', '2018-05-30 16:18:43.713338+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('37a0d395-b0c4-47fe-90b5-3bba6d24f581', false, ' 快递 yunda-1600887249033 有新动态', '[辽宁沈阳分拨中心]在分拨中心进行卸车扫描', '[辽宁沈阳分拨中心]在分拨中心进行卸车扫描', '2018-05-30 07:06:09.434197+08', '2018-05-30 16:18:43.663302+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d5b028e7-c148-49da-b82e-eb489988c168', true, '[小傅Fox的日常]某科学的三观论调', ' 写于2014年11月17日-29日。
标签：人性 生活
后两篇进行了小范围修改。
 男神
我问Q，N为什么不拉黑我了。
Q说，你最近不要惹她，她最近因为男神不开心。
啥？她也有男神？
其实还是我想多了。除去那些无聊的只有我过意不去的年华，她毕竟还是一个普通的女孩。有几分姿色，有几分文艺，虽然在我眼中独特而又神秘，但对于其他人，只是一个好友。
她有权利，也有能力去爱。她与其他女孩一样拥有青春。
我挂念着她，可这真的是挂念么？
我以为我使她伤心，可她并不因此而对男性死心。
她一如我当初一样习惯着一个人，只是多了几分理性。她走过的，不过是一份寻常的青春年华。仅此。
矫情的文字
&ldquo;与女神有关的矫情文字“。哈。
我其实没有那么伤感。于是拖的时间很长，仅是为了带入情感去造作。
为什么。为什么那么多时间里本没有那份情感却去造作。
因为矫情。
因为盼望。
因为有另一份情感。
不是伤感，是期待。
我要打破屏障。
我要寻回一份情感。
我向往过去阳光洒满校园的日子和彼此分享笑话的时刻。
所以，我写下了那么多、无趣的、造作的文字。
还写吗？不写了。过去的，就是过去了啊。
随缘，信命。
绿茶婊和玛丽苏
好奇人群中为何会有这样的人。
其实把这样的名号安在同学身上并不确切。但也确实可以形容一些。
怎么形容其实不重要，她们怎么想的更重要。
一个，天天做着不切实际的幸福的梦。
按着网上的词汇，我们称之为“玛丽苏”。
她本人知道后，还问另一个同伴，玛丽苏是不是校花的意思。
自己信么？
是以此来改变自己因为成绩不好而低下的社会地位吧。
另一个，有几分姿色，追求过的男生不算少。
那么也许就是“绿茶婊”。
但我个人觉得，如果每一个都是真爱，还真没有什么。
大家都觉得“绿茶婊”没有“玛丽苏”那么讨厌。
说到底还是看脸。
以上两位，如果在普通高中，也许不足为奇。
 评论区： 博客没有名称： 本来就是看脸嘛【摊手】我是有多无聊才来翻你的lo……… [2015-04-04 15:16:36]
 ', ' 写于2014年11月17日-29日。
标签：人性 生活
后两篇进行了小范围修改。
 男神
我问Q，N为什么不拉黑我了。
Q说，你最近不要惹她，她最近因为男神不开心。
啥？她也有男神？
其实还是我想多了。除去那些无聊的只有我过意不去的年华，她毕竟还是一个普通的女孩。有几分姿色，有几分文艺，虽然在我眼中独特而又神秘，但对于其他人，只是一个好友。
她有权利，也有能力去爱。她与其他女孩一样拥有青春。
我挂念着她，可这真的是挂念么？
我以为我使她伤心，可她并不因此而对男性死心。
她一如我当初一样习惯着一个人，只是多了几分理性。她走过的，不过是一份寻常的青春年华。仅此。
矫情的文字
&ldquo;与女神有关的矫情文字“。哈。
我其实没有那么伤感。于是拖的时间很长，仅是为了带入情感去造作。
为什么。为什么那么多时间里本没有那份情感却去造作。
因为矫情。
因为盼望。
因为有另一份情感。
不是伤感，是期待。
我要打破屏障。
我要寻回一份情感。
我向往过去阳光洒满校园的日子和彼此分享笑话的时刻。
所以，我写下了那么多、无趣的、造作的文字。
还写吗？不写了。过去的，就是过去了啊。
随缘，信命。
绿茶婊和玛丽苏
好奇人群中为何会有这样的人。
其实把这样的名号安在同学身上并不确切。但也确实可以形容一些。
怎么形容其实不重要，她们怎么想的更重要。
一个，天天做着不切实际的幸福的梦。
按着网上的词汇，我们称之为“玛丽苏”。
她本人知道后，还问另一个同伴，玛丽苏是不是校花的意思。
自己信么？
是以此来改变自己因为成绩不好而低下的社会地位吧。
另一个，有几分姿色，追求过的男生不算少。
那么也许就是“绿茶婊”。
但我个人觉得，如果每一个都是真爱，还真没有什么。
大家都觉得“绿茶婊”没有“玛丽苏”那么讨厌。
说到底还是看脸。
以上两位，如果在普通高中，也许不足为奇。
 评论区： 博客没有名称： 本来就是看脸嘛【摊手】我是有多无聊才来翻你的lo……… [2015-04-04 15:16:36]
 <p><a href="https://xfox.me/post/2015-02-15-%E6%9F%90%E7%A7%91%E5%AD%A6%E7%9A%84%E4%B8%89%E8%A7%82%E8%AE%BA%E8%B0%83-37/">查看原文</a></p>', '2018-05-30 07:06:14.797158+08', '2018-05-30 16:18:43.476455+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('cb1d0250-948e-424a-a0c9-0b32eb9afab6', true, '[小傅Fox的日常]我要变成萌妹子 1 冬日的休眠与萌发', '我要变成萌妹子！：章节目录
上一章：无
下一章：
 都说冬天是万物休眠的季节，在大雪之后大地上是大片大片的白，偶有枯枝点缀其中，而声音也是被调小了一般，给人以别样的空旷感。室外刺骨的寒风与温暖的屋内形成了巧妙的对比，任何动物都有强烈的困倦感，连生命力顽强的昆虫都只留下来年复苏的种子。在四季鲜明的北方，冬季似乎意味着放缓甚至停止，但我觉得，与现实物质的停滞之中，有无数思维的嫩芽正在萌发，等待着春天来展现自己的活力。在似乎漫长无趣的冬季里，有无数的少男少女正在产生人生中最美妙的情愫，有无数的青年正在谋划着下一年工作上异人的闪光，有无数的长者正在构想下一次人生的旅行。对我而言，这份萌芽就是成为一个萌妹子的想法。
之所以这个愿望是成为萌妹子而不是变萌，是因为我其实是个男生。我知道，也许有些人，或者说很多人看到这里会不爽，我也曾怀疑过自己心中越来越强烈的这个想法是不是自我催眠的结果，试图一次次让自己打消这个念头，但它如同大地上无处不在的野草，不断在我脑海里蔓延着。
在今年夏天，我终于按捺不住内心的冲动而上网购买了一套女装，还穿着出了门。虽然说一定程度上发泄了欲望，但是也有不满，甚至于某种意义上促进了另一个欲望的产生。
在那前后还查阅过关于药娘的一些资料，吃药对我并不完美的异装来说似乎有改善作用，但是药品的副作用和吃药本身的一些注意事项又令我对药望而却步。我在将来吃不吃药中纠结着，害怕失去了吃药的最佳时期，又怕对自己的未来产生不可挽回的影响。
但无论如何，我现在是没有选择吃药的能力的，思考这些也就没有意义了。我只能选择购买-穿上女装来舒缓我的欲望。
但愿未来是光明的。', '我要变成萌妹子！：章节目录
上一章：无
下一章：
 都说冬天是万物休眠的季节，在大雪之后大地上是大片大片的白，偶有枯枝点缀其中，而声音也是被调小了一般，给人以别样的空旷感。室外刺骨的寒风与温暖的屋内形成了巧妙的对比，任何动物都有强烈的困倦感，连生命力顽强的昆虫都只留下来年复苏的种子。在四季鲜明的北方，冬季似乎意味着放缓甚至停止，但我觉得，与现实物质的停滞之中，有无数思维的嫩芽正在萌发，等待着春天来展现自己的活力。在似乎漫长无趣的冬季里，有无数的少男少女正在产生人生中最美妙的情愫，有无数的青年正在谋划着下一年工作上异人的闪光，有无数的长者正在构想下一次人生的旅行。对我而言，这份萌芽就是成为一个萌妹子的想法。
之所以这个愿望是成为萌妹子而不是变萌，是因为我其实是个男生。我知道，也许有些人，或者说很多人看到这里会不爽，我也曾怀疑过自己心中越来越强烈的这个想法是不是自我催眠的结果，试图一次次让自己打消这个念头，但它如同大地上无处不在的野草，不断在我脑海里蔓延着。
在今年夏天，我终于按捺不住内心的冲动而上网购买了一套女装，还穿着出了门。虽然说一定程度上发泄了欲望，但是也有不满，甚至于某种意义上促进了另一个欲望的产生。
在那前后还查阅过关于药娘的一些资料，吃药对我并不完美的异装来说似乎有改善作用，但是药品的副作用和吃药本身的一些注意事项又令我对药望而却步。我在将来吃不吃药中纠结着，害怕失去了吃药的最佳时期，又怕对自己的未来产生不可挽回的影响。
但无论如何，我现在是没有选择吃药的能力的，思考这些也就没有意义了。我只能选择购买-穿上女装来舒缓我的欲望。
但愿未来是光明的。<p><a href="https://xfox.me/post/2016-02-27-%E6%88%91%E8%A6%81%E5%8F%98%E6%88%90%E8%90%8C%E5%A6%B9%E5%AD%90-1-%E5%86%AC%E6%97%A5%E7%9A%84%E4%BC%91%E7%9C%A0%E4%B8%8E%E8%90%8C%E5%8F%91-7/">查看原文</a></p>', '2018-05-30 07:06:14.833035+08', '2018-05-30 16:18:38.920368+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('628de469-60d9-401b-8aa0-32d0a80b1a4e', true, '[小傅Fox的日常]期待、畏惧', '本文是今年4月30日写下的，补录。
最初的梦，正在盛开。期待爱。
 觉得自己爱上了一个妹子，又不知道这是否就是爱情。
幻想着她同样喜欢我，向我告白。
总是不敢去主动表达，也许是过去的一年的经历太过惨痛。
有了那样的一年，也许今生都不敢去主动表达。
害怕拒绝，更害怕拒绝后的疏远。可是又有不甘。', '本文是今年4月30日写下的，补录。
最初的梦，正在盛开。期待爱。
 觉得自己爱上了一个妹子，又不知道这是否就是爱情。
幻想着她同样喜欢我，向我告白。
总是不敢去主动表达，也许是过去的一年的经历太过惨痛。
有了那样的一年，也许今生都不敢去主动表达。
害怕拒绝，更害怕拒绝后的疏远。可是又有不甘。<p><a href="https://xfox.me/post/2014-12-14-%E6%9C%9F%E5%BE%85%E7%95%8F%E6%83%A7-54/">查看原文</a></p>', '2018-05-30 07:06:14.77617+08', '2018-05-30 16:18:43.482563+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('4d811394-cb19-4ac5-b35c-b6629e6c8cbb', false, ' 快递 yunda-1600887249033 有新动态', '[河南郑州公司三全路分部]进行揽件扫描', '[河南郑州公司三全路分部]进行揽件扫描', '2018-05-30 07:06:09.422714+08', '2018-05-30 16:18:43.712561+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('93522ba3-e195-453a-aa5d-2a93bcefa9a9', true, '[小傅Fox的日常]黄山&屯溪老街', '<p><a href="https://xfox.me/post/2016-01-29--10/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2016-01-29--10/">查看原文</a></p>', '2018-05-30 07:06:14.837658+08', '2018-05-30 16:18:38.896231+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('4bfba299-d1c8-4c03-b9f1-ab734d7b912f', true, '[小傅Fox的日常]与女神有关的矫情文字', '本文作于2014年10月31日-11月6日，写作时的标签是生活。有根据目前所想的改动。
 远方
现在是2014年10月31日的17时40分。她此刻正在驶往远方的飞机上，即将开启一段全新的、没有喧嚣者的异国求学之路。
可以说是受她成功申请SM1项目的影响吧，我由一个彻底的决意于在国内上大学的人转变为一个半决心的出国党。一年前，当赵兄问起我是否打算出国时，我想都没想地拒绝了；可现在，如果有人问我同样的问题，我会回答，“如果可以，我会。”
可以说是进入高中之后，似乎对于以前的一些问题有了新的开发。不再会去拒绝竞赛，也不会去直接拒绝出国的打算。仿佛可以从辩证的角度看一件事，但独立自主地下决定还是很难。
当然，其中还有时代环境的变化。有了意识，也就可以去了解时代的美丽和丑陋。感谢知乎，让我认识到一个真正的中国；感谢若干境外网站，让我认识到国内信息技术企业的落后和网络的封闭。
还有可能是向往轻松吧。升入高中而骤然多出来的四门课，使我压力大增，甚至产生了对于一年以前那个一心应试的时间的向往。多出来的一个，似乎更简单的选择，使我十分向往。寻找一条不一样的道路，失败了也可以回滚到正常的路线。
但是我错了。远方的道路，实际上是一条更艰辛的路。
两年前，一个学长写过，“出国党看似风光地穿过机场奔向远方，实际上也有着辛酸与痛苦、孤独与无助；远方，意味着独自前行。”现在，经历了两个月住校生活后，我似乎理解了一些。住校，离开了父母，有一些需要自己抉择的东西和处理的问题，能给与帮助的只有朋友；而对于出国，也许，只有自己，没有倾听者。
远方也意味着投入更多精力给自己热爱的或厌烦的事情。我本来是一向反对以功利目的投身于一项事业的，而现在我恰恰走着自己厌烦的路。不得不为了一个好看的简历，去参加信息学竞赛，去参加社团活动，去为了开发而开发。
我也不得不去背诵那些无趣的单词，正以自己不赞同的学习方法。不得不绷紧神经去听那些本可以放松的课，逼迫自己在每一个记入档案的考试中取得名次。
远方，不可能是纯粹的幸福和光明。
心
 一个相交甚好的东邪问我，“你是如何看待N和W的？”
我回答，“有的人，心不再为她跳动，可却依旧炽热；有的人，心不为她跳了，梦也就死了。”
——引子
 我承认，我对待男女关系上，兼有迷茫和随意，甚至可以说是放纵——没有人告诉我什么是爱情，什么是友情。
所以，我认为，仅仅是认为，我喜欢过K和N。对于15年而言，确切的说对于3年而言，是多了。
我到目前为止，依旧怀念着K。事先在脑海中逐渐模糊，但当初那颗炽热的跳动着的心，我依然记得；我依然企盼着未来哪天再次相遇。
对于N，我心中是有愧疚的。我认为，也许我使得她的青春的某些时刻蒙上了灰色。我依旧期许着再次回到亲密朋友的时刻。虽然心依旧热着，但却不再会表达。', '本文作于2014年10月31日-11月6日，写作时的标签是生活。有根据目前所想的改动。
 远方
现在是2014年10月31日的17时40分。她此刻正在驶往远方的飞机上，即将开启一段全新的、没有喧嚣者的异国求学之路。
可以说是受她成功申请SM1项目的影响吧，我由一个彻底的决意于在国内上大学的人转变为一个半决心的出国党。一年前，当赵兄问起我是否打算出国时，我想都没想地拒绝了；可现在，如果有人问我同样的问题，我会回答，“如果可以，我会。”
可以说是进入高中之后，似乎对于以前的一些问题有了新的开发。不再会去拒绝竞赛，也不会去直接拒绝出国的打算。仿佛可以从辩证的角度看一件事，但独立自主地下决定还是很难。
当然，其中还有时代环境的变化。有了意识，也就可以去了解时代的美丽和丑陋。感谢知乎，让我认识到一个真正的中国；感谢若干境外网站，让我认识到国内信息技术企业的落后和网络的封闭。
还有可能是向往轻松吧。升入高中而骤然多出来的四门课，使我压力大增，甚至产生了对于一年以前那个一心应试的时间的向往。多出来的一个，似乎更简单的选择，使我十分向往。寻找一条不一样的道路，失败了也可以回滚到正常的路线。
但是我错了。远方的道路，实际上是一条更艰辛的路。
两年前，一个学长写过，“出国党看似风光地穿过机场奔向远方，实际上也有着辛酸与痛苦、孤独与无助；远方，意味着独自前行。”现在，经历了两个月住校生活后，我似乎理解了一些。住校，离开了父母，有一些需要自己抉择的东西和处理的问题，能给与帮助的只有朋友；而对于出国，也许，只有自己，没有倾听者。
远方也意味着投入更多精力给自己热爱的或厌烦的事情。我本来是一向反对以功利目的投身于一项事业的，而现在我恰恰走着自己厌烦的路。不得不为了一个好看的简历，去参加信息学竞赛，去参加社团活动，去为了开发而开发。
我也不得不去背诵那些无趣的单词，正以自己不赞同的学习方法。不得不绷紧神经去听那些本可以放松的课，逼迫自己在每一个记入档案的考试中取得名次。
远方，不可能是纯粹的幸福和光明。
心
 一个相交甚好的东邪问我，“你是如何看待N和W的？”
我回答，“有的人，心不再为她跳动，可却依旧炽热；有的人，心不为她跳了，梦也就死了。”
——引子
 我承认，我对待男女关系上，兼有迷茫和随意，甚至可以说是放纵——没有人告诉我什么是爱情，什么是友情。
所以，我认为，仅仅是认为，我喜欢过K和N。对于15年而言，确切的说对于3年而言，是多了。
我到目前为止，依旧怀念着K。事先在脑海中逐渐模糊，但当初那颗炽热的跳动着的心，我依然记得；我依然企盼着未来哪天再次相遇。
对于N，我心中是有愧疚的。我认为，也许我使得她的青春的某些时刻蒙上了灰色。我依旧期许着再次回到亲密朋友的时刻。虽然心依旧热着，但却不再会表达。<p><a href="https://xfox.me/post/2015-02-10-%E4%B8%8E%E5%A5%B3%E7%A5%9E%E6%9C%89%E5%85%B3%E7%9A%84%E7%9F%AB%E6%83%85%E6%96%87%E5%AD%97-45/">查看原文</a></p>', '2018-05-30 07:06:14.796744+08', '2018-05-30 16:18:43.475415+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('f1dc2fa7-e189-4079-8cdd-6fd7301b097c', true, '[小傅Fox的日常]2016', '愿阳光充满我心。', '愿阳光充满我心。<p><a href="https://xfox.me/post/2016-01-01-2016-12/">查看原文</a></p>', '2018-05-30 07:06:14.834362+08', '2018-05-30 16:18:38.939255+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('20bf0d27-7741-42ad-bb9e-e2f5bc3730d2', true, '[小傅Fox的日常]电子科技社团MOOC+计算机课程', '本活动是电子科技社团2014年12月“Cold&amp;Code”系列活动的一部分。
 本活动旨在向同学们普及计算机应用开发知识。
我们邀请了高一开发者傅禹泽、赵翔宇、柴轶晟、周子涵组成了本次活动的讲师队伍。
 傅禹泽同学自小学五年级起成为开发者，了解C#、PHP、C++，正在学习Node.js、Swift，基础较好，有良好的开发思路。曾获全国信息学奥林匹克联赛辽宁省一等奖。
 赵翔宇同学，在舅舅的影响下走上开发道路，能够熟练运用C#，代码风格严谨。曾获全国信息学奥林匹克联赛辽宁省二等奖。
 柴轶晟同学，自主钻研相关内容，了解C#、PHP、Java、Python语言，有Linux服务器运维经验，积极投身开源社区。
 周子涵同学，熟悉C++、Python等语言，能够熟练运用STL，对于算法和数据结构有自主研究，曾获全国信息学奥林匹克联赛辽宁省二等奖。
  此外，我们可能会不定期邀请计算机行业从业者进行讲授。
本次授课以C#语言和Python语言为核心，联系计算机开发技术，能够帮助同学扩展视野。
报名请加入QQ群“电子科技社团MOOC+”425221965。具体课程安排请关注本页面及群内通知。', '本活动是电子科技社团2014年12月“Cold&amp;Code”系列活动的一部分。
 本活动旨在向同学们普及计算机应用开发知识。
我们邀请了高一开发者傅禹泽、赵翔宇、柴轶晟、周子涵组成了本次活动的讲师队伍。
 傅禹泽同学自小学五年级起成为开发者，了解C#、PHP、C++，正在学习Node.js、Swift，基础较好，有良好的开发思路。曾获全国信息学奥林匹克联赛辽宁省一等奖。
 赵翔宇同学，在舅舅的影响下走上开发道路，能够熟练运用C#，代码风格严谨。曾获全国信息学奥林匹克联赛辽宁省二等奖。
 柴轶晟同学，自主钻研相关内容，了解C#、PHP、Java、Python语言，有Linux服务器运维经验，积极投身开源社区。
 周子涵同学，熟悉C++、Python等语言，能够熟练运用STL，对于算法和数据结构有自主研究，曾获全国信息学奥林匹克联赛辽宁省二等奖。
  此外，我们可能会不定期邀请计算机行业从业者进行讲授。
本次授课以C#语言和Python语言为核心，联系计算机开发技术，能够帮助同学扩展视野。
报名请加入QQ群“电子科技社团MOOC+”425221965。具体课程安排请关注本页面及群内通知。<p><a href="https://xfox.me/post/2014-11-28-%E7%94%B5%E5%AD%90%E7%A7%91%E6%8A%80%E7%A4%BE%E5%9B%A2mooc+%E8%AE%A1%E7%AE%97%E6%9C%BA%E8%AF%BE%E7%A8%8B-56/">查看原文</a></p>', '2018-05-30 07:06:14.774827+08', '2018-05-30 16:18:43.54743+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('1c189bf0-3604-4797-b629-f8848e0b62d5', true, '[小傅Fox的日常]2015', '一年，就这样。
开始于一次考试的奋战，收获了意想不到的成绩。
想做一个网站，最后失败。
了解了开源社区和一些新兴技术。
最后感受到了阳光。
我曾经走过春日的巷口，
我曾经站在夏天的雨中，
我曾经拾起寒秋的落叶，
我曾经望向冬季的飞雪。
又会是一年。
我会怀着对阳光的热爱，
我会感受春天的花香，
我会赞颂又一个灿烂的夏天，
我会站在秋天的风中，
我会躺在雪地里，
我会望向那远方。
 我祈祷拥有一颗透明的心灵
和会流泪的眼睛
给我再去相信的勇气
越过谎言去拥抱你
 也会是美好的。', '一年，就这样。
开始于一次考试的奋战，收获了意想不到的成绩。
想做一个网站，最后失败。
了解了开源社区和一些新兴技术。
最后感受到了阳光。
我曾经走过春日的巷口，
我曾经站在夏天的雨中，
我曾经拾起寒秋的落叶，
我曾经望向冬季的飞雪。
又会是一年。
我会怀着对阳光的热爱，
我会感受春天的花香，
我会赞颂又一个灿烂的夏天，
我会站在秋天的风中，
我会躺在雪地里，
我会望向那远方。
 我祈祷拥有一颗透明的心灵
和会流泪的眼睛
给我再去相信的勇气
越过谎言去拥抱你
 也会是美好的。<p><a href="https://xfox.me/post/2014-12-31-2015-53/">查看原文</a></p>', '2018-05-30 07:06:14.775818+08', '2018-05-30 16:18:43.475173+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('ce55490c-db3b-4a9d-9835-14699ccf9686', true, '[小傅Fox的日常]About', '常用昵称小傅Fox、coderfox。
学生开发者 / ACGer / 广义跨性别者 / Ingress Agent
新自由主义者 / 支持网络中立 / 支持分级制度 / 支持版权制度改革 / 你国药丸
政治 0.9 / 文化 0.6 / 经济 0.4
GitHub / Twitter / Keybase / 番组计划 / 知乎 / v2ex
欢迎通过 aUB4Zm94Lm1l(email, base64) 联系我！
博客信息 主要是写技术内容和没事闲的写的随笔和社论。技术内容用英文写，别的用中文。语言全看心情。
如无特殊说明，文章、图片和设计稿件遵循 CC BY-NC-SA 4.0 International，代码遵循 The MIT License。如果在中国大陆使用，适用 CC 协议的部分则应遵循对应的 3.0 CN 版本。
技术栈 熟悉  Rust / Rocket / Tokio / Hyper C# / CoreCLR / NancyFx Node.', '常用昵称小傅Fox、coderfox。
学生开发者 / ACGer / 广义跨性别者 / Ingress Agent
新自由主义者 / 支持网络中立 / 支持分级制度 / 支持版权制度改革 / 你国药丸
政治 0.9 / 文化 0.6 / 经济 0.4
GitHub / Twitter / Keybase / 番组计划 / 知乎 / v2ex
欢迎通过 aUB4Zm94Lm1l(email, base64) 联系我！
博客信息 主要是写技术内容和没事闲的写的随笔和社论。技术内容用英文写，别的用中文。语言全看心情。
如无特殊说明，文章、图片和设计稿件遵循 CC BY-NC-SA 4.0 International，代码遵循 The MIT License。如果在中国大陆使用，适用 CC 协议的部分则应遵循对应的 3.0 CN 版本。
技术栈 熟悉  Rust / Rocket / Tokio / Hyper C# / CoreCLR / NancyFx Node.<p><a href="https://xfox.me/about/">查看原文</a></p>', '2018-05-30 07:06:14.861991+08', '2018-05-30 16:18:38.759055+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d514f3eb-510e-49ab-8dc8-88e1317251c7', true, '[小傅Fox的日常]网络安全法征求意见', '网络安全法草案正在向公众征求意见，建议大家积极参与，推动网络自由。http://t.cn/RLLEIYh 建议重点看第31、43、50条。
有的人只在网上骂不去提交意见也是醉。有意见反馈渠道不用然后没法达成自己诉求不叫桂枝不皿煮，反馈了桂枝不理才叫桂枝不皿煮。', '网络安全法草案正在向公众征求意见，建议大家积极参与，推动网络自由。http://t.cn/RLLEIYh 建议重点看第31、43、50条。
有的人只在网上骂不去提交意见也是醉。有意见反馈渠道不用然后没法达成自己诉求不叫桂枝不皿煮，反馈了桂枝不理才叫桂枝不皿煮。<p><a href="https://xfox.me/post/2015-07-11--22/">查看原文</a></p>', '2018-05-30 07:06:14.823895+08', '2018-05-30 16:18:38.938198+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('7889321c-3953-4954-9022-a51dbf4ea4ab', true, '[小傅Fox的日常]意义自寻', '<p><a href="https://xfox.me/post/2017-07-19-%E6%84%8F%E4%B9%89%E8%87%AA%E5%AF%BB/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2017-07-19-%E6%84%8F%E4%B9%89%E8%87%AA%E5%AF%BB/">查看原文</a></p>', '2018-05-30 07:06:14.85331+08', '2018-05-30 16:18:38.798796+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('32df3b2a-f603-41e2-a65d-302946a26916', true, '[小傅Fox的日常]生命与死亡', '——余华《第七天》读后感&amp;一篇随笔
 本文的引子写于阅读余华《第七天》之后，岁月与生命写于2015年6月24日、25日。
 引子
语文课前演讲是推荐书，两个同学都推荐了余华的作品，一本是《活着》，另一本就是《第七天》。
因为晚上要补课，不想听数学课，于是下载了《第七天》打算上课看。看到作者和父亲的生活情境的时候我的眼泪决堤，但我却没有为其他情节流泪。也许还是不能承受亲情和岁月吧。
 走过去吧，那里树叶会向你招手，石头会向你微笑，河水会向你问候。那里没有贫贱也没有富贵，没有悲伤也没有疼痛，没有仇也没有恨……那里人人死而平等。
他问：“那是什么地方？”
我说：“死无葬身之地。”
 岁月与生命
难以直面生命本身，或者说，生存和死亡。
无论多么粗制滥造的文字，凡是触及到岁月和死亡的，都能让我哭泣。看到这样的东西，我常常想到，当几十年的岁月如风飘过，当我面对自己生命的最后时刻的时候，我是怎样的心情。
我有梦想，有一定的能力，但是我并不清楚自己十几年、几十年之后的生活会是怎样。也许我会实现梦想，也许我会过着安稳的日子，也许我会一事无成。
比起岁月，更不了解的是死亡。不了解死亡，也就是不了解生命，或者说，意识。何为意识？意识如何产生？意识如何结束？结束的背后，是有还是无？
到目前，死亡是人类最不可回滚的变化。复活是人类几千年徒劳的尝试。
庄子“一死生”，基督教“天堂和地狱”，在我眼里，不是真正的看淡生死。以死亡之后的存在而建立的生死观固然存在积极一面，但是不是真正的豁达。如果死亡之后是虚无，那么如何保持乐观？因此，我拒绝“死后为有”的生死观，但是对于“死后为无”，我又不能豁达地看待死亡。', '——余华《第七天》读后感&amp;一篇随笔
 本文的引子写于阅读余华《第七天》之后，岁月与生命写于2015年6月24日、25日。
 引子
语文课前演讲是推荐书，两个同学都推荐了余华的作品，一本是《活着》，另一本就是《第七天》。
因为晚上要补课，不想听数学课，于是下载了《第七天》打算上课看。看到作者和父亲的生活情境的时候我的眼泪决堤，但我却没有为其他情节流泪。也许还是不能承受亲情和岁月吧。
 走过去吧，那里树叶会向你招手，石头会向你微笑，河水会向你问候。那里没有贫贱也没有富贵，没有悲伤也没有疼痛，没有仇也没有恨……那里人人死而平等。
他问：“那是什么地方？”
我说：“死无葬身之地。”
 岁月与生命
难以直面生命本身，或者说，生存和死亡。
无论多么粗制滥造的文字，凡是触及到岁月和死亡的，都能让我哭泣。看到这样的东西，我常常想到，当几十年的岁月如风飘过，当我面对自己生命的最后时刻的时候，我是怎样的心情。
我有梦想，有一定的能力，但是我并不清楚自己十几年、几十年之后的生活会是怎样。也许我会实现梦想，也许我会过着安稳的日子，也许我会一事无成。
比起岁月，更不了解的是死亡。不了解死亡，也就是不了解生命，或者说，意识。何为意识？意识如何产生？意识如何结束？结束的背后，是有还是无？
到目前，死亡是人类最不可回滚的变化。复活是人类几千年徒劳的尝试。
庄子“一死生”，基督教“天堂和地狱”，在我眼里，不是真正的看淡生死。以死亡之后的存在而建立的生死观固然存在积极一面，但是不是真正的豁达。如果死亡之后是虚无，那么如何保持乐观？因此，我拒绝“死后为有”的生死观，但是对于“死后为无”，我又不能豁达地看待死亡。<p><a href="https://xfox.me/post/2015-09-25-%E7%94%9F%E5%91%BD%E4%B8%8E%E6%AD%BB%E4%BA%A1-15/">查看原文</a></p>', '2018-05-30 07:06:14.838137+08', '2018-05-30 16:18:38.882798+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('de406332-ade6-4ebf-a761-7746ec77fb07', true, '[小傅Fox的日常]人群', '本文写于1月21日-22日。
录入时进行了补充。
 我不止一次说过，我讨厌人群。
其实讨厌人群的根源在自己。
我希望自己是一个有阳光气息的人，
像阳光女孩一样。
可我走不出那些黑暗的角落，
我甩不掉那些发霉的气息。
我奋力地在阴暗的巷子里奔跑，
可是永远跑不到尽头；
我看得见巷口的夺目的阳光，
我看得见小巷的脏乱，
我明白必须奋力奔跑，
可还是跑不开。', '本文写于1月21日-22日。
录入时进行了补充。
 我不止一次说过，我讨厌人群。
其实讨厌人群的根源在自己。
我希望自己是一个有阳光气息的人，
像阳光女孩一样。
可我走不出那些黑暗的角落，
我甩不掉那些发霉的气息。
我奋力地在阴暗的巷子里奔跑，
可是永远跑不到尽头；
我看得见巷口的夺目的阳光，
我看得见小巷的脏乱，
我明白必须奋力奔跑，
可还是跑不开。<p><a href="https://xfox.me/post/2015-02-15-%E4%BA%BA%E7%BE%A4-36/">查看原文</a></p>', '2018-05-30 07:06:14.797472+08', '2018-05-30 16:18:43.485109+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('0bd579a1-7a16-424a-8deb-bf17364634f8', true, '[小傅Fox的日常]Minecraft古建筑建造赛', '本活动旨在传播Minecraft及世界遗产知识，并发挥同学们的创新精神。
要求
外观符合所建筑世界遗产
允许mod，使用mod的玩家请附加说明且使用的Mod范围在NEYCraft官方客户端高配版本Mod列表内
游戏版本不高于1.8.8，不低于1.6.4
评分标准 对于100%的数据，其应当尽可能接近所建筑世界遗产外观并具有美感
允许要求评测环境开启光影或者OptiFine，请提交时备注并附上光影配置文件。
对于200%的数据，其应运用了特殊的技术手段
特殊的技术手段包括但不仅限于MCEdit、Mega，使用了这些手段的请同时提交中间文件或工作场景截图。
奖品
我们将选出优秀的至少3件作品给予奖励，并选出最优作品放置于NEYCraft服务器上展示。
奖品包括但不仅限于：Minecraft草方块抱枕、Minecraft头套、世界遗产明信片。
评分结果将于2015年10月18日前公布在http://cotr.me/mc上。公布后7天内允许申诉，申诉结果将于10月25日公布在同一网站上。奖品将于10月26日由活动组织者发放到选手手中。
提交时间：2015年10月11日。
提交方式
将存档文件夹以zip格式，UTF8编码，文件名不包含中文字符，发送到coderfox@qq.com。
你也可以上交包含存档文件夹的存储器到1406康书宁处。
组织单位
主办单位：东北育才学校世界遗产青年保卫者协会、电子科技社团
协办单位：酷创社区、NEYCraft
东北育才学校世界遗产青年保卫者协会&amp;电子科技社团
2015年9月19日
 评论区： 博客没有名称： 这个好有创意 [2015-09-26 16:16:58]
 ', '本活动旨在传播Minecraft及世界遗产知识，并发挥同学们的创新精神。
要求
外观符合所建筑世界遗产
允许mod，使用mod的玩家请附加说明且使用的Mod范围在NEYCraft官方客户端高配版本Mod列表内
游戏版本不高于1.8.8，不低于1.6.4
评分标准 对于100%的数据，其应当尽可能接近所建筑世界遗产外观并具有美感
允许要求评测环境开启光影或者OptiFine，请提交时备注并附上光影配置文件。
对于200%的数据，其应运用了特殊的技术手段
特殊的技术手段包括但不仅限于MCEdit、Mega，使用了这些手段的请同时提交中间文件或工作场景截图。
奖品
我们将选出优秀的至少3件作品给予奖励，并选出最优作品放置于NEYCraft服务器上展示。
奖品包括但不仅限于：Minecraft草方块抱枕、Minecraft头套、世界遗产明信片。
评分结果将于2015年10月18日前公布在http://cotr.me/mc上。公布后7天内允许申诉，申诉结果将于10月25日公布在同一网站上。奖品将于10月26日由活动组织者发放到选手手中。
提交时间：2015年10月11日。
提交方式
将存档文件夹以zip格式，UTF8编码，文件名不包含中文字符，发送到coderfox@qq.com。
你也可以上交包含存档文件夹的存储器到1406康书宁处。
组织单位
主办单位：东北育才学校世界遗产青年保卫者协会、电子科技社团
协办单位：酷创社区、NEYCraft
东北育才学校世界遗产青年保卫者协会&amp;电子科技社团
2015年9月19日
 评论区： 博客没有名称： 这个好有创意 [2015-09-26 16:16:58]
 <p><a href="https://xfox.me/post/2015-09-19-minecraft%E5%8F%A4%E5%BB%BA%E7%AD%91%E5%BB%BA%E9%80%A0%E8%B5%9B-16/">查看原文</a></p>', '2018-05-30 07:06:14.826165+08', '2018-05-30 16:18:38.972273+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d6f328e9-7244-45bc-83c5-8016e9bdb653', true, '[小傅Fox的日常]论网易和豆瓣', '网易和豆瓣的社区还真是把小资情怀玩得淋漓尽致。
其实个人享受也没什么不好，
关上窗户，接触自己的生活。', '网易和豆瓣的社区还真是把小资情怀玩得淋漓尽致。
其实个人享受也没什么不好，
关上窗户，接触自己的生活。<p><a href="https://xfox.me/post/2015-02-15-%E8%AE%BA%E7%BD%91%E6%98%93%E5%92%8C%E8%B1%86%E7%93%A3-35/">查看原文</a></p>', '2018-05-30 07:06:14.803178+08', '2018-05-30 16:18:39.039645+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('be1a7ba4-7eb0-4285-861a-e1dc1a7e88d5', true, '[小傅Fox的日常]Minecraft挖掘机建造赛测评结果', '感谢各位同学的积极参与，Minecraft挖掘机建造赛终于圆满结束了~撒花~
关于存档的截图和下载请稍后~
下面公布测评结果如下（以提交顺序为序）：
1406 石峻屹
得分：120
测评A
 测评环境：
Mac OS X 10.10.1, MacBook Pro (Retina, 15-inch, Mid 2014), Java 8u25, Hello Minecraft Launcher 2.1.1, Minecraft 1.7.10
测评者：
小傅Fox
评分结果：
外观相似 50%
美观性 10%
移动 0%
个人特色 20%
特殊创新 20%
提前提交 20%
总得分：120%
 测评B
 测评环境：
Windows 8.1 Update 1, Java 8u19, Hello Minecraft Launcher 2.0.4, Minecraft 1.8.0
测评者：
赵兄1999
评分结果：
外观相似 60%
美观性 0%
移动 0%
个人特色 30%', '感谢各位同学的积极参与，Minecraft挖掘机建造赛终于圆满结束了~撒花~
关于存档的截图和下载请稍后~
下面公布测评结果如下（以提交顺序为序）：
1406 石峻屹
得分：120
测评A
 测评环境：
Mac OS X 10.10.1, MacBook Pro (Retina, 15-inch, Mid 2014), Java 8u25, Hello Minecraft Launcher 2.1.1, Minecraft 1.7.10
测评者：
小傅Fox
评分结果：
外观相似 50%
美观性 10%
移动 0%
个人特色 20%
特殊创新 20%
提前提交 20%
总得分：120%
 测评B
 测评环境：
Windows 8.1 Update 1, Java 8u19, Hello Minecraft Launcher 2.0.4, Minecraft 1.8.0
测评者：
赵兄1999
评分结果：
外观相似 60%
美观性 0%
移动 0%
个人特色 30%<p><a href="https://xfox.me/post/2015-01-16-minecraft%E6%8C%96%E6%8E%98%E6%9C%BA%E5%BB%BA%E9%80%A0%E8%B5%9B%E6%B5%8B%E8%AF%84%E7%BB%93%E6%9E%9C-51/">查看原文</a></p>', '2018-05-30 07:06:14.776788+08', '2018-05-30 16:18:43.476204+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('521e5943-49cd-4c5b-a81e-58f2c4384158', true, '[小傅Fox的日常]谈《大学》的现代意义', '<blockquote>
<p>学校让写狗屁读后感，就随便编了一篇，放在这里备份，不要读下去。</p>
</blockquote>

<p>我一直就对《大学》一类的传统书籍以及其中反映的传统文化不感兴趣，不是因为读文言文闹心，而是觉得专门去阅读这些东西没有意义。传统文化中的所谓「精华」其实早已成为全人类普遍认同的价值观，对现代人来说，只要具备对同类的理解和对社会的观察，就能够提出传统文化中的「精华」。例如，《大学》中提出的「苟日新，日日新，又日新」已经成为现代社会普遍认同的终身学习的观点，学习和接受这样的观点并不需要去专门了解传统文学。因此，对非社会科学的研究者来说，阅读传统文化作品、了解传统文化对现实没有指导意义。</p>

<p></p>', '<blockquote>
<p>学校让写狗屁读后感，就随便编了一篇，放在这里备份，不要读下去。</p>
</blockquote>

<p>我一直就对《大学》一类的传统书籍以及其中反映的传统文化不感兴趣，不是因为读文言文闹心，而是觉得专门去阅读这些东西没有意义。传统文化中的所谓「精华」其实早已成为全人类普遍认同的价值观，对现代人来说，只要具备对同类的理解和对社会的观察，就能够提出传统文化中的「精华」。例如，《大学》中提出的「苟日新，日日新，又日新」已经成为现代社会普遍认同的终身学习的观点，学习和接受这样的观点并不需要去专门了解传统文学。因此，对非社会科学的研究者来说，阅读传统文化作品、了解传统文化对现实没有指导意义。</p>

<p></p><p><a href="https://xfox.me/post/2017-10-15-%E8%B0%88%E5%A4%A7%E5%AD%A6%E7%9A%84%E7%8E%B0%E4%BB%A3%E6%84%8F%E4%B9%89/">查看原文</a></p>', '2018-05-30 07:06:14.856713+08', '2018-05-30 16:18:38.758097+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('6a469a59-e412-4106-9bed-9d1be87af295', true, '[小傅Fox的日常]2018', '<p><img src="https://xfox.me/media/import/b8fa6a0147e938353371f21177ff3a94.jpg" alt="b8fa6a0147e938353371f21177ff3a94" /></p>

<blockquote>
<p>文字及图片作于 2018 年元旦附近。</p>
</blockquote>

<p></p>', '<p><img src="https://xfox.me/media/import/b8fa6a0147e938353371f21177ff3a94.jpg" alt="b8fa6a0147e938353371f21177ff3a94" /></p>

<blockquote>
<p>文字及图片作于 2018 年元旦附近。</p>
</blockquote>

<p></p><p><a href="https://xfox.me/post/2018-02-25-2018/">查看原文</a></p>', '2018-05-30 07:06:14.858548+08', '2018-05-30 16:18:38.777092+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('50f1f0bf-dbe3-465b-8d31-e2dae3ccc6a9', true, '[小傅Fox的日常]雾霾的形成、危害与防治', '<h1 id="雾霾的形成-危害与防治">雾霾的形成、危害与防治</h1>

<p>雾霾，正成为中国城市发展过程中一个重要的问题。这一问题，危害着人们的身体健康，同样也影响着人们的心情，侵犯着人们欣赏自然美的权利<sup>1</sup>。下面我们就来探究一下雾霾的形成、危害与防治。
</p>', '<h1 id="雾霾的形成-危害与防治">雾霾的形成、危害与防治</h1>

<p>雾霾，正成为中国城市发展过程中一个重要的问题。这一问题，危害着人们的身体健康，同样也影响着人们的心情，侵犯着人们欣赏自然美的权利<sup>1</sup>。下面我们就来探究一下雾霾的形成、危害与防治。
</p><p><a href="https://xfox.me/post/2014-05-30-%E9%9B%BE%E9%9C%BE%E7%9A%84%E5%BD%A2%E6%88%90%E5%8D%B1%E5%AE%B3%E4%B8%8E%E9%98%B2%E6%B2%BB-82/">查看原文</a></p>', '2018-05-30 07:06:14.749502+08', '2018-05-30 16:18:43.625313+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('67c32c40-2d70-4261-a154-141bf2ef9cb5', true, '[小傅Fox的日常]Links', ' 交换友链
 非商业性站点（如果是自己所在项目的就例外） 按我心情来 在下面评论或者给我发邮件   ', ' 交换友链
 非商业性站点（如果是自己所在项目的就例外） 按我心情来 在下面评论或者给我发邮件   <p><a href="https://xfox.me/links/">查看原文</a></p>', '2018-05-30 07:06:14.853622+08', '2018-05-30 16:18:38.79203+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('b9d77281-3179-4cfb-9916-d28d1d06fd1c', true, '[小傅Fox的日常]第三十届全国青少年科技创新大赛感想', '我和柴轶晟、李晨宇共同参加了第三十届全国青少年科技创新大赛。在合作过程中，我们有过一致，也有过争论，但彼此都是愉快的。我们从彼此身上不止了解到了自己之前不了解的技术，也学习到了团队合作的方法和意义。准备阶段是劳碌的，但也是快乐的，作为之前从未进行过类似内容设计的学生，看到共同完成的展板，成就感油然而生。在香港的时间里，我们看到了来自全国各地的优秀的作品，其中不乏优秀的想法和先进的技术，在感叹他们的优秀的同时，也认识到了自己的不足。同时，我们结交到了全国各地的具有相同兴趣的爱好者。问辩的过程中，专家评委具有卓越的专业知识，让我们认识到了自己知识的不足，了解到了科学技术研究的方法，也增加了对自己项目的明确认识，这些内容可以指导我们今后更好地研究和推广项目。虽然结果和目标有偏差，但我们从中获得了经验，自己和学弟学妹们未来的表现一定会更好。', '我和柴轶晟、李晨宇共同参加了第三十届全国青少年科技创新大赛。在合作过程中，我们有过一致，也有过争论，但彼此都是愉快的。我们从彼此身上不止了解到了自己之前不了解的技术，也学习到了团队合作的方法和意义。准备阶段是劳碌的，但也是快乐的，作为之前从未进行过类似内容设计的学生，看到共同完成的展板，成就感油然而生。在香港的时间里，我们看到了来自全国各地的优秀的作品，其中不乏优秀的想法和先进的技术，在感叹他们的优秀的同时，也认识到了自己的不足。同时，我们结交到了全国各地的具有相同兴趣的爱好者。问辩的过程中，专家评委具有卓越的专业知识，让我们认识到了自己知识的不足，了解到了科学技术研究的方法，也增加了对自己项目的明确认识，这些内容可以指导我们今后更好地研究和推广项目。虽然结果和目标有偏差，但我们从中获得了经验，自己和学弟学妹们未来的表现一定会更好。<p><a href="https://xfox.me/post/2015-08-27-%E7%AC%AC%E4%B8%89%E5%8D%81%E5%B1%8A%E5%85%A8%E5%9B%BD%E9%9D%92%E5%B0%91%E5%B9%B4%E7%A7%91%E6%8A%80%E5%88%9B%E6%96%B0%E5%A4%A7%E8%B5%9B%E6%84%9F%E6%83%B3-17/">查看原文</a></p>', '2018-05-30 07:06:14.826516+08', '2018-05-30 16:18:38.922409+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('0585283c-5a9f-44d9-881b-dc197ba1689a', true, '[小傅Fox的日常]编写自动化逆向工具', '<p>最近在做梆梆的脚本，这个游戏用 ProtoBuf 搭载通信数据。最开始的思路是先抓包知道 ProtoBuf 的 *field_id*，然后从逆向数据里得出 *field_name*，最后构建出 ProtoBuf。干了几天之后发现好累，而且有的时候数据包是不全的。</p>

<p>然后发现这个游戏的 ProtoBuf 是用 <a href="https://github.com/mgravell/protobuf-net">ProtoBuf-Net</a> 这个库实现的，特点是每个字段都用 Attribute 标注字段序号，而不是官方的 protoc 根据 .proto 文件生成代码的形式。那么问题就简单了，只要能获取到 Attribute 就可以分析出数据。</p>

<p></p>', '<p>最近在做梆梆的脚本，这个游戏用 ProtoBuf 搭载通信数据。最开始的思路是先抓包知道 ProtoBuf 的 *field_id*，然后从逆向数据里得出 *field_name*，最后构建出 ProtoBuf。干了几天之后发现好累，而且有的时候数据包是不全的。</p>

<p>然后发现这个游戏的 ProtoBuf 是用 <a href="https://github.com/mgravell/protobuf-net">ProtoBuf-Net</a> 这个库实现的，特点是每个字段都用 Attribute 标注字段序号，而不是官方的 protoc 根据 .proto 文件生成代码的形式。那么问题就简单了，只要能获取到 Attribute 就可以分析出数据。</p>

<p></p><p><a href="https://xfox.me/post/2018-04-01-%E7%BC%96%E5%86%99%E8%87%AA%E5%8A%A8%E5%8C%96%E9%80%86%E5%90%91%E5%B7%A5%E5%85%B7/">查看原文</a></p>', '2018-05-30 07:06:14.859172+08', '2018-05-30 16:18:38.770953+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('92218b2e-ea80-4312-b831-2c289dcd7d24', true, ' 快递 yunda-1600887249033 有新动态', '[辽宁沈阳浑南开发公司康泰小区便民寄存分部]到达目的地网点，快件将很快进行派送', '[辽宁沈阳浑南开发公司康泰小区便民寄存分部]到达目的地网点，快件将很快进行派送', '2018-05-30 07:06:09.440888+08', '2018-05-30 16:18:43.625175+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('53a72ccd-c26c-4907-9281-f1c5f9346c54', true, ' 快递 yunda-1600887249033 有新动态', '[辽宁沈阳分拨中心]从站点发出，本次转运目的地：辽宁沈阳浑南开发公司', '[辽宁沈阳分拨中心]从站点发出，本次转运目的地：辽宁沈阳浑南开发公司', '2018-05-30 07:06:09.432965+08', '2018-05-30 16:18:43.672775+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('b12ff1d7-2736-4d7a-a139-21a42ec0d62e', true, '[小傅Fox的日常]关于近期同性恋相关问题的评论', '<p>本文是针对<a href="https://www.zhihu.com/question/272478174/answer/367525072">漭漭 在 「如何看待人民日报评论发表的随笔《“不一样的烟火”，*一样可以绽放*》？」下的回答</a>，及<a href="https://t.bilibili.com/108692591333421076"> bilibili UP 主 彩虹说 的动态</a>的评论。</p>

<p></p>', '<p>本文是针对<a href="https://www.zhihu.com/question/272478174/answer/367525072">漭漭 在 「如何看待人民日报评论发表的随笔《“不一样的烟火”，*一样可以绽放*》？」下的回答</a>，及<a href="https://t.bilibili.com/108692591333421076"> bilibili UP 主 彩虹说 的动态</a>的评论。</p>

<p></p><p><a href="https://xfox.me/post/2018-04-20-%E5%85%B3%E4%BA%8E%E8%BF%91%E6%9C%9F%E5%90%8C%E6%80%A7%E6%81%8B%E7%9B%B8%E5%85%B3%E9%97%AE%E9%A2%98%E7%9A%84%E8%AF%84%E8%AE%BA/">查看原文</a></p>', '2018-05-30 07:06:14.861553+08', '2018-05-30 16:18:38.729267+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('03cfd9fd-05f3-4626-a4d8-f93982387be0', true, '[小傅Fox的日常]好久没有听到你的声音', '如题。
什么好听什么的的都是扯淡。
只能说，还是过去。
除去了回忆只剩下惨痛。', '如题。
什么好听什么的的都是扯淡。
只能说，还是过去。
除去了回忆只剩下惨痛。<p><a href="https://xfox.me/post/2014-10-31-%E5%A5%BD%E4%B9%85%E6%B2%A1%E6%9C%89%E5%90%AC%E5%88%B0%E4%BD%A0%E7%9A%84%E5%A3%B0%E9%9F%B3-63/">查看原文</a></p>', '2018-05-30 07:06:14.75631+08', '2018-05-30 16:18:43.538654+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('2c164fcb-af95-4071-ae09-2a6ea5dd73ca', true, '[小傅Fox的日常]浑河边日常瞎拍', '<p><a href="https://xfox.me/post/2014-06-02--76/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2014-06-02--76/">查看原文</a></p>', '2018-05-30 07:06:14.749976+08', '2018-05-30 16:18:43.593009+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('7cecab36-16a7-4f0f-9154-9d5689b18dc5', true, '[小傅Fox的日常]去大连啦', '<p><a href="https://xfox.me/post/2014-11-01--61/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2014-11-01--61/">查看原文</a></p>', '2018-05-30 07:06:14.755185+08', '2018-05-30 16:18:43.603814+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('c9bfc833-219f-4edc-b60a-09486376fc86', true, ' 快递 yunda-1600887249033 有新动态', '[辽宁沈阳浑南开发公司康泰小区便民寄存分部]快件已被 拍照 签收', '[辽宁沈阳浑南开发公司康泰小区便民寄存分部]快件已被 拍照 签收', '2018-05-30 07:06:09.453418+08', '2018-05-30 16:18:43.614862+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('87efbd54-18cc-440b-a7a9-2b758cc4dfc7', true, '[小傅Fox的日常]育才杀武将牌设计', '<p><a href="https://xfox.me/post/2014-11-01--60/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2014-11-01--60/">查看原文</a></p>', '2018-05-30 07:06:14.751288+08', '2018-05-30 16:18:43.622078+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d6d09985-b7df-4876-8f51-1722343ec4bf', true, ' 快递 yunda-1600887249033 有新动态', '[河南郑州分拨中心]进行装车扫描，即将发往：辽宁沈阳分拨中心', '[河南郑州分拨中心]进行装车扫描，即将发往：辽宁沈阳分拨中心', '2018-05-30 07:06:09.436953+08', '2018-05-30 16:18:43.673938+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('c72715cd-ecb4-4dca-a47b-dd37f57c3968', true, '[小傅Fox的日常]几个短句', '  人生本不应如此无聊，人生本应如此无聊。
 “不要在乎有没有人在乎你，因为根本就没人在乎你。”——来自知乎
 巨大的必然中蕴含着巨大的偶然。
 生存是为了生存本身。  评论区： JGor： … [2015-07-17 20:21:04]
  ', '  人生本不应如此无聊，人生本应如此无聊。
 “不要在乎有没有人在乎你，因为根本就没人在乎你。”——来自知乎
 巨大的必然中蕴含着巨大的偶然。
 生存是为了生存本身。  评论区： JGor： … [2015-07-17 20:21:04]
  <p><a href="https://xfox.me/post/2015-07-16-%E5%87%A0%E4%B8%AA%E7%9F%AD%E5%8F%A5-20/">查看原文</a></p>', '2018-05-30 07:06:14.819075+08', '2018-05-30 16:18:38.979123+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('3f413b19-a8d0-4d4d-b4be-e634ec4b29cf', true, '[小傅Fox的日常]河边漫步', '2015年9月23日写。
 河边路口，西边的天空下黄上篮，路灯还没开，地面的景物变得暗淡，只有路口的信号灯黄黄地闪着。
深吸一口气，除了有城市独到的灰尘，还有从不远的河边传来的咸腥的气息。
在河边的小道上，有一男一女两个剪影在缓缓前进。河道两侧点缀着彩色的小灯，两旁的树被灯光打得翠绿，远处的跨河桥亮起了装饰，水中泛着些许的倒影。
走过桥下时，传来隆隆的车压过马路的声音。另一头有跳广场舞的人群，声音隐约传到对岸。偶尔有跑步者手机中的音乐，有在椅子上小憩的老人的广播。
夜幕终于真正降临。有摄影师架起相机，捕捉城市的夜。
少年试探着将手伸向女孩。此刻，繁星闪耀，但少年只能认出猎户座的2-3-2.', '2015年9月23日写。
 河边路口，西边的天空下黄上篮，路灯还没开，地面的景物变得暗淡，只有路口的信号灯黄黄地闪着。
深吸一口气，除了有城市独到的灰尘，还有从不远的河边传来的咸腥的气息。
在河边的小道上，有一男一女两个剪影在缓缓前进。河道两侧点缀着彩色的小灯，两旁的树被灯光打得翠绿，远处的跨河桥亮起了装饰，水中泛着些许的倒影。
走过桥下时，传来隆隆的车压过马路的声音。另一头有跳广场舞的人群，声音隐约传到对岸。偶尔有跑步者手机中的音乐，有在椅子上小憩的老人的广播。
夜幕终于真正降临。有摄影师架起相机，捕捉城市的夜。
少年试探着将手伸向女孩。此刻，繁星闪耀，但少年只能认出猎户座的2-3-2.<p><a href="https://xfox.me/post/2016-02-05-%E6%B2%B3%E8%BE%B9%E6%BC%AB%E6%AD%A5-8/">查看原文</a></p>', '2018-05-30 07:06:14.82986+08', '2018-05-30 16:18:38.920058+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('dd3fd689-9928-4171-8bc0-d2554de660a7', true, '[小傅Fox的日常]创新大赛', '<p><a href="https://xfox.me/post/2015-04-04--31/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2015-04-04--31/">查看原文</a></p>', '2018-05-30 07:06:14.80838+08', '2018-05-30 16:18:39.021033+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('6f929707-b635-4ba5-9ed5-0da443911de9', true, '[小傅Fox的日常]背影', '我将永远相信，光明在梦的彼岸。
 巷口，依稀她的背影。
我奋力向前跑去，想要抓住这一瞬间。在雨的迷蒙中，在将触而未触的一瞬间，她的身体如碎片般随风消散。
桃花树下，铁路道口，一次次相似的情节重现着。春日的芳香，夏日的燥热，秋日的斑驳，冬日的白雪。岁月常流转，往昔永不归。
我又一次从梦中醒来，却在梦境中无法自拔。夜的寂静只能加深我的哀愁，他不会倾听一个孤独者的自白。在夜里独自一个人叹息，在夜里独自一个人流泪。
我多么希望这只是一个梦中梦，在光明到达的时刻，我醒来，在初一下的暑假，在补习班里，身旁依然是她。
自那天以来，遇见的只有背影。是那般美丽的背影，也是那般绝情的背影。我可以看清每一个人，唯独看不清你；我可以接近每一个人，唯独接进不了你。
但愿，我们将在没有黑暗的地方相会；但愿，在梦的彼岸，我们手牵着手，依旧是朋友。', '我将永远相信，光明在梦的彼岸。
 巷口，依稀她的背影。
我奋力向前跑去，想要抓住这一瞬间。在雨的迷蒙中，在将触而未触的一瞬间，她的身体如碎片般随风消散。
桃花树下，铁路道口，一次次相似的情节重现着。春日的芳香，夏日的燥热，秋日的斑驳，冬日的白雪。岁月常流转，往昔永不归。
我又一次从梦中醒来，却在梦境中无法自拔。夜的寂静只能加深我的哀愁，他不会倾听一个孤独者的自白。在夜里独自一个人叹息，在夜里独自一个人流泪。
我多么希望这只是一个梦中梦，在光明到达的时刻，我醒来，在初一下的暑假，在补习班里，身旁依然是她。
自那天以来，遇见的只有背影。是那般美丽的背影，也是那般绝情的背影。我可以看清每一个人，唯独看不清你；我可以接近每一个人，唯独接进不了你。
但愿，我们将在没有黑暗的地方相会；但愿，在梦的彼岸，我们手牵着手，依旧是朋友。<p><a href="https://xfox.me/post/2014-09-21-%E8%83%8C%E5%BD%B1-64/">查看原文</a></p>', '2018-05-30 07:06:14.754921+08', '2018-05-30 16:18:43.603083+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d012b9cf-5bdf-4398-b3c5-8ad3df471741', true, '[小傅Fox的日常]关于学校规定的个人意见', '学校今天强调了不允许私自出校门、不允许吃外卖这两条规定。个人认为，这两条规定影响了学生的个人自由，破坏了餐饮市场竞争，因此我反对这两条规定，那么就在这里姑且谈谈自己的看法。
首先说“不允许私自出校门”。学校规定，除有原因的走读生外，所有人都应当住宿；校门仅在周日返校和周五放学时可以自由出入，其他时刻必须持走读卡或假条，在规定的时间出入学校，不按规定进出校门可给予处分。这项规定，不仅干涉了学生的自由，而且违反了法律。
在法律意义上，我国《宪法》赋予了公民以人身自由，《立法法》规定了限制公民人身自由的必须是法律，《刑法》《治安管理处罚法》等均有对非法限制公民人身自由的处罚规定。虽然《教育法》赋予了学校制定章程和按照章程自主管理的权利，但是章程并不属于法律，没有由全国人大及其常委会通过，因此其不可以制定限制学生人身自由的条款。
在个人自由层面上，每个人都应当拥有人身自由，每个人都应当拥有自由行动的权利。在学校的休息时间，学生自然应当拥有自由决定自己去向的权利。这种权利并不是建立在干涉他人的基础上的，因此其应当被准许；之所以学生不能够在教学时间自由行动，是因为其的行动会干涉他人听课、自习，这两种情形存在着本质差距。
当然，我们可以考虑到，学校具有培养学生人格的特殊地位，并具有由此产生的特殊的社会责任，但这两者并不能成为其限制学生进出校门的原因。
个人人格的形成，与个人、家庭、学校乃至社会有着密切的关系，学校作为学生生活的主要环境，具有重要的地位，其当然可以运用一定的手段对学生进行人格培养，比如对寝室、教室的整洁程度进行评比，但这些手段不应当违反法律，不应当干涉个人独立人格与个人自由。在人类历史长河中，丰富的经验已经告诉我们，文化应到具有包容性、多样性。明清时期的八股取士、法西斯的军国主义教育与苏联的个人崇拜主义可以充分地说明文化失去了包容性与多样性，就会失去发展的能力。文化的多样性，如“一百个人就有一百个哈姆雷特”所说，正是建立在个体人格的多样性上的，而个体人格的多样性与对个人自由的尊重程度密切相关。如果个人没有自由，那么每一个人就是公式化的，个体人格也就是近乎一致的，个体人格在这种情形下失去了多样性。
此外，在现代社会中，依法治国、法律至上有着越来越重要的地位，法律是社会有序高效运行的保障，因此公民应当具有法律意识、法治意识，而学校作为人格培养的重要环节，不仅应当教育学生遵守法律，更应当以身作则践行法治思想。在人的未成年阶段，模仿是重要的学习方法，只有周围环境充分地尊重法律，人才能建立积极的法治思想。
同时，由于我国特殊的历史背景和独特的文化，学校为学生安全承担了过重的责任，这可能是学校危言危行、限制学生自由的原因，但我认为，随着时代的进步，我们有更好的方案来解决这一问题，现有的方案简单但缺乏人文关怀与法治意识，是“懒政”的产物。时代在进步，规定也应该随之有所改变，只有这样规定才是积极的规定，规定才能适应于时代。我们可以在学校附近的人行横道处设立主动式红绿灯，引导学生走人行横道来保障学生的安全；在校门口设立记录设施，记录学生出入校门的情况，来确定学生去向、明确责任归属。这可能不能马上执行，但是我希望学校能够开始做出改变。
其次说“不允许吃外卖”。学校起先禁止在教室内吃外卖，后来扩展到了全校，食堂则一直禁止学生在其中食用外卖。这条规定，同样干涉了学生的自由，同时破坏了正常的市场秩序。
自1992年我国开始实行市场经济以来，市场观念逐渐深入人心，同时国有企业等利用行政手段获取特殊市场地位的行为越来越为人不齿，积极有序的市场竞争有效地促进了产品与服务的改进和企业生产与管理的改进。从百度搜索技术水平低下、中石油中石化无心改善油品质量和价格、英特尔按计划而非发展发布新品等垄断性企业案例中，我们不难看出，只有市场产生了有效、有力、有序的竞争，企业才能有发展的动力。这种理论，同样可以适用于学校内的食品。学校食堂长期以来，以漫长的排队时间、低下的就餐环境和较差的食物口感、单一的食物品种为学生诟病，这一方面是由于食堂不得不维持较低的价格，但也有缺乏市场竞争的原因。我认为市场竞争可以有效地促进食堂更多的制作学生喜闻乐见的菜品，改善排队时间长的问题，减少学生对于学校及食堂的不满。为了形成有效的市场竞争机制，学校必须尊重学生作为消费者的自由选择商品的权利。只有消费者可以自由的选择商品，市场由于行政干预等原因产生的垄断才会被打破，市场才可能形成有效、有力、有序的竞争。
诚然，外卖为学校带来了管理上的困难。由于缺乏稳定的就餐环境，学生常常选择操场、天台等场所就餐，影响了这些场所原有的功能，破坏了这些场所应有的整洁与宁静。但我认为，这些现象并不能成为学校禁止外卖的理由。如上文所说，时代的进步会产生新的解决方案。在这一问题上，我认为学校可以划设一些场所在中午专门用来食用外卖，同时建立有效、有力的管理机制，促使学生自觉、自主地处理好餐后垃圾，从而减少上述现象的发生。
此外，学校由于其具有的特别的性质，应当持续存在，而我认为市场竞争的引入并不会导致食堂的亏损或者倒闭，相反地，食堂将会得到有效的发展，同时学校也将从中受益。食堂具有处于校内、价格低廉、食品安全、特色菜品等四大独特的竞争优势，其中前三者更是其他餐饮品牌难以实现的，因此其将在市场竞争中具有独特的优势，依然可以吸引大量的学生就餐。同时，市场中“看不见的手”将促使食堂改变一些经营方向与生产方式，可以有效减少学生的不满并收获更多的赞许。综上所述，学校同样可以开始改变来逐步消除对外卖的限制。
我希望我们的学校作为优才的摇篮、育人的熔炉，可以走在时代前列，能够勇于变革；学校领导和规则的制定者、实施者没有封建官僚的气质而拥有新时代官员的朝气，开始对上述两条规定进行修改。我希望我们所处的环境是一个强调人文关怀、重视法治法制、关注个人自由的环境。', '学校今天强调了不允许私自出校门、不允许吃外卖这两条规定。个人认为，这两条规定影响了学生的个人自由，破坏了餐饮市场竞争，因此我反对这两条规定，那么就在这里姑且谈谈自己的看法。
首先说“不允许私自出校门”。学校规定，除有原因的走读生外，所有人都应当住宿；校门仅在周日返校和周五放学时可以自由出入，其他时刻必须持走读卡或假条，在规定的时间出入学校，不按规定进出校门可给予处分。这项规定，不仅干涉了学生的自由，而且违反了法律。
在法律意义上，我国《宪法》赋予了公民以人身自由，《立法法》规定了限制公民人身自由的必须是法律，《刑法》《治安管理处罚法》等均有对非法限制公民人身自由的处罚规定。虽然《教育法》赋予了学校制定章程和按照章程自主管理的权利，但是章程并不属于法律，没有由全国人大及其常委会通过，因此其不可以制定限制学生人身自由的条款。
在个人自由层面上，每个人都应当拥有人身自由，每个人都应当拥有自由行动的权利。在学校的休息时间，学生自然应当拥有自由决定自己去向的权利。这种权利并不是建立在干涉他人的基础上的，因此其应当被准许；之所以学生不能够在教学时间自由行动，是因为其的行动会干涉他人听课、自习，这两种情形存在着本质差距。
当然，我们可以考虑到，学校具有培养学生人格的特殊地位，并具有由此产生的特殊的社会责任，但这两者并不能成为其限制学生进出校门的原因。
个人人格的形成，与个人、家庭、学校乃至社会有着密切的关系，学校作为学生生活的主要环境，具有重要的地位，其当然可以运用一定的手段对学生进行人格培养，比如对寝室、教室的整洁程度进行评比，但这些手段不应当违反法律，不应当干涉个人独立人格与个人自由。在人类历史长河中，丰富的经验已经告诉我们，文化应到具有包容性、多样性。明清时期的八股取士、法西斯的军国主义教育与苏联的个人崇拜主义可以充分地说明文化失去了包容性与多样性，就会失去发展的能力。文化的多样性，如“一百个人就有一百个哈姆雷特”所说，正是建立在个体人格的多样性上的，而个体人格的多样性与对个人自由的尊重程度密切相关。如果个人没有自由，那么每一个人就是公式化的，个体人格也就是近乎一致的，个体人格在这种情形下失去了多样性。
此外，在现代社会中，依法治国、法律至上有着越来越重要的地位，法律是社会有序高效运行的保障，因此公民应当具有法律意识、法治意识，而学校作为人格培养的重要环节，不仅应当教育学生遵守法律，更应当以身作则践行法治思想。在人的未成年阶段，模仿是重要的学习方法，只有周围环境充分地尊重法律，人才能建立积极的法治思想。
同时，由于我国特殊的历史背景和独特的文化，学校为学生安全承担了过重的责任，这可能是学校危言危行、限制学生自由的原因，但我认为，随着时代的进步，我们有更好的方案来解决这一问题，现有的方案简单但缺乏人文关怀与法治意识，是“懒政”的产物。时代在进步，规定也应该随之有所改变，只有这样规定才是积极的规定，规定才能适应于时代。我们可以在学校附近的人行横道处设立主动式红绿灯，引导学生走人行横道来保障学生的安全；在校门口设立记录设施，记录学生出入校门的情况，来确定学生去向、明确责任归属。这可能不能马上执行，但是我希望学校能够开始做出改变。
其次说“不允许吃外卖”。学校起先禁止在教室内吃外卖，后来扩展到了全校，食堂则一直禁止学生在其中食用外卖。这条规定，同样干涉了学生的自由，同时破坏了正常的市场秩序。
自1992年我国开始实行市场经济以来，市场观念逐渐深入人心，同时国有企业等利用行政手段获取特殊市场地位的行为越来越为人不齿，积极有序的市场竞争有效地促进了产品与服务的改进和企业生产与管理的改进。从百度搜索技术水平低下、中石油中石化无心改善油品质量和价格、英特尔按计划而非发展发布新品等垄断性企业案例中，我们不难看出，只有市场产生了有效、有力、有序的竞争，企业才能有发展的动力。这种理论，同样可以适用于学校内的食品。学校食堂长期以来，以漫长的排队时间、低下的就餐环境和较差的食物口感、单一的食物品种为学生诟病，这一方面是由于食堂不得不维持较低的价格，但也有缺乏市场竞争的原因。我认为市场竞争可以有效地促进食堂更多的制作学生喜闻乐见的菜品，改善排队时间长的问题，减少学生对于学校及食堂的不满。为了形成有效的市场竞争机制，学校必须尊重学生作为消费者的自由选择商品的权利。只有消费者可以自由的选择商品，市场由于行政干预等原因产生的垄断才会被打破，市场才可能形成有效、有力、有序的竞争。
诚然，外卖为学校带来了管理上的困难。由于缺乏稳定的就餐环境，学生常常选择操场、天台等场所就餐，影响了这些场所原有的功能，破坏了这些场所应有的整洁与宁静。但我认为，这些现象并不能成为学校禁止外卖的理由。如上文所说，时代的进步会产生新的解决方案。在这一问题上，我认为学校可以划设一些场所在中午专门用来食用外卖，同时建立有效、有力的管理机制，促使学生自觉、自主地处理好餐后垃圾，从而减少上述现象的发生。
此外，学校由于其具有的特别的性质，应当持续存在，而我认为市场竞争的引入并不会导致食堂的亏损或者倒闭，相反地，食堂将会得到有效的发展，同时学校也将从中受益。食堂具有处于校内、价格低廉、食品安全、特色菜品等四大独特的竞争优势，其中前三者更是其他餐饮品牌难以实现的，因此其将在市场竞争中具有独特的优势，依然可以吸引大量的学生就餐。同时，市场中“看不见的手”将促使食堂改变一些经营方向与生产方式，可以有效减少学生的不满并收获更多的赞许。综上所述，学校同样可以开始改变来逐步消除对外卖的限制。
我希望我们的学校作为优才的摇篮、育人的熔炉，可以走在时代前列，能够勇于变革；学校领导和规则的制定者、实施者没有封建官僚的气质而拥有新时代官员的朝气，开始对上述两条规定进行修改。我希望我们所处的环境是一个强调人文关怀、重视法治法制、关注个人自由的环境。<p><a href="https://xfox.me/post/2015-11-20-%E5%85%B3%E4%BA%8E%E5%AD%A6%E6%A0%A1%E8%A7%84%E5%AE%9A%E7%9A%84%E4%B8%AA%E4%BA%BA%E6%84%8F%E8%A7%81-13/">查看原文</a></p>', '2018-05-30 07:06:14.826947+08', '2018-05-30 16:18:38.929161+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('80c0ed42-23ed-433c-9962-a4a9a6bda10f', true, '[小傅Fox的日常]如何看待 19 岁少女在「戒网瘾学校」被虐至死？', '如何看待 19 岁少女在「戒网瘾学校」被虐至死？ http://www.zhihu.com/question/24205341 （分享自知乎网）
 我们必须承认，这确确实实地发生在中国的土地上。
也许父母都是城市中产阶级的我们很少接触到这些故事。
这个时代也许人们已经麻木了。
这是社会和我们的政府的错误。
我们也许现在没有力量去改变什么，但是我们必须明白，
当我们获得了一定程度上阻止这些事情的发生时，我们必须尽力阻止。
有一个回答里面写道，
 这个国家的公民不应当没有违法而失去自由。
 我扩展一下，
这个国家的公民不应当没有违法而失去自由，也不应当在任何时刻被殴打、被侮辱，和在法律和道德要求的限度外被索取，不应当失去诉说事情真相和自己主张的权利，不应当被阻止与更广阔的世界接触。
所以，这个学校是反道德和反伦理的。
我们必须清楚，这个时代不像我们看到的那样美好，
不是所有人都能生存，有人甚至连不能生存都说不上；
不是所有地方人身安全都能得到保障，有的地方甚至剥夺生命都很平常；
不是所有人都有能力去追求自己热爱的，有的人甚至不能要求自己必需的。
我们必须清楚，我们未来，若能掌握力量，必须阻止这样的事情发生：
我们要避免冷漠和残忍，
我们要宣传科学和辩证，
我们要普及法制和自由。
比较难以平静，瞎写一些，有不当的地方请指正。', '如何看待 19 岁少女在「戒网瘾学校」被虐至死？ http://www.zhihu.com/question/24205341 （分享自知乎网）
 我们必须承认，这确确实实地发生在中国的土地上。
也许父母都是城市中产阶级的我们很少接触到这些故事。
这个时代也许人们已经麻木了。
这是社会和我们的政府的错误。
我们也许现在没有力量去改变什么，但是我们必须明白，
当我们获得了一定程度上阻止这些事情的发生时，我们必须尽力阻止。
有一个回答里面写道，
 这个国家的公民不应当没有违法而失去自由。
 我扩展一下，
这个国家的公民不应当没有违法而失去自由，也不应当在任何时刻被殴打、被侮辱，和在法律和道德要求的限度外被索取，不应当失去诉说事情真相和自己主张的权利，不应当被阻止与更广阔的世界接触。
所以，这个学校是反道德和反伦理的。
我们必须清楚，这个时代不像我们看到的那样美好，
不是所有人都能生存，有人甚至连不能生存都说不上；
不是所有地方人身安全都能得到保障，有的地方甚至剥夺生命都很平常；
不是所有人都有能力去追求自己热爱的，有的人甚至不能要求自己必需的。
我们必须清楚，我们未来，若能掌握力量，必须阻止这样的事情发生：
我们要避免冷漠和残忍，
我们要宣传科学和辩证，
我们要普及法制和自由。
比较难以平静，瞎写一些，有不当的地方请指正。<p><a href="https://xfox.me/post/2015-02-21-%E5%A6%82%E4%BD%95%E7%9C%8B%E5%BE%85-19-%E5%B2%81%E5%B0%91%E5%A5%B3%E5%9C%A8%E6%88%92%E7%BD%91%E7%98%BE%E5%AD%A6%E6%A0%A1%E8%A2%AB%E8%99%90%E8%87%B3%E6%AD%BB-33/">查看原文</a></p>', '2018-05-30 07:06:14.813451+08', '2018-05-30 16:18:39.047404+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('1c50857c-0c6c-48ed-8e27-bdf59bb2517e', true, '[小傅Fox的日常]栗山美如画！', ' 声明：此图片版权归番剧《境界的彼方》作者所有，不适用本博客的版权声明。
 ', ' 声明：此图片版权归番剧《境界的彼方》作者所有，不适用本博客的版权声明。
 <p><a href="https://xfox.me/post/2015-04-26--28/">查看原文</a></p>', '2018-05-30 07:06:14.814084+08', '2018-05-30 16:18:38.98607+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('30df6edf-c744-4caa-b817-3f490ea7b07c', true, '[小傅Fox的日常]又一个头像', '<p><a href="https://xfox.me/post/2015-01-30--48/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2015-01-30--48/">查看原文</a></p>', '2018-05-30 07:06:14.798046+08', '2018-05-30 16:18:39.047548+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d96f9f80-6728-4377-b2f5-e722859480a5', true, '[小傅Fox的日常]又是头像', '<p><a href="https://xfox.me/post/2017-07-10-%E5%8F%88%E6%98%AF%E5%A4%B4%E5%83%8F/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2017-07-10-%E5%8F%88%E6%98%AF%E5%A4%B4%E5%83%8F/">查看原文</a></p>', '2018-05-30 07:06:14.848309+08', '2018-05-30 16:18:38.82537+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('a35ae726-a408-4cb0-bfbc-f88856a6d38d', true, '[小傅Fox的日常]日常瞎拍', '<p><a href="https://xfox.me/post/2015-02-14--38/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2015-02-14--38/">查看原文</a></p>', '2018-05-30 07:06:14.805957+08', '2018-05-30 16:18:39.053909+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('e2d2aee9-f77b-4423-8387-87bb91b80d24', true, '[小傅Fox的日常]学习成绩和个人非特征信息的关系', '这是一份问卷的结果分析……
学习成绩和个人非特征信息的关系
当然现在还可以回答……我的数据量不够求支持……
 首先我们抛开成绩看看总体……
问卷总量13，有点少……
性别的分布频率如图。
 出现了很明显的分布不均匀问题，可能是女性互联网的使用率略低，可能需要改进数据收集方式。
 成绩的分布规律如图。这里我们取0为学校平均水平，数据为用户自评。我们根据对用户的了解进行了修正后，分布频率不变但是具体数值出现了小范围改变。变化如下：
对于政治相关，我们采用了zuobiao.me的政治坐标系测试服务。
 政治观念坐标，负值为左，即威权主义 (Authoritarianism)，正值为右，即自由主义 (Libertarianism)。
社会文化观念坐标，负值为保守与复古派 (Conservatism)，正值为自由与激进派 (Liberalism)。
经济观念坐标，负值为左，即集体主义与福利主义 (Welfarism, Collectivism)，正值为右，即新自由主义(Neoliberalism)。
 三列依次为政治、社会文化、经济。
表格中深绿色无数据的一行的为自评全右，但是没有提交测试数据。
 我们发现，同学们中带有左倾向和带有右倾向的同学大致半分。同学普遍数据分布在±0.5左右和0左右。
 对于音乐的表现如下：
 很多同学都喜欢中国风、摇滚和乡村音乐，其中喜爱乡村音乐的人数最多。
 读书上，同学们表现如下：
 所有被调查同学都喜爱阅读小说/诗歌/散文 类文学，爱好均分布广泛，但是教辅材料的阅读量较少。
 对于一些问题的态度，同学们表示如下：
 对同性恋和转基因的看法较多样，对非电离辐射的看法普遍较不反对。
较多数同学都反感EXO和TFBoys，而所有的同学都对Taylor Swift表达不同程度的看好。
对诺基亚、HTC、小米、魅族和苹果的看法普遍较好，对于微软移动部门普遍持中立看法。
对于中国共产党，在内战时期多数人支持，改革开放前则持反对看法，当前看法相对多样。对国民党民国时期看法多样，当前则普遍看好。
相对而言数据准确性应当较好，数据分布频率适中。
 那么高中阶段应当做的事情中，所有人都支持“培养自身修养和价值观”，较少人但仍过半支持了“学习”，其它选项支持率均较高，但是没有人对四个选项提出了补充。
对于“什么能够提高学习成绩”，多数人都不认同谈恋爱可以提高学习成绩，所有人都认为“个人爱好/学术”可以帮助提高学习成绩，其它选项比较平均。
含成绩的一会再说……', '这是一份问卷的结果分析……
学习成绩和个人非特征信息的关系
当然现在还可以回答……我的数据量不够求支持……
 首先我们抛开成绩看看总体……
问卷总量13，有点少……
性别的分布频率如图。
 出现了很明显的分布不均匀问题，可能是女性互联网的使用率略低，可能需要改进数据收集方式。
 成绩的分布规律如图。这里我们取0为学校平均水平，数据为用户自评。我们根据对用户的了解进行了修正后，分布频率不变但是具体数值出现了小范围改变。变化如下：
对于政治相关，我们采用了zuobiao.me的政治坐标系测试服务。
 政治观念坐标，负值为左，即威权主义 (Authoritarianism)，正值为右，即自由主义 (Libertarianism)。
社会文化观念坐标，负值为保守与复古派 (Conservatism)，正值为自由与激进派 (Liberalism)。
经济观念坐标，负值为左，即集体主义与福利主义 (Welfarism, Collectivism)，正值为右，即新自由主义(Neoliberalism)。
 三列依次为政治、社会文化、经济。
表格中深绿色无数据的一行的为自评全右，但是没有提交测试数据。
 我们发现，同学们中带有左倾向和带有右倾向的同学大致半分。同学普遍数据分布在±0.5左右和0左右。
 对于音乐的表现如下：
 很多同学都喜欢中国风、摇滚和乡村音乐，其中喜爱乡村音乐的人数最多。
 读书上，同学们表现如下：
 所有被调查同学都喜爱阅读小说/诗歌/散文 类文学，爱好均分布广泛，但是教辅材料的阅读量较少。
 对于一些问题的态度，同学们表示如下：
 对同性恋和转基因的看法较多样，对非电离辐射的看法普遍较不反对。
较多数同学都反感EXO和TFBoys，而所有的同学都对Taylor Swift表达不同程度的看好。
对诺基亚、HTC、小米、魅族和苹果的看法普遍较好，对于微软移动部门普遍持中立看法。
对于中国共产党，在内战时期多数人支持，改革开放前则持反对看法，当前看法相对多样。对国民党民国时期看法多样，当前则普遍看好。
相对而言数据准确性应当较好，数据分布频率适中。
 那么高中阶段应当做的事情中，所有人都支持“培养自身修养和价值观”，较少人但仍过半支持了“学习”，其它选项支持率均较高，但是没有人对四个选项提出了补充。
对于“什么能够提高学习成绩”，多数人都不认同谈恋爱可以提高学习成绩，所有人都认为“个人爱好/学术”可以帮助提高学习成绩，其它选项比较平均。
含成绩的一会再说……<p><a href="https://xfox.me/post/2015-02-01-%E5%AD%A6%E4%B9%A0%E6%88%90%E7%BB%A9%E5%92%8C%E4%B8%AA%E4%BA%BA%E9%9D%9E%E7%89%B9%E5%BE%81%E4%BF%A1%E6%81%AF%E7%9A%84%E5%85%B3%E7%B3%BB-47/">查看原文</a></p>', '2018-05-30 07:06:14.785964+08', '2018-05-30 16:18:43.47569+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('112e3960-783e-467d-8bd2-3dfe93cf3f95', true, '[小傅Fox的日常]星海公园', '<p><a href="https://xfox.me/post/2014-11-16--58/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2014-11-16--58/">查看原文</a></p>', '2018-05-30 07:06:14.766689+08', '2018-05-30 16:18:43.534925+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('f3accc6c-585a-4e41-9e31-23f41392b0b4', true, '[小傅Fox的日常]一些头像', '今天借着想把Lofter头像转90度的想法，重新配色修改了一下头像~
绿色调（Lofter）
蓝-紫（Gravatar和GitHub）
蓝-黄（微博）
蓝-紫（QQ、贴吧）
 评论区： Joy Neop： Gayradient&hellip; [2014-06-04 01:21:43]
 ', '今天借着想把Lofter头像转90度的想法，重新配色修改了一下头像~
绿色调（Lofter）
蓝-紫（Gravatar和GitHub）
蓝-黄（微博）
蓝-紫（QQ、贴吧）
 评论区： Joy Neop： Gayradient&hellip; [2014-06-04 01:21:43]
 <p><a href="https://xfox.me/post/2014-06-02-%E4%B8%80%E4%BA%9B%E5%A4%B4%E5%83%8F-75/">查看原文</a></p>', '2018-05-30 07:06:14.774759+08', '2018-05-30 16:18:43.539406+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('b29e7087-ad77-4b00-bd67-0488364a6813', true, '[小傅Fox的日常]育才杀海报瞎涂', '<p><a href="https://xfox.me/post/2014-11-01--59/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2014-11-01--59/">查看原文</a></p>', '2018-05-30 07:06:14.77346+08', '2018-05-30 16:18:43.539014+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('111ad247-a715-47b0-9c5d-ae7d33a8d2c9', true, '[小傅Fox的日常]关于《境界的彼方》的一些感受', '在杨也驰同学的Cosplay的引导下终于入了动漫坑……第一部看的是《境界的彼方》。至于为什么，当然是因为杨也驰cos的是女主栗山未来啊！【这里才没有什么奇怪的意思呢
╭(╯^╰)╮那么下面就谈谈感受吧，这部作品带给我的震撼不亚于《三体》，很好的洗涤了我在繁华的世界、喧嚣的城池里充满戾气的心。
这部作品虽然主要是描写和“妖梦”斗争的故事，但是绝不像国内某些动画，满篇的打打杀杀，而是充满着温馨、美好、爱情。可以说，这部动漫彻底改变了我对于日本动漫一直以来的偏见。这不仅仅是一个故事，更带给了我关于人性的思考。
 评论区： 博客没有名称： 你也看境彼！！！特别喜欢！ [2015-01-01 19:38:50]
Dimpurr： =w= 境界的彼方确实是相当不错 .. http://bgm.tv/user/myccyycy
羊毛和花： 欢迎入坑www [2014-06-27 19:50:22]
 ', '在杨也驰同学的Cosplay的引导下终于入了动漫坑……第一部看的是《境界的彼方》。至于为什么，当然是因为杨也驰cos的是女主栗山未来啊！【这里才没有什么奇怪的意思呢
╭(╯^╰)╮那么下面就谈谈感受吧，这部作品带给我的震撼不亚于《三体》，很好的洗涤了我在繁华的世界、喧嚣的城池里充满戾气的心。
这部作品虽然主要是描写和“妖梦”斗争的故事，但是绝不像国内某些动画，满篇的打打杀杀，而是充满着温馨、美好、爱情。可以说，这部动漫彻底改变了我对于日本动漫一直以来的偏见。这不仅仅是一个故事，更带给了我关于人性的思考。
 评论区： 博客没有名称： 你也看境彼！！！特别喜欢！ [2015-01-01 19:38:50]
Dimpurr： =w= 境界的彼方确实是相当不错 .. http://bgm.tv/user/myccyycy
羊毛和花： 欢迎入坑www [2014-06-27 19:50:22]
 <p><a href="https://xfox.me/post/2014-06-27-%E5%85%B3%E4%BA%8E%E5%A2%83%E7%95%8C%E7%9A%84%E5%BD%BC%E6%96%B9%E7%9A%84%E4%B8%80%E4%BA%9B%E6%84%9F%E5%8F%97-69/">查看原文</a></p>', '2018-05-30 07:06:14.756462+08', '2018-05-30 16:18:43.561074+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('de622b5a-2c9f-4487-8ab0-a648e8f3c5bb', true, '[小傅Fox的日常]一篇小说的构想', '情节主线：
男主自学生时代一直喜欢的妹子是女同，要形婚，男主就和妹子形婚了
人物设定：
【男主】江夜：有轻微跨性别倾向，颜值一般（但是女装的时候很好看），软件工程师，身高178cm，上等中产阶级
【女主】韩海歌：女同（攻），颜值高（仅限于非体现柔和美的服装），外资企业技术员，身高164cm，上等中产阶级
谁要能写出来就写出来吧……
 评论区： Joy Neop： 哈哈哈哈哈哈哈哈 [2015-11-20 16:43:40]
博客没有名称： ……你的脑洞 [2015-05-30 19:22:02]
 ', '情节主线：
男主自学生时代一直喜欢的妹子是女同，要形婚，男主就和妹子形婚了
人物设定：
【男主】江夜：有轻微跨性别倾向，颜值一般（但是女装的时候很好看），软件工程师，身高178cm，上等中产阶级
【女主】韩海歌：女同（攻），颜值高（仅限于非体现柔和美的服装），外资企业技术员，身高164cm，上等中产阶级
谁要能写出来就写出来吧……
 评论区： Joy Neop： 哈哈哈哈哈哈哈哈 [2015-11-20 16:43:40]
博客没有名称： ……你的脑洞 [2015-05-30 19:22:02]
 <p><a href="https://xfox.me/post/2015-05-30-%E4%B8%80%E7%AF%87%E5%B0%8F%E8%AF%B4%E7%9A%84%E6%9E%84%E6%83%B3-24/">查看原文</a></p>', '2018-05-30 07:06:14.817652+08', '2018-05-30 16:18:38.971768+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('dd5be479-0a1c-4c2b-a1ba-ea1b33a8a8ee', true, ' 快递 yunda-1600887249033 有新动态', '[辽宁沈阳浑南开发公司康泰小区便民寄存分部]进行派件扫描；派送业务员：赵丽丽；联系电话：13840405318', '[辽宁沈阳浑南开发公司康泰小区便民寄存分部]进行派件扫描；派送业务员：赵丽丽；联系电话：13840405318', '2018-05-30 07:06:09.439956+08', '2018-05-30 16:18:43.62798+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('7672333b-8d1b-41b6-b24e-bf484da0478e', true, '[小傅Fox的日常]博客迁移到 Hugo', '<p>感觉用 <a href="https://hexo.io">Hexo</a> 编译博客越来越慢了，而且 Hexo 社区也不怎么活跃，索性把博客迁移到了 <a href="https://gohugo.io/">Hugo</a>。虽然我个人很讨厌 Golang，但是 Hugo 的用户体验还是不错的。之前用 Hexo 的时候要修改主题的内容就要修改主题目录内的文件（哪怕只是加菜单），给自动化构建带来了很大的困扰，而 Hugo 就没有这种问题。那么这篇讲讲自动化构建吧。</p>

<p></p>', '<p>感觉用 <a href="https://hexo.io">Hexo</a> 编译博客越来越慢了，而且 Hexo 社区也不怎么活跃，索性把博客迁移到了 <a href="https://gohugo.io/">Hugo</a>。虽然我个人很讨厌 Golang，但是 Hugo 的用户体验还是不错的。之前用 Hexo 的时候要修改主题的内容就要修改主题目录内的文件（哪怕只是加菜单），给自动化构建带来了很大的困扰，而 Hugo 就没有这种问题。那么这篇讲讲自动化构建吧。</p>

<p></p><p><a href="https://xfox.me/post/2018-05-02-%E5%8D%9A%E5%AE%A2%E8%BF%81%E7%A7%BB%E5%88%B0hugo/">查看原文</a></p>', '2018-05-30 07:06:14.86434+08', '2018-05-30 16:18:38.737257+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('311c90b0-fbcf-4084-8f24-eb24af2f4823', true, '[小傅Fox的日常]梨花香的歌0：我并不希望没有那天', ' 决定写轻小说。本来语文就不太好，大家凑活着看吧。
这是第0章（OVA）。
 我牵着她的手，走在林子里。一阵风吹来，她的发丝拂在我脸上，痒痒的。
她抬头望向天空，在碧绿的叶子间透过些许的蓝天。这时，我看向她，她似乎是发现了我的目光，两个人相视一笑。
“这两年发生了很多变化呢。”我轻轻地说，远处传来鸟鸣。
“是啊。现在，你终于回到了以前呢。”
“但我们都变了，这世界也变了。”
“是啊，都变了。”
我们坐下，手触着泥土，四周是笔直的白桦树，阳光透过树梢在地上留下斑驳的影子。
几秒后，我们相拥在一起。我又闻到了那熟悉的梨花香。
所谓幸福，就是，一切都是淡淡的。我并不希望没有那天。
 后文：1 那天的歌声和娇小的少女一直印在我的脑海里
 ', ' 决定写轻小说。本来语文就不太好，大家凑活着看吧。
这是第0章（OVA）。
 我牵着她的手，走在林子里。一阵风吹来，她的发丝拂在我脸上，痒痒的。
她抬头望向天空，在碧绿的叶子间透过些许的蓝天。这时，我看向她，她似乎是发现了我的目光，两个人相视一笑。
“这两年发生了很多变化呢。”我轻轻地说，远处传来鸟鸣。
“是啊。现在，你终于回到了以前呢。”
“但我们都变了，这世界也变了。”
“是啊，都变了。”
我们坐下，手触着泥土，四周是笔直的白桦树，阳光透过树梢在地上留下斑驳的影子。
几秒后，我们相拥在一起。我又闻到了那熟悉的梨花香。
所谓幸福，就是，一切都是淡淡的。我并不希望没有那天。
 后文：1 那天的歌声和娇小的少女一直印在我的脑海里
 <p><a href="https://xfox.me/post/2015-04-24-%E6%A2%A8%E8%8A%B1%E9%A6%99%E7%9A%84%E6%AD%8C0%E6%88%91%E5%B9%B6%E4%B8%8D%E5%B8%8C%E6%9C%9B%E6%B2%A1%E6%9C%89%E9%82%A3%E5%A4%A9-30/">查看原文</a></p>', '2018-05-30 07:06:14.81212+08', '2018-05-30 16:18:39.01641+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d51ad932-a73b-447d-b806-a9eb40d3aa58', true, '[小傅Fox的日常]也许，会和有意思的你走过三年', '我会静静地呆在教室里，
不时地望向你的方向。
我当然是不满足这些的，
但是我更不希望距离。
所以，
就让沉默成为一切的基调，
和有意思的你走过未来三年，
同窗经历。', '我会静静地呆在教室里，
不时地望向你的方向。
我当然是不满足这些的，
但是我更不希望距离。
所以，
就让沉默成为一切的基调，
和有意思的你走过未来三年，
同窗经历。<p><a href="https://xfox.me/post/2014-12-31-%E4%B9%9F%E8%AE%B8%E4%BC%9A%E5%92%8C%E6%9C%89%E6%84%8F%E6%80%9D%E7%9A%84%E4%BD%A0%E8%B5%B0%E8%BF%87%E4%B8%89%E5%B9%B4-52/">查看原文</a></p>', '2018-05-30 07:06:14.776456+08', '2018-05-30 16:18:43.480941+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('0aa655de-3ad9-4cfd-9e41-c949361cd01b', true, '[小傅Fox的日常]日常瞎拍', '<p><a href="https://xfox.me/post/2015-02-13--41/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2015-02-13--41/">查看原文</a></p>', '2018-05-30 07:06:14.797806+08', '2018-05-30 16:18:39.057732+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('d150b0a8-db12-4c81-9c64-40bc4a345d89', true, '[小傅Fox的日常]我要变成萌妹子！：章节目录', '1 冬日的休眠与萌发', '1 冬日的休眠与萌发<p><a href="https://xfox.me/post/2016-04-21-%E6%88%91%E8%A6%81%E5%8F%98%E6%88%90%E8%90%8C%E5%A6%B9%E5%AD%90%E7%AB%A0%E8%8A%82%E7%9B%AE%E5%BD%95-4/">查看原文</a></p>', '2018-05-30 07:06:14.838757+08', '2018-05-30 16:18:38.871022+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('12b2fb45-bd90-4dc3-bae8-b1950cab136b', true, '[小傅Fox的日常]青年大街瞎拍', '<p><a href="https://xfox.me/post/2017-07-10-%E9%9D%92%E5%B9%B4%E5%A4%A7%E8%A1%97%E7%9E%8E%E6%8B%8D/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2017-07-10-%E9%9D%92%E5%B9%B4%E5%A4%A7%E8%A1%97%E7%9E%8E%E6%8B%8D/">查看原文</a></p>', '2018-05-30 07:06:14.8528+08', '2018-05-30 16:18:38.80844+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('bcd34696-fc30-4cc0-b649-8873a85acad4', true, '[小傅Fox的日常]除夕瞎拍', '<p><a href="https://xfox.me/post/2017-01-27-%E9%99%A4%E5%A4%95%E7%9E%8E%E6%8B%8D/">查看原文</a></p>', '<p><a href="https://xfox.me/post/2017-01-27-%E9%99%A4%E5%A4%95%E7%9E%8E%E6%8B%8D/">查看原文</a></p>', '2018-05-30 07:06:14.841528+08', '2018-05-30 16:18:38.855245+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);
INSERT INTO public.message (id, readed, title, summary, content, created_at, updated_at, subscription_id, href) VALUES ('e9342a05-16cb-4715-a8df-d60ef7a33d89', true, '[小傅Fox的日常]博客迁移到hexo', '花了一上午时间，把博客从 Ghost 迁移到了 Hexo。
一方面是 Ghost 并没有我喜欢的主题，另一方面是想减少服务器的内存占用（然而加上 Isso 以后并没有减少内存占用）。
此外就是把地址从 https://xfox.pw 迁到了 https://xfox.me，而且给 https://xfox.pw、https://www.xfox.pw、https://www.xfox.me 都加上了到当前域名的重定向。
原来在 LoftER 上的文章都被我迁移过来了！
RSS 地址还是 https://xfox.me/rss，也许哪天心情好就加上 JSON Feed 支持。', '花了一上午时间，把博客从 Ghost 迁移到了 Hexo。
一方面是 Ghost 并没有我喜欢的主题，另一方面是想减少服务器的内存占用（然而加上 Isso 以后并没有减少内存占用）。
此外就是把地址从 https://xfox.pw 迁到了 https://xfox.me，而且给 https://xfox.pw、https://www.xfox.pw、https://www.xfox.me 都加上了到当前域名的重定向。
原来在 LoftER 上的文章都被我迁移过来了！
RSS 地址还是 https://xfox.me/rss，也许哪天心情好就加上 JSON Feed 支持。<p><a href="https://xfox.me/post/2017-07-10-%E5%8D%9A%E5%AE%A2%E8%BF%81%E7%A7%BB%E5%88%B0hexo/">查看原文</a></p>', '2018-05-30 07:06:14.852021+08', '2018-05-30 16:18:38.811816+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', NULL);


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: coderfox
--

INSERT INTO public.service (id, name, token, description, created_at, updated_at) VALUES ('265d5310-dc29-4f35-9e07-f6b74f6bef26', '哔哩哔哩 UP 主动态', 'e1833bb8-9ad3-43ac-ab1b-8a9a24251220', '测试中。配置信息请填写 uid。', '2018-05-27 19:40:11.767924+08', '2018-05-27 19:40:11.767924+08');
INSERT INTO public.service (id, name, token, description, created_at, updated_at) VALUES ('47bf7a7f-78dc-4b07-850f-9969080a0c19', '哔哩哔哩关注动态', '22a77b2d-71f8-4388-9a8a-679738c5e403', '测试中。配置信息请填写 cookies。支持的动态类型：图片、文字、投稿、小视频、番剧、文章。', '2018-05-27 19:40:11.769868+08', '2018-05-27 19:40:11.769868+08');
INSERT INTO public.service (id, name, token, description, created_at, updated_at) VALUES ('ab8ad357-ef45-406a-814d-9717ec3e4d79', 'JavLibrary 类别', '1e21f7be-057f-4395-8880-b97aec100ba1', '配置信息请填写类别代码。', '2018-05-27 19:40:11.770199+08', '2018-05-27 19:40:11.770199+08');
INSERT INTO public.service (id, name, token, description, created_at, updated_at) VALUES ('29911a4b-b722-47ea-9ab8-bc15e363c39e', '快递', 'fb28a5c3-e688-4053-8890-c2f41b4edc67', '快递信息追踪，接口由 kuaidi100.com 提供。配置信息请填写用「|」分隔的快递公司名称和快递单号，例如：「yunda|1600887249033」。', '2018-05-27 19:40:11.771411+08', '2018-05-27 19:40:11.771411+08');
INSERT INTO public.service (id, name, token, description, created_at, updated_at) VALUES ('a6e8e177-eb8c-45da-b0fa-a0e8d2ba32ea', '哔哩哔哩番剧', '8c62476c-7f47-44d3-b4c7-a4dac61c6db8', '测试中。配置信息请填写番剧 id。', '2018-05-27 19:40:11.772158+08', '2018-05-27 19:40:11.772158+08');
INSERT INTO public.service (id, name, token, description, created_at, updated_at) VALUES ('8573810f-6559-4cd1-8c0b-7a1e6d6f37fc', 'RSS / Atom / JSON Feed', 'e5220f87-5d47-4e6c-ac42-b9795d1f7787', '测试中。配置信息请填写 Feed 地址。', '2018-05-27 19:40:11.772277+08', '2018-05-27 19:40:11.772277+08');
INSERT INTO public.service (id, name, token, description, created_at, updated_at) VALUES ('20795f67-f430-4fd5-907f-aab38236828b', '测试', 'b6edce94-31b2-4c78-8f2c-dd32786179f0', '测试消息推送渠道，不定时自动创建 Hello World！配置可任意填写。', '2018-05-27 19:40:29.57133+08', '2018-05-27 19:40:29.57133+08');


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: coderfox
--

INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('337db56c-f1b6-4e33-9182-df09620a599c', '2018-05-27 19:39:42.140364+08', '2018-05-27 19:39:42.140364+08', '2018-06-03 19:39:39.295+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('d73e5004-e0e4-4fb6-903b-18929c1523fc', '2018-05-27 19:40:57.20603+08', '2018-05-27 19:40:57.20603+08', '2018-06-03 19:40:54.272+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('302113da-62c2-4a1d-ad1b-d1587c8aea41', '2018-05-28 10:00:54.277729+08', '2018-05-28 10:00:54.277729+08', '2018-06-04 10:00:52.468+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('c799ed87-5e75-43a1-a6d6-7aa8c1a42937', '2018-05-30 07:28:53.053188+08', '2018-05-30 07:28:53.053188+08', '2018-06-06 07:28:53.229+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('cec338d8-7fdf-4a8f-8d21-ec7cba405013', '2018-05-30 12:35:02.619739+08', '2018-05-30 12:35:02.619739+08', '2018-06-06 12:35:02.746+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('4c5dc066-d920-4ea8-823d-e65db0fd5c01', '2018-05-30 12:37:51.470744+08', '2018-05-30 12:37:51.470744+08', '2018-06-06 12:37:51.4+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('b9b1e2b3-322a-4d2d-961f-30c84218aa2d', '2018-05-30 14:10:14.769291+08', '2018-05-30 14:10:14.769291+08', '2018-06-06 14:10:16.28+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('415735e0-1119-48bf-ad9c-e7c4b6e05ea7', '2018-05-30 14:17:11.881929+08', '2018-05-30 14:17:11.881929+08', '2018-06-06 14:17:12.898+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('a129c6e6-f118-430e-ad70-dd3c9092c6e9', '2018-06-15 13:44:28.050643+08', '2018-06-15 13:44:28.050643+08', '2018-06-22 13:44:28.046+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('460f8928-8760-47de-ab96-9b1199c5f2d4', '2018-06-18 13:00:44.996541+08', '2018-06-18 13:00:44.996541+08', '2018-06-25 13:00:44.996541+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('a37c7e2a-d7c9-4ae6-af5d-603fc2969c73', '2018-06-18 15:28:32.134197+08', '2018-06-18 15:29:18.262319+08', '2018-06-18 15:29:18.260928+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('cade8660-4171-4f7d-8d96-bd93d485958c', '2018-06-18 15:29:31.975199+08', '2018-06-18 15:29:31.975199+08', '2018-06-25 15:29:31.975199+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');
INSERT INTO public.session (token, created_at, updated_at, expires_at, user_id, permissions) VALUES ('4f6a0b8c-7f1a-4129-9226-b1f0f4e99606', '2018-06-18 20:58:17.832044+08', '2018-06-18 20:58:21.708704+08', '2018-06-18 20:58:21.707696+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '{}');


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: coderfox
--

INSERT INTO public.subscription (id, config, deleted, created_at, updated_at, owner_id, service_id, name) VALUES ('8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b', 'https://xfox.me/rss.xml', false, '2018-05-30 06:50:55.32793+08', '2018-06-18 15:23:39.574241+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '8573810f-6559-4cd1-8c0b-7a1e6d6f37fc', '小傅Fox的博客');
INSERT INTO public.subscription (id, config, deleted, created_at, updated_at, owner_id, service_id, name) VALUES ('c75f8e52-82f4-4662-8af0-603f13a2bd5d', 'yunda|1600887249033', false, '2018-05-30 06:51:10.305385+08', '2018-06-18 15:23:39.574241+08', '5a52d701-d6e4-40e6-964f-85a5bf6c4039', '29911a4b-b722-47ea-9ab8-bc15e363c39e', '快递测试');


--
-- Data for Name: subscription_event; Type: TABLE DATA; Schema: public; Owner: coderfox
--

INSERT INTO public.subscription_event (id, status, message, updated_at, subscription_id) VALUES ('0ffe5dee-86ff-4a82-9f66-d8fb3751f04a', false, 'Client network socket disconnected before secure TLS connection was established', '2018-05-30 07:05:07.781707+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d');
INSERT INTO public.subscription_event (id, status, message, updated_at, subscription_id) VALUES ('d4db81e1-dd44-49c4-86c0-29133276199b', false, 'Client network socket disconnected before secure TLS connection was established', '2018-05-30 07:05:07.968631+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b');
INSERT INTO public.subscription_event (id, status, message, updated_at, subscription_id) VALUES ('4a6b8189-7cc7-4692-8135-c6cd790b8df1', true, '创建了10条消息undefined', '2018-05-30 07:06:09.46941+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d');
INSERT INTO public.subscription_event (id, status, message, updated_at, subscription_id) VALUES ('0c955570-e9aa-4809-8ea1-7dee939c97ff', true, '创建了75条消息undefined', '2018-05-30 07:06:14.882256+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b');
INSERT INTO public.subscription_event (id, status, message, updated_at, subscription_id) VALUES ('cc9fa064-d3cd-4e3d-b939-28be7b04f2c6', true, '创建了0条消息', '2018-05-30 07:29:03.210709+08', 'c75f8e52-82f4-4662-8af0-603f13a2bd5d');
INSERT INTO public.subscription_event (id, status, message, updated_at, subscription_id) VALUES ('7791fe54-afbc-4441-91b6-f47059c1b9a2', true, '创建了0条消息', '2018-05-30 07:29:03.8546+08', '8f9cf63b-8b72-45d5-97ac-6ee92fc9ef8b');


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: coderfox
--

INSERT INTO public."user" (id, email, password, created_at, updated_at, delete_token, nickname, permissions) VALUES ('5a52d701-d6e4-40e6-964f-85a5bf6c4039', 'i@xfox.me', '$2b$12$GUNKncT/1RvWkBywhoP.o.p7LlNWvttZfMCwb8tKS55U/lMiO9pY2', '2018-05-27 19:39:36.156034+08', '2018-05-27 19:39:36.156034+08', NULL, '小傅Fox', '{}');


--
-- Name: session PK_232f8e85d7633bd6ddfad421696; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "PK_232f8e85d7633bd6ddfad421696" PRIMARY KEY (token);


--
-- Name: service PK_85a21558c006647cd76fdce044b; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY (id);


--
-- Name: subscription_event PK_878b79ef455c948db7f94615990; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.subscription_event
    ADD CONSTRAINT "PK_878b79ef455c948db7f94615990" PRIMARY KEY (id);


--
-- Name: subscription PK_8c3e00ebd02103caa1174cd5d9d; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY (id);


--
-- Name: message PK_ba01f0a3e0123651915008bc578; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: service UQ_c082cd24d53c13d010a11be3dcb; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT "UQ_c082cd24d53c13d010a11be3dcb" UNIQUE (token);


--
-- Name: __diesel_schema_migrations __diesel_schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.__diesel_schema_migrations
    ADD CONSTRAINT __diesel_schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: email_unique_with_deletion; Type: INDEX; Schema: public; Owner: coderfox
--

CREATE UNIQUE INDEX email_unique_with_deletion ON public."user" USING btree (email, delete_token);


--
-- Name: email_unique_without_deletion; Type: INDEX; Schema: public; Owner: coderfox
--

CREATE UNIQUE INDEX email_unique_without_deletion ON public."user" USING btree (email) WHERE (delete_token IS NULL);


--
-- Name: message set_updated_at; Type: TRIGGER; Schema: public; Owner: coderfox
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.message FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: service set_updated_at; Type: TRIGGER; Schema: public; Owner: coderfox
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.service FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: session set_updated_at; Type: TRIGGER; Schema: public; Owner: coderfox
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.session FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: subscription set_updated_at; Type: TRIGGER; Schema: public; Owner: coderfox
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscription FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: subscription_event set_updated_at; Type: TRIGGER; Schema: public; Owner: coderfox
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscription_event FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: user set_updated_at; Type: TRIGGER; Schema: public; Owner: coderfox
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public."user" FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: session FK_30e98e8746699fb9af235410aff; Type: FK CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "FK_30e98e8746699fb9af235410aff" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: message FK_42d48114cb1d2ec951958614cf4; Type: FK CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_42d48114cb1d2ec951958614cf4" FOREIGN KEY (subscription_id) REFERENCES public.subscription(id);


--
-- Name: subscription FK_6fc397c4a3db7320076e7aa1605; Type: FK CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT "FK_6fc397c4a3db7320076e7aa1605" FOREIGN KEY (owner_id) REFERENCES public."user"(id);


--
-- Name: subscription FK_79f599f6ffb8c8e77c031fb2ed4; Type: FK CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT "FK_79f599f6ffb8c8e77c031fb2ed4" FOREIGN KEY (service_id) REFERENCES public.service(id);


--
-- Name: subscription_event FK_9aefe091450823da119950f3290; Type: FK CONSTRAINT; Schema: public; Owner: coderfox
--

ALTER TABLE ONLY public.subscription_event
    ADD CONSTRAINT "FK_9aefe091450823da119950f3290" FOREIGN KEY (subscription_id) REFERENCES public.subscription(id);


--
-- PostgreSQL database dump complete
--

