import * as React from 'react';
import { Link, graphql } from 'gatsby';
import { get } from 'lodash';
import { Grid, Card, Container, Segment, Comment } from 'semantic-ui-react';

import { MarkdownRemarkConnection, MarkdownRemark } from '@/graphql-types';
import TagsCard from '@/components/TagsCard';
import BlogPagination from '@/components/Pagination';
import { withLayout, LayoutProps } from '@/components/Layout';

interface BlogProps extends LayoutProps {
  data: {
    tags: MarkdownRemarkConnection;
    posts: MarkdownRemarkConnection;
  };

  pageContext: {
    tag?: string;
  };
}

const BlogPage = (props: BlogProps) => {
  const tags = props.data.tags.group;
  const posts = props.data.posts.edges;
  const { pathname } = props.location;
  const pageCount = Math.ceil(props.data.posts.totalCount / 10);

  const Posts = (
    <Container>
      {posts.map(({ node }: { node: MarkdownRemark }) => {
        const {
          frontmatter,
          timeToRead,
          fields: { slug },
          excerpt,
        } = node;
        const author = frontmatter.author;
        const { avatar } = author;
        const githubAddress = `https://github.com/${author.github}`;
        const cover = get(frontmatter, 'image.children.0.fixed', {});
        const extra = (
          <Comment.Group>
            <Comment>
              <a href={githubAddress} target="_blank">
                <img
                  className="main-page__post-contents-footer__avatar-image"
                  src={avatar.childImageSharp.fixed.src}
                  alt="Avatar"
                  srcSet={avatar.childImageSharp.fixed.srcSet}
                />
              </a>
              <Comment.Content>
                <Comment.Author style={{ fontWeight: 400 }}>
                  {frontmatter.author.id}
                </Comment.Author>
                <Comment.Metadata style={{ margin: 0 }}>
                  {frontmatter.createdDate}
                </Comment.Metadata>
              </Comment.Content>
            </Comment>
          </Comment.Group>
        );

        const description = <Card.Description>{excerpt}</Card.Description>;

        return (
          <Link to={slug}>
            <Card
              key={slug}
              fluid
              image={cover}
              header={frontmatter.title}
              extra={extra}
              description={description}
            />
          </Link>
        );
      })}
    </Container>
  );

  return (
    <Container>
      <Segment vertical>
        <Grid padded style={{ justifyContent: 'center' }}>
          <div style={{ maxWidth: 600 }}>
            {Posts}
            <Segment vertical textAlign="center">
              <BlogPagination
                Link={Link}
                pathname={pathname}
                pageCount={pageCount}
              />
            </Segment>
          </div>
          {/* <div style={{ maxWidth: 250 }}>
            <TagsCard Link={Link} tags={tags} tag={props.pageContext.tag} />
          </div> */}
        </Grid>
      </Segment>
    </Container>
  );
};

export default withLayout(BlogPage);

export const pageQuery = graphql`
  query PageBlog2 {
    # Get tags
    tags: allMarkdownRemark(filter: { frontmatter: { draft: { ne: true } } }) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }

    # Get posts
    posts: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___createdDate] }
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/blog/" }
      }
      limit: 5
    ) {
      totalCount
      edges {
        node {
          excerpt
          timeToRead
          fields {
            slug
          }
          frontmatter {
            title
            updatedDate(formatString: "DD MMMM, YYYY")
            createdDate(formatString: "DD MMMM, YYYY")
            author {
              id
              github
              avatar {
                childImageSharp {
                  fixed(width: 35, height: 35) {
                    src
                    srcSet
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
