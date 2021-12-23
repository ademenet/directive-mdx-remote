import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

function youtubeRemarkPlugin() {
  return (tree, file) => {
    visit(tree, (node) => {
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        if (node.name !== "youtube") return;

        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};
        const id = attributes.id;

        if (node.type === "textDirective")
          file.fail("Text directives for `youtube` not supported", node);
        if (!id) file.fail("Missing video id", node);

        data.hName = "iframe";
        data.hProperties = {
          src: "https://www.youtube.com/embed/" + id,
          width: 200,
          height: 200,
          frameBorder: 0,
          allow: "picture-in-picture",
          allowFullScreen: true,
        };
      }
    });
  };
}

export default function Home({ source }) {
  return (
    <div>
      <MDXRemote {...source} />
    </div>
  );
}

export async function getStaticProps() {
  const markdownContent = `
# Test

::youtube[Video of a cat in a box]{#01ab2cd3efg}
	`;

  const mdxSource = await serialize(markdownContent, {
    mdxOptions: {
      remarkPlugins: [remarkDirective, youtubeRemarkPlugin],
    },
  });

  return {
    props: {
      source: mdxSource,
    },
  };
}
