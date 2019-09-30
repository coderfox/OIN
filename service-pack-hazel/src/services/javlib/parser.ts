import cheerio from "cheerio";
import { resolve } from "url";
import { decode as heDec } from "he";

const decode = (text: string | null) => heDec(text || "");

export const parseVideo = (pageUrl: string, html: string) => {
  const $ = cheerio.load(html);
  const norm = (url: string) => resolve(pageUrl, url);
  const directors: Array<{ name: string, link: string }> = [];
  $("#video_director > table > tbody > tr > td.text > span.director > a")
    .each((_, elem) => directors.push({
      name: decode($(elem).html()),
      link: norm($(elem).attr("href")),
    }));
  const producers: Array<{ name: string, link: string }> = [];
  $("#video_maker > table > tbody > tr > td.text > span.maker > a")
    .each((_, elem) => producers.push({
      name: decode($(elem).html()),
      link: norm($(elem).attr("href")),
    }));
  const publishers: Array<{ name: string, link: string }> = [];
  $("#video_label > table > tbody > tr > td.text > span.label > a")
    .each((_, elem) => publishers.push({
      name: decode($(elem).html()),
      link: norm($(elem).attr("href")),
    }));
  const genres: Array<{ name: string, link: string }> = [];
  $("#video_genres > table > tbody > tr > td.text > span.genre > a")
    .each((_, elem) => genres.push({
      name: decode($(elem).html()),
      link: norm($(elem).attr("href")),
    }));
  const actors: Array<{ name: string, link: string }> = [];
  $("#video_cast > table > tbody > tr > td.text > span.cast > span.star > a")
    .each((_, elem) => actors.push({
      name: decode($(elem).html()),
      link: norm($(elem).attr("href")),
    }));
  return {
    image: $("#video_jacket_img").attr("src"),
    title: decode($("#video_title >> a").html()),
    link: norm($("#video_title >> a").attr("href")),
    id: $("#video_id > table > tbody > tr > td.text").html(),
    release_date: new Date($("#video_date > table > tbody > tr > td.text").html() || Date.now()),
    length: parseInt($("#video_length > table > tbody > tr > td > .text").html() || "0", 10),
    directors,
    producers,
    publishers,
    genres,
    actors,
  };
};

export const parseList = (pageUrl: string, html: string) => {
  const $ = cheerio.load(html);
  const norm = (url: string) => resolve(pageUrl, url);
  const videos: Array<{
    link: string | null,
    full_title: string,
    id: string | null,
    image: string | null,
    title: string,
  }> = [];
  $(".video").map((_, elem) => videos.push({
    link: norm($(elem).find("a").attr("href")),
    full_title: decode($(elem).find("a").attr("title")),
    id: $(elem).find(".id").html(),
    image: $(elem).find("img").attr("src"),
    title: decode($(elem).find(".title").html()),
  }));
  return videos;
};
