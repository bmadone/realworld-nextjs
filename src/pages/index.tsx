import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Article, User } from '@/api/types';
import { useUser } from '@/contexts/UserContext';
import React from 'react';
import cookie from 'cookie';
import clsx from 'clsx';
import useSWR from 'swr';
import { getAuthToken } from '@/utils/auth';

interface HomeProps {
  initialArticlesData: { articles: Article[]; articlesCount: number };
  initialFeedData: { articles: Article[]; articlesCount: number };
  tags: string[];
  user?: User;
}

function ArticlesList({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return <div className="article-preview">No articles are here... yet.</div>;
  }
  return articles.map((article) => (
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
          <Link href={`/profile/${article.author.username}`} className="author">
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
      <Link href={`/article/${article.slug}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {article.tagList.map((tag) => (
            <li key={tag} className="tag-default tag-pill tag-outline">
              {tag}
            </li>
          ))}
        </ul>
      </Link>
    </div>
  ));
}

function Pagination({
  currentPage,
  total,
  onPageChange,
}: {
  currentPage: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= 10) {
    return null;
  }
  return (
    <ul className="pagination">
      {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map(
        (page) => (
          <li
            key={page}
            className={clsx('page-item', {
              active: page === currentPage,
            })}
          >
            <Link
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </Link>
          </li>
        )
      )}
    </ul>
  );
}

function Tags({
  tags,
  onTagClick,
}: {
  tags: string[];
  onTagClick: (tag: string) => void;
}) {
  return (
    <div className="sidebar">
      <p>Popular Tags</p>

      <div className="tag-list">
        {tags.map((tag) => (
          <Link
            key={tag}
            href="#"
            className="tag-pill tag-default"
            onClick={(e) => {
              e.preventDefault();
              onTagClick(tag);
            }}
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

function buildUrl(baseUrl: string, params: Record<string, any>) {
  const url = new URL(baseUrl);
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
}

export default function Home({
  initialArticlesData,
  initialFeedData,
  tags,
}: HomeProps) {
  const { user } = useUser();
  const [currentFeed, setCurrentFeed] = React.useState<
    'global' | 'personal' | 'tag'
  >('global');
  const [currentTag, setCurrentTag] = React.useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const offset = (currentPage - 1) * 10;
  const isPersonalFeedSelected = currentFeed === 'personal';
  const url = buildUrl(
    isPersonalFeedSelected
      ? 'https://api.realworld.io/api/articles/feed'
      : 'https://api.realworld.io/api/articles',
    {
      limit: 10,
      offset,
      tag: currentTag,
    }
  );

  const { data, error } = useSWR(
    url,
    () =>
      fetch(url, {
        headers: {
          Authorization: `Token ${getAuthToken()}`,
        },
      }).then((res) => res.json()),
    {
      fallbackData: isPersonalFeedSelected
        ? initialFeedData
        : initialArticlesData,
    }
  );

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
                    {user ? (
                      <li className="nav-item">
                        <Link
                          className={clsx('nav-link', {
                            active: currentFeed === 'personal',
                          })}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentFeed('personal');
                            setCurrentTag(undefined);
                            setCurrentPage(1);
                          }}
                        >
                          Your Feed
                        </Link>
                      </li>
                    ) : null}
                    <li className="nav-item">
                      <Link
                        className={clsx('nav-link', {
                          active: currentFeed === 'global',
                        })}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentFeed('global');
                          setCurrentTag(undefined);
                          setCurrentPage(1);
                        }}
                      >
                        Global Feed
                      </Link>
                    </li>
                    {currentTag ? (
                      <li className="nav-item">
                        <Link
                          href="#"
                          className={clsx('nav-link', {
                            active: currentFeed === 'tag',
                          })}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentFeed('tag');
                            setCurrentPage(1);
                          }}
                        >
                          <i className="ion-pound"></i> {currentTag}
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </div>

                {error ? (
                  <div>Error loading articles</div>
                ) : (
                  <ArticlesList articles={data.articles} />
                )}

                <Pagination
                  currentPage={currentPage}
                  total={data.articlesCount}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              </div>

              <div className="col-md-3">
                <Tags
                  tags={tags}
                  onTagClick={(tag) => {
                    setCurrentTag(tag);
                    setCurrentFeed('tag');
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token || null;

  try {
    const [articlesRes, feedRes, tagsRes] = await Promise.all([
      fetch('https://api.realworld.io/api/articles?limit=10&offset=0'),
      fetch('https://api.realworld.io/api/articles/feed?limit=10&offset=0', {
        headers: token ? { Authorization: `Token ${token}` } : {},
      }),
      fetch('https://api.realworld.io/api/tags'),
    ]);

    if (!articlesRes.ok || !feedRes.ok || !tagsRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const initialArticlesData = await articlesRes.json();
    const initialFeedData = await feedRes.json();
    const tagsData = await tagsRes.json();

    return {
      props: {
        initialArticlesData,
        initialFeedData,
        tags: tagsData.tags,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        initialArticlesData: { articles: [], articlesCount: 0 },
        initialFeedData: { articles: [], articlesCount: 0 },
        tags: [],
      },
    };
  }
};
