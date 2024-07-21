import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { getAuthToken } from '@/utils/auth';
import { Article, Author, User } from '@/api/types';
import cookie from 'cookie';
import { useUser } from '@/contexts/UserContext';
import React from 'react';

interface ProfileProps {
  initialProfile: Author;
  initialArticles: Article[];
  initialFavoritedArticles: Article[];
}

interface ProfileData {
  profile: Author;
}

interface ArticleData {
  articles: Article[];
}

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Token ${getAuthToken()}`,
    },
  }).then((res) => res.json());

export default function Profile({
  initialProfile,
  initialArticles,
  initialFavoritedArticles,
}: ProfileProps) {
  const router = useRouter();
  const user = useUser();
  const { username } = router.query;

  const { data: profileData, error: profileError } = useSWR<ProfileData>(
    username ? `https://api.realworld.io/api/profiles/${username}` : null,
    fetcher,
    { fallbackData: { profile: initialProfile } }
  );

  const { data: articlesData, error: articlesError } = useSWR<ArticleData>(
    username
      ? `https://api.realworld.io/api/articles?author=${username}&limit=10&offset=0`
      : null,
    fetcher,
    { fallbackData: { articles: initialArticles } }
  );

  const { data: favoritedArticlesData, error: favoritedArticlesError } =
    useSWR<ArticleData>(
      username
        ? `https://api.realworld.io/api/articles?favorited=${username}&limit=10&offset=0`
        : null,
      fetcher,
      { fallbackData: { articles: initialFavoritedArticles } }
    );

  const profile = profileData?.profile;
  const articles = articlesData?.articles || [];
  const favoritedArticles = favoritedArticlesData?.articles || [];

  const [currentView, setCurrentView] = React.useState<'my' | 'favourite'>(
    'my'
  );

  if (profileError || articlesError || favoritedArticlesError) {
    return <div>Error loading data</div>;
  }

  if (!profileData || !articlesData || !favoritedArticlesData) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <Image
                alt="Avatar"
                src={profile.image}
                className="user-img"
                width={100}
                height={100}
                style={{ display: 'initial' }}
              />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>

              {profile.username === user.user?.username ? (
                <button className="btn btn-sm btn-outline-secondary action-btn">
                  <i className="ion-gear-a"></i>
                  &nbsp; Edit Profile Settings
                </button>
              ) : (
                <button className="btn btn-sm btn-outline-secondary action-btn">
                  <i className="ion-plus-round"></i>
                  &nbsp; Follow {profile.username}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${currentView === 'my' ? 'active' : ''}`}
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView('my');
                    }}
                  >
                    My Articles
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${currentView === 'favourite' ? 'active' : ''}`}
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView('favourite');
                    }}
                  >
                    Favorited Articles
                  </Link>
                </li>
              </ul>
            </div>

            {currentView === 'my'
              ? articles.map((article) => (
                  <div key={article.slug} className="article-preview">
                    <div className="article-meta">
                      <Link href={`/profile/${article.author.username}`}>
                        <Image
                          width={50}
                          height={50}
                          alt="Alt"
                          src={article.author.image}
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
                ))
              : null}

            {currentView === 'favourite'
              ? favoritedArticles.map((article) => (
                  <div key={article.slug} className="article-preview">
                    <div className="article-meta">
                      <Link href={`/profile/${article.author.username}`}>
                        <Image
                          width={50}
                          height={50}
                          alt="Alt"
                          src={article.author.image}
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
                ))
              : null}

            {/* Implement pagination */}
            {/* <ul className="pagination">
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
            </ul> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const { username } = params as { username: string };
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token || null;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const [profileRes, articlesRes, favoritedArticlesRes] = await Promise.all([
      fetch(`https://api.realworld.io/api/profiles/${username}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      }),
      fetch(
        `https://api.realworld.io/api/articles?author=${username}&limit=10&offset=0`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      ),
      fetch(
        `https://api.realworld.io/api/articles?favorited=${username}&limit=10&offset=0`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      ),
    ]);

    if (profileRes.status === 404) {
      return {
        redirect: {
          destination: '/404',
          permanent: false,
        },
      };
    }

    if (!profileRes.ok || !articlesRes.ok || !favoritedArticlesRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const { profile } = await profileRes.json();
    const { articles } = await articlesRes.json();
    const { articles: favoritedArticles } = await favoritedArticlesRes.json();

    return {
      props: {
        initialProfile: profile,
        initialArticles: articles,
        initialFavoritedArticles: favoritedArticles,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        initialProfile: {
          username: '',
          bio: '',
          image: '',
          following: false,
        },
        initialArticles: [],
        initialFavoritedArticles: [],
      },
    };
  }
};
