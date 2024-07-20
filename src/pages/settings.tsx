import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getAuthToken, setAuthToken } from '@/utils/auth';
import { Article, User } from '@/api/types';
import { useRouter } from 'next/router';

interface Profile {
  username: string;
  bio: string | null;
  image: string;
  following: boolean;
}

interface SettingsProps {
  initialProfile: Profile;
  initialArticles: Article[];
  initialFavoritedArticles: Article[];
}

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Token ${getAuthToken()}`,
    },
  }).then((res) => res.json());

export default function Settings({
  initialProfile,
  initialArticles,
  initialFavoritedArticles,
}: SettingsProps) {
  const router = useRouter();

  const { data: profileData, error: profileError } = useSWR(
    'https://api.realworld.io/api/profiles/bmarvinb',
    fetcher,
    { fallbackData: { profile: initialProfile } }
  );

  const { data: articlesData, error: articlesError } = useSWR(
    'https://api.realworld.io/api/articles?author=bmarvinb&limit=10&offset=0',
    fetcher,
    { fallbackData: { articles: initialArticles } }
  );

  const { data: favoritedArticlesData, error: favoritedArticlesError } = useSWR(
    'https://api.realworld.io/api/articles?favorited=bmarvinb&limit=10&offset=0',
    fetcher,
    { fallbackData: { articles: initialFavoritedArticles } }
  );

  const profile = profileData?.profile;
  const articles = articlesData?.articles || [];
  const favoritedArticles = favoritedArticlesData?.articles || [];

  const [formData, setFormData] = React.useState({
    image: profile.image,
    username: profile.username,
    bio: profile.bio || '',
    email: '', // Assuming email is fetched from a different endpoint or context
    password: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getAuthToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('https://api.realworld.io/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ user: formData }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const { user } = await res.json();
      setAuthToken(user.token); // Update the token if it has changed
      // Optionally, update the local state with the new user data
      setFormData({
        image: user.image,
        username: user.username,
        bio: user.bio || '',
        email: user.email,
        password: '', // Clear the password field
      });

      // Optionally, show a success message or redirect the user
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Optionally, show an error message
      alert('Failed to update profile');
    }
  };

  if (profileError || articlesError || favoritedArticlesError) {
    return <div>Error loading data</div>;
  }

  if (!profileData || !articlesData || !favoritedArticlesData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>

            <ul className="error-messages">
              <li>That name is required</li>
            </ul>

            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Your Name"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control form-control-lg"
                    rows={8}
                    placeholder="Short bio about you"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                  ></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    placeholder="New Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right">
                  Update Settings
                </button>
              </fieldset>
            </form>
            <hr />
            <button className="btn btn-outline-danger">
              Or click here to logout.
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h2 className="text-xs-center">Your Articles</h2>
            {articles.length === 0 ? (
              <p>No articles are here... yet.</p>
            ) : (
              <ul className="article-list">
                {articles.map((article) => (
                  <li key={article.slug} className="article-preview">
                    <div className="article-meta">
                      <Link href={`/profile/${article.author.username}`}>
                        <img
                          src={article.author.image}
                          alt={article.author.username}
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
                    </div>
                    <Link
                      href={`/article/${article.slug}`}
                      className="preview-link"
                    >
                      <h1>{article.title}</h1>
                      <p>{article.description}</p>
                      <span>Read more...</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h2 className="text-xs-center">Favorited Articles</h2>
            {favoritedArticles.length === 0 ? (
              <p>No articles are here... yet.</p>
            ) : (
              <ul className="article-list">
                {favoritedArticles.map((article) => (
                  <li key={article.slug} className="article-preview">
                    <div className="article-meta">
                      <Link href={`/profile/${article.author.username}`}>
                        <img
                          src={article.author.image}
                          alt={article.author.username}
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
                    </div>
                    <Link
                      href={`/article/${article.slug}`}
                      className="preview-link"
                    >
                      <h1>{article.title}</h1>
                      <p>{article.description}</p>
                      <span>Read more...</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
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
      fetch('https://api.realworld.io/api/profiles/bmarvinb', {
        headers: {
          Authorization: `Token ${token}`,
        },
      }),
      fetch(
        'https://api.realworld.io/api/articles?author=bmarvinb&limit=10&offset=0',
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      ),
      fetch(
        'https://api.realworld.io/api/articles?favorited=bmarvinb&limit=10&offset=0',
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      ),
    ]);

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
