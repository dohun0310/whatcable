import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/blog/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "en",
      title: "WhatCable Blog",
      subtitle:
        "USB-C cables, Thunderbolt, and the deep weeds of port diagnostics.",
      base: "https://www.whatcable.uk/blog/",
      author: {
        name: "Darryl Morley",
      },
    },
  });

  eleventyConfig.addFilter("stripDatePrefix", (slug) =>
    String(slug).replace(/^\d{4}-\d{2}-\d{2}-/, "")
  );

  eleventyConfig.addFilter("cleanUrl", (url) => {
    const u = String(url);
    if (u === "/") return "/";
    return u.replace(/\/$/, "");
  });

  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString());

  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("./src/blog/posts/**/*.md")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addTransform("stripFeedTrailingSlashes", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith("feed.xml")) {
      return content;
    }
    return content.replace(
      /(https?:\/\/[^\s"<>]+?)\/(?=["<\s])/g,
      "$1"
    );
  });

  eleventyConfig.addPassthroughCopy("src/icon.png");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/screenshot*.webp");
  eleventyConfig.addPassthroughCopy("src/press");

  // Decap CMS lives at /admin. Copy it verbatim (no Nunjucks pass), so the
  // HTML/JS isn't accidentally parsed if it ever contains brace-heavy code.
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addPassthroughCopy("src/admin");

  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
