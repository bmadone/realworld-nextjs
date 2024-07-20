import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Article, User } from '@/api/types';

interface HomeProps {
  articles: Article[];
  tags: string[];
  user?: User;
}

export default function Home({ articles, tags }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <main>
        <div className="home-page">
          <div className="banner">
            <div className="container">
              <h1 className="logo-font">conduit</h1>
              <p>A place to share your knowledge.</p>
            </div>
          </div>

          <div className="container page">
            <div className="row">
              <div className="col-md-9">
                <div className="feed-toggle">
                  <ul className="nav nav-pills outline-active">
                    <li className="nav-item">
                      <Link className="nav-link" href="">
                        Your Feed
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link active" href="">
                        Global Feed
                      </Link>
                    </li>
                  </ul>
                </div>

                {articles.map((article) => (
                  <div key={article.slug} className="article-preview">
                    <div className="article-meta">
                      <Link href={`/profile/${article.author.username}`}>
                        <Image
                          alt="Avatar"
                          src={article.author.image}
                          width={30}
                          height={26}
                        />
                      </Link>
                      <div className="info">
                        <Link
                          href={`/profile/${article.author.username}`}
                          className="author"
                        >
                          {article.author.username}
                        </Link>
                        <span className="date">
                          {new Date(article.createdAt).toDateString()}
                        </span>
                      </div>
                      <button className="btn btn-outline-primary btn-sm pull-xs-right">
                        <i className="ion-heart"></i> {article.favoritesCount}
                      </button>
                    </div>
                    <Link
                      href={`/article/${article.slug}`}
                      className="preview-link"
                    >
                      <h1>{article.title}</h1>
                      <p>{article.description}</p>
                      <span>Read more...</span>
                      <ul className="tag-list">
                        {article.tagList.map((tag) => (
                          <li
                            key={tag}
                            className="tag-default tag-pill tag-outline"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </Link>
                  </div>
                ))}

                <ul className="pagination">
                  <li className="page-item active">
                    <Link className="page-link" href="">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      2
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="col-md-3">
                <div className="sidebar">
                  <p>Popular Tags</p>

                  <div className="tag-list">
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tag/${tag}`}
                        className="tag-pill tag-default"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [articlesRes, tagsRes] = await Promise.all([
      fetch('https://api.realworld.io/api/articles?limit=10&offset=0'),
      fetch('https://api.realworld.io/api/tags'),
    ]);

    if (!articlesRes.ok || !tagsRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const articlesData = await articlesRes.json();
    const tagsData = await tagsRes.json();

    return {
      props: {
        articles: articlesData.articles,
        tags: tagsData.tags,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        articles: [],
        tags: [],
      },
    };
  }
};
